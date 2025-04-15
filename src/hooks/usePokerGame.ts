import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { GameDifficulty, GamePhase, RoundResult } from '@/types/poker';
import { createDeck } from '@/utils/pokerUtils';
import { useAnte } from '@/hooks/poker/useAnte';
import { useCutDeck } from '@/hooks/poker/useCutDeck';
import { useBetting } from '@/hooks/poker/useBetting';
import { useCardSwap } from '@/hooks/poker/useCardSwap';
import { useShowdown } from '@/hooks/poker/useShowdown';

export const usePokerGame = (initialDifficulty: string = 'beginner') => {
  const difficulty = initialDifficulty as GameDifficulty;
  
  const [roundsWon, setRoundsWon] = useState({ player: 0, opponent: 0 });
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [playerMessage, setPlayerMessage] = useState<string | null>(null);
  const [opponentMessage, setOpponentMessage] = useState<string | null>(null);
  const [showOpponentCards, setShowOpponentCards] = useState(false);
  const [winningHand, setWinningHand] = useState<string | null>(null);
  const [cutAmount, setCutAmount] = useState(5);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const [gameState, setGameState] = useState({
    deck: createDeck(),
    playerHand: [],
    opponentHand: [],
    communityCards: [],
    pot: 0,
    playerChips: parseInt(localStorage.getItem('pokerChips') || '1000'),
    opponentChips: 1000,
    currentBet: 0,
    playerTurn: true,
    gamePhase: 'start' as GamePhase,
    winner: null,
    anteAmount: difficulty === 'beginner' ? 5 : difficulty === 'intermediate' ? 10 : 20,
    currentRound: 1,
    totalRounds: 5,
    lastRoundWinner: null,
    cutDeckAmount: 0
  });

  useEffect(() => {
    const storedRounds = localStorage.getItem('pokerRounds');
    if (storedRounds) {
      const rounds = JSON.parse(storedRounds);
      const wins = rounds.reduce((acc: { player: number, opponent: number }, round: RoundResult) => {
        if (round.winner === 'player') acc.player++;
        if (round.winner === 'opponent') acc.opponent++;
        return acc;
      }, { player: 0, opponent: 0 });
      setRoundsWon(wins);
    }
  }, []);

  const saveRoundData = (result: RoundResult) => {
    setRoundResults(prev => [...prev, result]);
    
    if (result.winner === 'player') {
      setRoundsWon(prev => ({ ...prev, player: prev.player + 1 }));
    } else if (result.winner === 'opponent') {
      setRoundsWon(prev => ({ ...prev, opponent: prev.opponent + 1 }));
    }
  };

  const updateLocalStorage = (chips: number) => {
    localStorage.setItem('pokerChips', chips.toString());
  };

  const initializeGame = () => {
    localStorage.removeItem('pokerRounds');
    setRoundsWon({ player: 0, opponent: 0 });
    const newDeck = createDeck();
    console.log("Initializing new game with deck length:", newDeck.length);
    setGameState(prev => ({
      ...prev,
      deck: newDeck,
      playerHand: [],
      opponentHand: [],
      communityCards: [],
      pot: 0,
      currentBet: 0,
      playerTurn: true,
      gamePhase: 'start' as GamePhase,
      winner: null,
      currentRound: 1,
      lastRoundWinner: null,
      cutDeckAmount: 0
    }));
    setSelectedCards([]);
  };

  const handleOpponentTurn = (phase: GamePhase) => {
    if (gameState.playerTurn || gameState.winner) return;
    
    if (phase === 'firstBet' || phase === 'secondBet') {
      handleOpponentBetting(phase);
    } else if (phase === 'swap') {
      handleOpponentCardSwap();
    } else if (phase === 'showdown') {
      handleShowdown();
    }
  };

  const handleOpponentBetting = (phase: GamePhase) => {
    console.log(`Opponent betting in phase: ${phase}`);
  };

  const handleOpponentCardSwap = () => {
    console.log('Opponent swapping cards');
  };

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
    updateLocalStorage,
    saveRoundData,
    roundsWon,
    () => {
      if (roundsWon.player > roundsWon.opponent) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      setShowResults(true);
    }
  );

  useEffect(() => {
    if (gameState.deck.length === 0) {
      const newDeck = createDeck();
      console.log("Initializing deck in useEffect with length:", newDeck.length);
      setGameState(prev => ({
        ...prev,
        deck: newDeck
      }));
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
    roundsWon,
    roundResults,
    showResults,
    setShowResults,
    handleAnte,
    handleCutDeck,
    handleBetAction,
    handleCardSwap,
    handleCardSelect,
    handleNextRound,
    handlePlayAgain,
    handleShowdown,
    handleCutAmountChange
  };
};
