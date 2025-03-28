
import { useState, useEffect } from 'react';
import { GameDifficulty, GamePhase } from '@/types/poker';
import { useGameState } from './poker/useGameState';
import { useAnteAndCutDeck } from './poker/useAnteAndCutDeck';
import { useBetting } from './poker/useBetting';
import { useCardSwap } from './poker/useCardSwap';
import { useOpponentAI } from './poker/useOpponentAI';
import { useShowdown } from './poker/useShowdown';
import { createDeck } from '@/utils/pokerUtils';

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

  // Set up opponent AI
  const { handleOpponentTurn } = useOpponentAI({
    gameState,
    setGameState,
    setOpponentMessage,
    setPlayerMessage,
    setShowOpponentCards,
    updateLocalStorage,
    setWinningHand
  });

  // Set up ante and cut deck logic
  const { handleAnte, handleCutDeck, handleCutAmountChange: setCutAmountHandler } = useAnteAndCutDeck({
    gameState,
    setGameState,
    setPlayerMessage,
    setOpponentMessage,
    updateLocalStorage
  });

  // Set up betting logic
  const { handleBetAction } = useBetting({
    gameState,
    setGameState,
    setPlayerMessage,
    setOpponentMessage,
    updateLocalStorage,
    setShowOpponentCards,
    handleOpponentTurn
  });

  // Set up card swapping logic
  const { handleCardSwap, handleCardSelect } = useCardSwap({
    gameState,
    setGameState,
    selectedCards,
    setSelectedCards,
    setPlayerMessage,
    handleOpponentTurn
  });

  // Set up showdown and round progression
  const { handleNextRound } = useShowdown({
    gameState,
    setGameState,
    setShowOpponentCards,
    setPlayerMessage,
    setOpponentMessage,
    setWinningHand,
    updateLocalStorage
  });

  // Handle cut amount changes
  const handleCutAmountChange = (amount: number) => {
    setCutAmount(amount);
    setCutAmountHandler(amount);
  };

  // Handle play again (reset game)
  const handlePlayAgain = () => {
    initializeGame();
  };

  // Initialize game on first load
  useEffect(() => {
    if (gameState.deck.length === 0) {
      initializeGame();
    }
  }, []);

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
