
import { toast } from 'sonner';
import { GameState } from '@/types/poker';
import { compareHands, getHandRank } from '@/utils/pokerUtils';

export const handleShowdown = (
  currentState: GameState,
  setShowOpponentCards: React.Dispatch<React.SetStateAction<boolean>>,
  setPlayerMessage: React.Dispatch<React.SetStateAction<string | null>>,
  setOpponentMessage: React.Dispatch<React.SetStateAction<string | null>>,
  updateLocalStorage: (chips: number) => void,
  setWinningHand?: React.Dispatch<React.SetStateAction<string | null>>
) => {
  setShowOpponentCards(true);
  
  const result = compareHands(currentState.playerHand, currentState.opponentHand);
  const playerHandRank = getHandRank(currentState.playerHand);
  const opponentHandRank = getHandRank(currentState.opponentHand);
  
  let roundWinner: 'player' | 'opponent' | 'tie' | null = null;
  
  if (result === 'hand1') {
    roundWinner = 'player';
    currentState.playerChips += currentState.pot;
    setPlayerMessage("You win this round!");
    setOpponentMessage("Opponent loses!");
    setWinningHand && setWinningHand(`You won with ${playerHandRank.name}`);
  } 
  else if (result === 'hand2') {
    roundWinner = 'opponent';
    currentState.opponentChips += currentState.pot;
    setPlayerMessage("You lose this round!");
    setOpponentMessage("Opponent wins!");
    setWinningHand && setWinningHand(`Opponent won with ${opponentHandRank.name}`);
  } 
  else {
    roundWinner = 'tie';
    const halfPot = Math.floor(currentState.pot / 2);
    currentState.playerChips += halfPot;
    currentState.opponentChips += halfPot;
    setPlayerMessage("It's a tie!");
    setOpponentMessage("It's a tie!");
    setWinningHand && setWinningHand(`Tie with ${playerHandRank.name}`);
  }
  
  updateLocalStorage(currentState.playerChips);
  
  currentState.lastRoundWinner = roundWinner === 'tie' ? currentState.lastRoundWinner : roundWinner;
  currentState.gamePhase = 'roundOver';
  
  if (currentState.currentRound >= currentState.totalRounds) {
    currentState.gamePhase = 'gameOver';
    
    if (currentState.playerChips > currentState.opponentChips) {
      currentState.winner = 'player';
    } else if (currentState.opponentChips > currentState.playerChips) {
      currentState.winner = 'opponent';
    } else {
      currentState.winner = 'tie';
    }
  }
  
  return currentState;
};

interface UseShowdownProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  setShowOpponentCards: React.Dispatch<React.SetStateAction<boolean>>;
  setPlayerMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setOpponentMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setWinningHand: React.Dispatch<React.SetStateAction<string | null>>;
  updateLocalStorage: (chips: number) => void;
}

export const useShowdown = ({
  gameState,
  setGameState,
  setShowOpponentCards,
  setPlayerMessage,
  setOpponentMessage,
  setWinningHand,
  updateLocalStorage
}: UseShowdownProps) => {
  
  const handleNextRound = () => {
    if (gameState.gamePhase !== 'roundOver') return;
    
    if (gameState.playerChips < gameState.anteAmount) {
      toast.error("Not enough chips for the next round's ante!");
      return { redirect: true, to: '/buy-chips' };
    }
    
    if (gameState.opponentChips < gameState.anteAmount) {
      toast.success("You've cleaned out your opponent! Game over.");
      setGameState(prev => ({
        ...prev,
        gamePhase: 'gameOver',
        winner: 'player'
      }));
      return { redirect: false };
    }
    
    const newDeck = createDeck();
    
    setGameState(prev => ({
      ...prev,
      deck: newDeck,
      playerHand: [],
      opponentHand: [],
      communityCards: [],
      pot: 0,
      currentBet: 0,
      gamePhase: 'start',
      winner: null,
      currentRound: prev.currentRound + 1
    }));
    
    setSelectedCards([]);
    setShowOpponentCards(false);
    setPlayerMessage(`Round ${gameState.currentRound + 1} of ${gameState.totalRounds}`);
    setOpponentMessage(null);
    setWinningHand(null);
    
    return { redirect: false };
  };
  
  return {
    handleNextRound
  };
};
