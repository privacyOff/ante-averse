
import { createDeck } from '@/utils/pokerUtils';
import { useGameState } from './useGameState';
import { useAnteAndCutDeck } from './useAnteAndCutDeck';
import { useBetting } from './useBetting';
import { useCardSwap } from './useCardSwap';
import { useShowdown } from './useShowdown';
import { useOpponentAI } from './useOpponentAI';
import { BetAction, GamePhase } from '@/types/poker';
import { useState } from 'react';

export const usePokerGame = (initialDifficulty: string = 'beginner') => {
  const {
    gameState,
    setGameState,
    showOpponentCards,
    setShowOpponentCards,
    playerMessage,
    setPlayerMessage,
    opponentMessage,
    setOpponentMessage,
    winningHand,
    setWinningHand,
    cutAmount,
    setCutAmount,
    selectedCards,
    setSelectedCards,
    initializeGame,
    updateLocalStorage
  } = useGameState(initialDifficulty);
  
  // Create a circular reference safe way to access the opponent AI handler
  const [opponentTurnHandler, setOpponentTurnHandler] = useState<(phase: GamePhase) => void>(() => () => {});
  
  // Initialize the opponent AI hook
  const { handleOpponentTurn } = useOpponentAI({
    gameState,
    setGameState,
    setOpponentMessage,
    setPlayerMessage,
    setShowOpponentCards,
    updateLocalStorage,
    setWinningHand
  });
  
  // Set the opponent turn handler after initialization
  useState(() => {
    setOpponentTurnHandler(() => handleOpponentTurn);
  });
  
  const { handleAnte, handleCutDeck } = useAnteAndCutDeck({
    gameState,
    setGameState,
    setPlayerMessage,
    setOpponentMessage,
    updateLocalStorage
  });
  
  const { handleBetAction } = useBetting({
    gameState,
    setGameState,
    setPlayerMessage,
    setOpponentMessage,
    updateLocalStorage,
    setShowOpponentCards,
    handleOpponentTurn: opponentTurnHandler
  });
  
  const { handleCardSwap, handleCardSelect } = useCardSwap({
    gameState,
    setGameState,
    selectedCards,
    setSelectedCards,
    setPlayerMessage,
    handleOpponentTurn: opponentTurnHandler
  });
  
  const { handleNextRound } = useShowdown({
    gameState,
    setGameState,
    setShowOpponentCards,
    setPlayerMessage,
    setOpponentMessage,
    setWinningHand,
    updateLocalStorage
  });
  
  const handleCutAmountChange = (amount: number) => {
    setCutAmount(amount);
  };
  
  return {
    gameState,
    selectedCards,
    showOpponentCards,
    playerMessage,
    opponentMessage,
    winningHand,
    cutAmount,
    handleAnte,
    handleCutDeck: () => handleCutDeck(cutAmount),
    handleBetAction,
    handleCardSwap,
    handleCardSelect,
    handleNextRound,
    handlePlayAgain: initializeGame,
    handleCutAmountChange
  };
};

export default usePokerGame;
