
import { GamePhase, GameState } from '@/types/poker';
import { getHandRank, getAIBetAmount, getAICardSwapIndices, dealCards } from '@/utils/pokerUtils';
import { handleShowdown } from './useShowdown';

interface UseOpponentAIProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  setOpponentMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setPlayerMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setShowOpponentCards: React.Dispatch<React.SetStateAction<boolean>>;
  updateLocalStorage: (chips: number) => void;
  setWinningHand: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useOpponentAI = ({
  gameState,
  setGameState,
  setOpponentMessage,
  setPlayerMessage,
  setShowOpponentCards,
  updateLocalStorage,
  setWinningHand
}: UseOpponentAIProps) => {
  
  const handleOpponentTurn = (phase: GamePhase) => {
    if (gameState.playerTurn || gameState.winner) return;
    
    let newGameState = { ...gameState };
    
    if (phase === 'firstBet' || phase === 'secondBet') {
      const handStrength = getHandRank(newGameState.opponentHand).rank;
      
      const shouldFold = Math.random() < 0.1 && handStrength <= 1 && newGameState.currentBet > 0;
      
      if (shouldFold) {
        newGameState.winner = 'player';
        newGameState.playerChips += newGameState.pot;
        newGameState.gamePhase = 'roundOver';
        newGameState.lastRoundWinner = 'player';
        setShowOpponentCards(true);
        setOpponentMessage("Opponent folded!");
        setPlayerMessage("You win this round!");
      } 
      else if (newGameState.currentBet > 0) {
        const shouldRaise = Math.random() < 0.3 + (handStrength * 0.05);
        
        if (shouldRaise && newGameState.opponentChips > newGameState.currentBet * 2) {
          const minBet = phase === 'firstBet' ? newGameState.anteAmount : newGameState.anteAmount * 2;
          const maxBet = phase === 'firstBet' ? newGameState.anteAmount * 3 : newGameState.anteAmount * 6;
          
          let raiseAmount = getAIBetAmount(
            newGameState.opponentHand, 
            newGameState.pot, 
            newGameState.anteAmount === 5 ? 'beginner' : newGameState.anteAmount === 10 ? 'intermediate' : 'legend', 
            newGameState.opponentChips
          );
          
          raiseAmount = Math.max(minBet, Math.min(raiseAmount, maxBet));
          
          newGameState.opponentChips -= raiseAmount;
          newGameState.pot += raiseAmount;
          newGameState.currentBet = raiseAmount;
          newGameState.playerTurn = true;
          setOpponentMessage(`Raised ${raiseAmount}`);
        } else {
          newGameState.opponentChips -= newGameState.currentBet;
          newGameState.pot += newGameState.currentBet;
          newGameState.currentBet = 0;
          
          if (phase === 'firstBet') {
            newGameState.gamePhase = 'swap';
            newGameState.playerTurn = gameState.currentRound === 1 || gameState.lastRoundWinner === 'player';
          } else {
            newGameState.gamePhase = 'showdown';
          }
          
          setOpponentMessage(`Called ${gameState.currentBet}`);
        }
      } 
      else {
        const shouldBet = Math.random() < 0.4 + (handStrength * 0.05);
        
        if (shouldBet) {
          const minBet = phase === 'firstBet' ? newGameState.anteAmount : newGameState.anteAmount * 2;
          const maxBet = phase === 'firstBet' ? newGameState.anteAmount * 3 : newGameState.anteAmount * 6;
          
          let betAmount = getAIBetAmount(
            newGameState.opponentHand, 
            newGameState.pot, 
            newGameState.anteAmount === 5 ? 'beginner' : newGameState.anteAmount === 10 ? 'intermediate' : 'legend',
            newGameState.opponentChips
          );
          
          betAmount = Math.max(minBet, Math.min(betAmount, maxBet));
          
          newGameState.opponentChips -= betAmount;
          newGameState.pot += betAmount;
          newGameState.currentBet = betAmount;
          newGameState.playerTurn = true;
          setOpponentMessage(`Bet ${betAmount}`);
        } else {
          if (phase === 'firstBet') {
            newGameState.gamePhase = 'swap';
            newGameState.playerTurn = gameState.currentRound === 1 || gameState.lastRoundWinner === 'player';
          } else {
            newGameState.gamePhase = 'showdown';
          }
          
          setOpponentMessage("Checked");
        }
      }
      
      if (newGameState.gamePhase === 'showdown') {
        handleShowdown(
          newGameState, 
          setShowOpponentCards, 
          setPlayerMessage, 
          setOpponentMessage, 
          updateLocalStorage,
          setWinningHand
        );
        setGameState(newGameState);
        return;
      }
    } 
    else if (phase === 'swap') {
      const difficulty = newGameState.anteAmount === 5 ? 'beginner' : 
                        newGameState.anteAmount === 10 ? 'intermediate' : 'legend';
      const cardIndicesToSwap = getAICardSwapIndices(newGameState.opponentHand, difficulty);
      
      if (cardIndicesToSwap.length > 0) {
        const newOpponentHand = [...newGameState.opponentHand];
        const newDeck = [...newGameState.deck];
        
        for (const index of cardIndicesToSwap) {
          const { cards, remainingDeck } = dealCards(newDeck, 1);
          newOpponentHand[index] = cards[0];
          newDeck.splice(0, 1);
        }
        
        newGameState.opponentHand = newOpponentHand;
        newGameState.deck = newDeck;
        setOpponentMessage(`Swapped ${cardIndicesToSwap.length} card${cardIndicesToSwap.length > 1 ? 's' : ''}`);
      } else {
        setOpponentMessage("Kept all cards");
      }
      
      newGameState.gamePhase = 'secondBet';
      newGameState.playerTurn = gameState.currentRound === 1 || gameState.lastRoundWinner === 'player';
      
      if (!newGameState.playerTurn) {
        setGameState(newGameState);
        setTimeout(() => {
          handleOpponentTurn('secondBet');
        }, 2000);
        return;
      }
    }
    
    setGameState(newGameState);
  };
  
  return {
    handleOpponentTurn
  };
};
