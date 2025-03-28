
import { useState } from 'react';
import { GameState, GameDifficulty } from '@/types/poker';
import { createDeck } from '@/utils/pokerUtils';

export const useGameState = (initialDifficulty: string = 'beginner') => {
  const difficulty = initialDifficulty as GameDifficulty;
  
  const [gameState, setGameState] = useState<GameState>({
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
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  
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
  
  const updateLocalStorage = (chips: number) => {
    localStorage.setItem('pokerChips', chips.toString());
    const event = new CustomEvent('chipUpdate', { detail: { chips } });
    window.dispatchEvent(event);
  };

  return {
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
  };
};
