
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Card, 
  GameState, 
  BetAction, 
  GamePhase,
  GameDifficulty
} from '@/types/poker';
import { 
  createDeck, 
  dealCards, 
  compareHands, 
  getAICardSwapIndices, 
  getAIBetAmount, 
  getHandRank 
} from '@/utils/pokerUtils';

export const usePokerGame = (initialDifficulty: string = 'beginner') => {
  const difficulty = initialDifficulty as GameDifficulty;
  
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
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
  
  const handleCutDeck = () => {
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
    
    if (!(gameState.currentRound === 1 || gameState.lastRoundWinner === 'player')) {
      setTimeout(() => {
        handleOpponentTurn('firstBet');
      }, 2000);
    }
  };
  
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
          handleShowdown(newGameState);
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
            difficulty as string, 
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
            difficulty as string, 
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
        handleShowdown(newGameState);
        return;
      }
    } 
    else if (phase === 'swap') {
      const cardIndicesToSwap = getAICardSwapIndices(newGameState.opponentHand, difficulty as string);
      
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
  
  const handleCardSwap = () => {
    if (gameState.gamePhase !== 'swap') return;
    
    const cardsToSwap = selectedCards.length;
    if (cardsToSwap === 0) {
      setPlayerMessage("Kept all cards");
      
      setGameState(prev => ({
        ...prev,
        gamePhase: 'secondBet',
        playerTurn: cardsToSwap > 0 ? false : prev.currentRound === 1 || prev.lastRoundWinner === 'player',
      }));
      
      if (!(gameState.currentRound === 1 || gameState.lastRoundWinner === 'player') && cardsToSwap === 0) {
        setTimeout(() => {
          handleOpponentTurn('secondBet');
        }, 2000);
      }
      
      return;
    }
    
    const newPlayerHand = [...gameState.playerHand];
    let newDeck = [...gameState.deck];
    
    for (const index of selectedCards) {
      const { cards, remainingDeck } = dealCards(newDeck, 1);
      newPlayerHand[index] = cards[0];
      newDeck = remainingDeck;
    }
    
    setGameState(prev => ({
      ...prev,
      playerHand: newPlayerHand,
      deck: newDeck,
      gamePhase: 'secondBet',
      playerTurn: prev.currentRound === 1 || prev.lastRoundWinner === 'player',
    }));
    
    setSelectedCards([]);
    setPlayerMessage(`Swapped ${selectedCards.length} card${selectedCards.length > 1 ? 's' : ''}`);
    
    if (!(gameState.currentRound === 1 || gameState.lastRoundWinner === 'player')) {
      setTimeout(() => {
        handleOpponentTurn('secondBet');
      }, 2000);
    }
  };
  
  const handleShowdown = (currentState: GameState) => {
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
      setWinningHand(`You won with ${playerHandRank.name}`);
    } 
    else if (result === 'hand2') {
      roundWinner = 'opponent';
      currentState.opponentChips += currentState.pot;
      setPlayerMessage("You lose this round!");
      setOpponentMessage("Opponent wins!");
      setWinningHand(`Opponent won with ${opponentHandRank.name}`);
    } 
    else {
      roundWinner = 'tie';
      const halfPot = Math.floor(currentState.pot / 2);
      currentState.playerChips += halfPot;
      currentState.opponentChips += halfPot;
      setPlayerMessage("It's a tie!");
      setOpponentMessage("It's a tie!");
      setWinningHand(`Tie with ${playerHandRank.name}`);
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
    
    setGameState(currentState);
  };
  
  const handleCardSelect = (index: number) => {
    if (gameState.gamePhase !== 'swap') return;
    
    setSelectedCards(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };
  
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
    handleCutDeck,
    handleBetAction,
    handleCardSwap,
    handleCardSelect,
    handleNextRound,
    handlePlayAgain: initializeGame,
    handleCutAmountChange
  };
};
