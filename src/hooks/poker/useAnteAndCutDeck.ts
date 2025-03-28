
import { toast } from 'sonner';
import { GameState } from '@/types/poker';
import { dealCards } from '@/utils/pokerUtils';

interface UseAnteAndCutDeckProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  setPlayerMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setOpponentMessage: React.Dispatch<React.SetStateAction<string | null>>;
  updateLocalStorage: (chips: number) => void;
}

export const useAnteAndCutDeck = ({
  gameState,
  setGameState,
  setPlayerMessage,
  setOpponentMessage,
  updateLocalStorage
}: UseAnteAndCutDeckProps) => {
  
  const handleAnte = () => {
    const anteAmount = gameState.anteAmount;
    
    if (gameState.playerChips < anteAmount) {
      toast.error("Not enough chips to place ante!");
      return;
    }
    
    const playerChips = gameState.playerChips - anteAmount;
    const opponentChips = gameState.opponentChips - anteAmount;
    
    const pot = gameState.pot + (anteAmount * 2);
    
    setGameState(prev => ({
      ...prev,
      playerChips,
      opponentChips,
      pot,
      gamePhase: 'cutDeck',
    }));
    
    updateLocalStorage(playerChips);
    
    setPlayerMessage("Ante placed!");
    setOpponentMessage("Ante placed!");
    
    console.log("Game phase updated to: cutDeck");
  };
  
  const handleCutDeck = (cutAmount: number) => {
    console.log("handleCutDeck called with cutAmount:", cutAmount);
    
    if (cutAmount < 1 || cutAmount > 10) {
      toast.error("Cut amount must be between 1 and 10");
      return;
    }
    
    let deckAfterCut = [...gameState.deck];
    console.log("Initial deck length:", deckAfterCut.length);
    
    if (gameState.currentRound === 1 || gameState.lastRoundWinner === 'player') {
      const topCards = deckAfterCut.slice(0, cutAmount);
      const remainingCards = deckAfterCut.slice(cutAmount);
      deckAfterCut = [...remainingCards, ...topCards];
      console.log("After player cut, deck length:", deckAfterCut.length);
      
      setPlayerMessage(`Cut ${cutAmount} cards`);
      
      const aiCutAmount = Math.floor(Math.random() * 5) + 1;
      const aiTopCards = deckAfterCut.slice(0, aiCutAmount);
      const aiRemainingCards = deckAfterCut.slice(aiCutAmount);
      deckAfterCut = [...aiRemainingCards, ...aiTopCards];
      console.log("After AI cut, deck length:", deckAfterCut.length);
      
      setOpponentMessage(`Cut ${aiCutAmount} cards`);
    } else {
      const aiCutAmount = Math.floor(Math.random() * 5) + 1;
      const aiTopCards = deckAfterCut.slice(0, aiCutAmount);
      const aiRemainingCards = deckAfterCut.slice(aiCutAmount);
      deckAfterCut = [...aiRemainingCards, ...aiTopCards];
      console.log("After AI cut, deck length:", deckAfterCut.length);
      
      setOpponentMessage(`Cut ${aiCutAmount} cards`);
      
      const topCards = deckAfterCut.slice(0, cutAmount);
      const remainingCards = deckAfterCut.slice(cutAmount);
      deckAfterCut = [...remainingCards, ...topCards];
      console.log("After player cut, deck length:", deckAfterCut.length);
      
      setPlayerMessage(`Cut ${cutAmount} cards`);
    }
    
    console.log("Dealing cards from deck of length:", deckAfterCut.length);
    const { cards: playerCards, remainingDeck: deck1 } = dealCards(deckAfterCut, 5);
    console.log("Player cards dealt:", playerCards.length);
    console.log("Remaining deck length after player cards:", deck1.length);
    
    const { cards: opponentCards, remainingDeck: deck2 } = dealCards(deck1, 5);
    console.log("Opponent cards dealt:", opponentCards.length);
    console.log("Final remaining deck length:", deck2.length);
    
    setGameState(prev => ({
      ...prev,
      deck: deck2,
      playerHand: playerCards,
      opponentHand: opponentCards,
      gamePhase: 'firstBet',
      playerTurn: gameState.currentRound === 1 || gameState.lastRoundWinner === 'player',
      cutDeckAmount: cutAmount
    }));
    
    toast.success("Deck cut successfully! Moving to betting phase...");
    
    return !(gameState.currentRound === 1 || gameState.lastRoundWinner === 'player');
  };
  
  const handleCutAmountChange = (amount: number) => {
    // This function is implemented elsewhere and passed as a prop
    // It's included here for API completeness
  };
  
  return {
    handleAnte,
    handleCutDeck,
    handleCutAmountChange
  };
};
