
import { toast } from 'sonner';
import { BetAction, GamePhase, GameState } from '@/types/poker';
import { handleShowdown } from './useShowdown';

interface UseBettingProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  setPlayerMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setOpponentMessage: React.Dispatch<React.SetStateAction<string | null>>;
  updateLocalStorage: (chips: number) => void;
  setShowOpponentCards: React.Dispatch<React.SetStateAction<boolean>>;
  handleOpponentTurn: (phase: GamePhase) => void;
}

export const useBetting = ({
  gameState,
  setGameState,
  setPlayerMessage,
  setOpponentMessage,
  updateLocalStorage,
  setShowOpponentCards,
  handleOpponentTurn
}: UseBettingProps) => {
  
  const handleBetAction = (action: BetAction, amount?: number) => {
    console.log(`handleBetAction called with action: ${action}, amount: ${amount}`);
    console.log(`Current gameState:`, {
      playerTurn: gameState.playerTurn,
      gamePhase: gameState.gamePhase,
      playerChips: gameState.playerChips,
      currentBet: gameState.currentBet,
      pot: gameState.pot
    });
    
    if (!gameState.playerTurn) {
      console.log("Not player's turn, ignoring bet action");
      return;
    }
    
    let newGameState = { ...gameState };
    
    if (action === 'fold') {
      console.log("Player folded");
      newGameState.winner = 'opponent';
      newGameState.opponentChips += newGameState.pot;
      newGameState.gamePhase = 'roundOver';
      newGameState.lastRoundWinner = 'opponent';
      setShowOpponentCards(true);
      setPlayerMessage("You folded.");
      setOpponentMessage("Opponent wins this round!");
    } 
    else if (action === 'call') {
      if (newGameState.currentBet > 0) {
        console.log(`Player called bet of ${newGameState.currentBet}`);
        if (newGameState.playerChips < newGameState.currentBet) {
          toast.error("Not enough chips to call!");
          return;
        }
        
        newGameState.playerChips -= newGameState.currentBet;
        newGameState.pot += newGameState.currentBet;
        setPlayerMessage(`Called ${newGameState.currentBet}`);
      } else {
        console.log("Player checked (no current bet)");
        setPlayerMessage("Checked");
      }
      
      newGameState.playerTurn = false;
      newGameState.currentBet = 0; // Reset the current bet after a call
    }
    else if (action === 'raise' && amount) {
      console.log(`Player raised by ${amount}`);
      const minBet = newGameState.gamePhase === 'firstBet' ? newGameState.anteAmount : newGameState.anteAmount * 2;
      const maxBet = newGameState.gamePhase === 'firstBet' ? newGameState.anteAmount * 3 : newGameState.anteAmount * 6;
      
      if (amount < minBet) {
        toast.error(`Minimum bet is ${minBet} chips!`);
        return;
      }
      
      if (amount > maxBet) {
        toast.error(`Maximum bet is ${maxBet} chips!`);
        return;
      }
      
      if (newGameState.playerChips < amount) {
        toast.error("Not enough chips to raise!");
        return;
      }
      
      newGameState.playerChips -= amount;
      newGameState.pot += amount;
      newGameState.currentBet = amount;
      newGameState.playerTurn = false;
      setPlayerMessage(`Raised ${amount}`);
    }
    
    console.log("After bet action, checking for phase transition...");
    
    // Check for phase transitions
    if ((newGameState.gamePhase === 'firstBet' || newGameState.gamePhase === 'secondBet') && 
        !newGameState.playerTurn && !newGameState.winner) {
      
      if (newGameState.currentBet === 0) {
        if (newGameState.gamePhase === 'firstBet') {
          console.log("First betting round complete with no pending bets, moving to swap phase");
          newGameState.gamePhase = 'swap';
          newGameState.playerTurn = true;
        } else if (newGameState.gamePhase === 'secondBet') {
          console.log("Second betting round complete with no pending bets, moving to showdown");
          newGameState.gamePhase = 'showdown';
          handleShowdown(newGameState, setShowOpponentCards, setPlayerMessage, setOpponentMessage, updateLocalStorage);
          setGameState(newGameState);
          return;
        }
      }
    }
    
    console.log("Setting new game state:", newGameState);
    setGameState(newGameState);
    updateLocalStorage(newGameState.playerChips);
    
    if (!newGameState.playerTurn && !newGameState.winner) {
      console.log("Player turn complete, scheduling opponent turn");
      setTimeout(() => {
        handleOpponentTurn(newGameState.gamePhase);
      }, 2000);
    }
  };
  
  return {
    handleBetAction
  };
};
