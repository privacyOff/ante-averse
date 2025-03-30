
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { GameDifficulty } from '@/types/poker';
import { createDeck } from '@/utils/pokerUtils';
import { useAnte } from './poker/useAnte';
import { useCutDeck } from './poker/useCutDeck';
import { useBetting } from './poker/useBetting';
import { useCardSwap } from './poker/useCardSwap';
import { useShowdown } from './poker/useShowdown';

export const usePokerGame = (initialDifficulty: string = 'beginner') => {
  const difficulty = initialDifficulty as GameDifficulty;
  
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [gameState, setGameState] = useState({
    deck: [],
    playerHand: [],
    opponentHand: [],
    communityCards: [],
    pot: 0,
    playerChips: parseInt(localStorage.getItem('pokerChips') || '1000'),
    opponentChips: 1000,
    currentBet: 0,
    playerTurn: true,
    gamePhase: 'start',
    winner: null,
    anteAmount: difficulty === 'beginner' ? 5 : difficulty === 'intermediate' ? 10 : 20,
    currentRound: 1,
    totalRounds: 5,
    lastRoundWinner: null,
    cutDeckAmount: 0
  });
  
  const [showOpponentCards, setShowOpponentCards] = useState(false);
  const [playerMessage, setPlayerMessage] = useState<string | null>(null);
  const [opponentMessage, setOpponentMessage] = useState<string | null>(null);
  const [winningHand, setWinningHand] = useState<string | null>(null);
  const [cutAmount, setCutAmount] = useState<number>(3);
  
  useEffect(() => {
    initializeGame();
  }, []);
  
  const updateLocalStorage = (chips: number) => {
    localStorage.setItem('pokerChips', chips.toString());
    const event = new CustomEvent('chipUpdate', { detail: { chips } });
    window.dispatchEvent(event);
  };
  
  const initializeGame = () => {
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
      currentRound: 1,
      lastRoundWinner: null,
      cutDeckAmount: 0
    }));
    setSelectedCards([]);
    setShowOpponentCards(false);
    setPlayerMessage(null);
    setOpponentMessage(null);
    setWinningHand(null);
  };
  
  const handleOpponentTurn = (phase: any) => {
    // This is a placeholder that will call the appropriate phase handler
    if (gameState.playerTurn || gameState.winner) return;
    
    if (phase === 'firstBet' || phase === 'secondBet') {
      handleOpponentBetting(phase);
    } else if (phase === 'swap') {
      handleOpponentCardSwap();
    }
  };
  
  const handleOpponentBetting = (phase: any) => {
    // This would be implemented in useBetting but we're adding a simplified version here
    console.log(`Opponent betting in phase: ${phase}`);
  };
  
  const handleOpponentCardSwap = () => {
    // This would be implemented in useCardSwap but we're adding a simplified version here
    console.log('Opponent swapping cards');
  };
  
  // Import functions from the separate hook files
  const { handleAnte } = useAnte(
    gameState,
    setGameState,
    setPlayerMessage,
    setOpponentMessage,
    updateLocalStorage
  );
  
  const { handleCutDeck, handleCutAmountChange } = useCutDeck(
    gameState,
    setGameState,
    setPlayerMessage,
    setOpponentMessage,
    handleOpponentTurn,
    cutAmount,
    setCutAmount
  );
  
  const { handleBetAction } = useBetting(
    gameState,
    setGameState,
    setPlayerMessage,
    setOpponentMessage,
    handleOpponentTurn,
    setShowOpponentCards,
    updateLocalStorage
  );
  
  const { handleCardSwap, handleCardSelect } = useCardSwap(
    gameState,
    setGameState,
    selectedCards,
    setSelectedCards,
    setPlayerMessage,
    handleOpponentTurn
  );
  
  const { handleShowdown, handleNextRound, handlePlayAgain } = useShowdown(
    gameState,
    setGameState,
    setShowOpponentCards,
    setPlayerMessage,
    setOpponentMessage,
    setWinningHand,
    selectedCards,
    setSelectedCards,
    updateLocalStorage
  );
  
  return {
    gameState,
    selectedCards,
    showOpponentCards,
    playerMessage,
    opponentMessage,
    winningHand,
    cutAmount,
    handleAnte,
    handleCutDeck,
    handleBetAction,
    handleCardSwap,
    handleCardSelect,
    handleNextRound,
    handlePlayAgain,
    handleCutAmountChange
  };
};
