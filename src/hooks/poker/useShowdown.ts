import { GameState, GamePhase } from '@/types/poker';
import { compareHands, createDeck, getHandRank } from '@/utils/pokerUtils';

export const handleShowdown = (
  newGameState: GameState,
  setShowOpponentCards: React.Dispatch<React.SetStateAction<boolean>>,
  setPlayerMessage: React.Dispatch<React.SetStateAction<string | null>>,
  setOpponentMessage: React.Dispatch<React.SetStateAction<string | null>>,
  updateLocalStorage: (chips: number) => void,
  setWinningHand?: React.Dispatch<React.SetStateAction<string | null>>
) => {
  setShowOpponentCards(true);
  
  const playerHand = newGameState.playerHand;
  const opponentHand = newGameState.opponentHand;
  
  const playerHandRank = getHandRank(playerHand);
  const opponentHandRank = getHandRank(opponentHand);
  
  const winner = compareHands(playerHand, opponentHand);
  
  let winningMessage = '';
  if (winner === 'player') {
    newGameState.playerChips += newGameState.pot;
    winningMessage = `You win with ${playerHandRank.name}!`;
    newGameState.lastRoundWinner = 'player';
  } else if (winner === 'hand2') {
    newGameState.opponentChips += newGameState.pot;
    winningMessage = `Opponent wins with ${opponentHandRank.name}!`;
    newGameState.lastRoundWinner = 'opponent';
  } else {
    newGameState.playerChips += newGameState.pot / 2;
    newGameState.opponentChips += newGameState.pot / 2;
    winningMessage = 'It\'s a tie!';
    newGameState.lastRoundWinner = null;
  }
  
  newGameState.winner = winner === 'player' ? 'player' : winner === 'hand2' ? 'opponent' : 'tie';
  newGameState.gamePhase = 'roundOver';
  
  setPlayerMessage(winningMessage);
  setOpponentMessage(winningMessage);
  
  if (setWinningHand) {
    if (winner === 'player') {
      setWinningHand(playerHandRank.name);
    } else if (winner === 'hand2') {
      setWinningHand(opponentHandRank.name);
    } else {
      setWinningHand('Tie');
    }
  }
  
  updateLocalStorage(newGameState.playerChips);
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
    
    if (gameState.currentRound >= gameState.totalRounds) {
      const finalWinner = gameState.playerChips > gameState.opponentChips 
        ? 'player' : gameState.opponentChips > gameState.playerChips 
        ? 'opponent' : 'tie';
      
      setGameState(prev => ({
        ...prev,
        gamePhase: 'gameOver',
        winner: finalWinner
      }));
      
      if (finalWinner === 'player') {
        setPlayerMessage("You won the game!");
        setOpponentMessage("Game over!");
      } else if (finalWinner === 'opponent') {
        setPlayerMessage("Game over!");
        setOpponentMessage("Opponent won the game!");
      } else {
        setPlayerMessage("Game ended in a tie!");
        setOpponentMessage("Game ended in a tie!");
      }
      
      return;
    }
    
    // If player is broke, they can't continue
    if (gameState.playerChips < gameState.anteAmount) {
      setPlayerMessage("Not enough chips to continue!");
      return { redirect: true };
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
      playerTurn: true,
      gamePhase: 'start',
      winner: null,
      currentRound: prev.currentRound + 1
    }));
    
    setShowOpponentCards(false);
    setPlayerMessage(null);
    setOpponentMessage(null);
    setWinningHand(null);
    
    return { redirect: false };
  };
  
  return {
    handleNextRound
  };
};
