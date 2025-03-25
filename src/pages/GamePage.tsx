
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Card, GameState, GamePhase, BetAction, Hand, GameDifficulty } from '@/types/poker';
import { createDeck, dealCards, shuffleDeck, compareHands, getAICardSwapIndices, getAIBetAmount, getHandRank } from '@/utils/pokerUtils';
import PokerTable from '@/components/PokerTable';
import GameControls from '@/components/GameControls';
import PlayingCard from '@/components/PlayingCard';
import ChipCounter from '@/components/ChipCounter';

const GamePage = () => {
  const { difficulty = 'beginner' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roomCode = queryParams.get('room');
  
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
    anteAmount: difficulty === 'beginner' ? 50 : difficulty === 'intermediate' ? 100 : 200
  });
  
  const [showOpponentCards, setShowOpponentCards] = useState(false);
  const [playerMessage, setPlayerMessage] = useState<string | null>(null);
  const [opponentMessage, setOpponentMessage] = useState<string | null>(null);
  const [winningHand, setWinningHand] = useState<string | null>(null);
  
  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);
  
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
      winner: null
    }));
    setSelectedCards([]);
    setShowOpponentCards(false);
    setPlayerMessage(null);
    setOpponentMessage(null);
    setWinningHand(null);
  };
  
  // Handle ante placement
  const handleAnte = (amount: number) => {
    if (gameState.playerChips < amount) {
      toast.error("Not enough chips to place ante!");
      return;
    }
    
    // Deduct ante from player and opponent chips
    const playerChips = gameState.playerChips - amount;
    const opponentChips = gameState.opponentChips - amount;
    
    // Add antes to pot
    const pot = gameState.pot + (amount * 2);
    
    // Update game state
    setGameState(prev => ({
      ...prev,
      playerChips,
      opponentChips,
      pot,
      gamePhase: 'ante',
    }));
    
    // Update localStorage
    localStorage.setItem('pokerChips', playerChips.toString());
    
    // Dispatch event to update chip counter
    const event = new CustomEvent('chipUpdate', { detail: { chips: playerChips } });
    window.dispatchEvent(event);
    
    setPlayerMessage("Ante placed!");
    setOpponentMessage("Ante placed!");
  };
  
  // Handle cutting the deck
  const handleCutDeck = () => {
    // Shuffle the deck
    const shuffledDeck = shuffleDeck(gameState.deck);
    
    // Deal 5 cards to each player
    const { cards: playerCards, remainingDeck: deck1 } = dealCards(shuffledDeck, 5);
    const { cards: opponentCards, remainingDeck: deck2 } = dealCards(deck1, 5);
    
    // Update game state
    setGameState(prev => ({
      ...prev,
      deck: deck2,
      playerHand: playerCards,
      opponentHand: opponentCards,
      gamePhase: 'firstBet',
      playerTurn: Math.random() > 0.5, // Randomly decide who goes first
    }));
    
    setPlayerMessage("Cards dealt!");
    
    // If opponent's turn, let them make a move after a delay
    if (!gameState.playerTurn) {
      setTimeout(() => {
        handleOpponentTurn('firstBet');
      }, 2000);
    }
  };
  
  // Handle player's bet action (fold, call, raise)
  const handleBetAction = (action: BetAction, amount?: number) => {
    if (!gameState.playerTurn) return;
    
    let newGameState = { ...gameState };
    
    if (action === 'fold') {
      // Player loses their bets, opponent wins the pot
      newGameState.winner = 'opponent';
      newGameState.opponentChips += newGameState.pot;
      newGameState.gamePhase = 'gameOver';
      setShowOpponentCards(true);
      setPlayerMessage("You folded.");
      setOpponentMessage("Opponent wins!");
    } 
    else if (action === 'call') {
      // Player matches the current bet
      if (newGameState.currentBet > 0) {
        if (newGameState.playerChips < newGameState.currentBet) {
          toast.error("Not enough chips to call!");
          return;
        }
        
        newGameState.playerChips -= newGameState.currentBet;
        newGameState.pot += newGameState.currentBet;
        setPlayerMessage(`Called ${newGameState.currentBet}`);
      } else {
        setPlayerMessage("Checked");
      }
      
      newGameState.currentBet = 0;
      newGameState.playerTurn = false;
    }
    else if (action === 'raise' && amount) {
      // Player raises the bet
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
    
    // If it's the first betting round and betting is complete, move to swap phase
    if (newGameState.gamePhase === 'firstBet' && !newGameState.playerTurn && !newGameState.winner) {
      if (newGameState.currentBet === 0) {
        newGameState.gamePhase = 'swap';
        newGameState.playerTurn = true;
      }
    }
    
    // If it's the second betting round and betting is complete, move to showdown
    if (newGameState.gamePhase === 'secondBet' && !newGameState.playerTurn && !newGameState.winner) {
      if (newGameState.currentBet === 0) {
        newGameState.gamePhase = 'showdown';
        handleShowdown(newGameState);
        return;
      }
    }
    
    // Update game state and localStorage
    setGameState(newGameState);
    localStorage.setItem('pokerChips', newGameState.playerChips.toString());
    
    // Dispatch event to update chip counter
    const event = new CustomEvent('chipUpdate', { detail: { chips: newGameState.playerChips } });
    window.dispatchEvent(event);
    
    // If it's now opponent's turn, let them make a move after a delay
    if (!newGameState.playerTurn && !newGameState.winner) {
      setTimeout(() => {
        handleOpponentTurn(newGameState.gamePhase);
      }, 2000);
    }
  };
  
  // Handle opponent's turn
  const handleOpponentTurn = (phase: GamePhase) => {
    if (gameState.playerTurn || gameState.winner) return;
    
    let newGameState = { ...gameState };
    
    if (phase === 'firstBet' || phase === 'secondBet') {
      // Opponent decides to fold, call, or raise based on hand strength
      const handStrength = getHandRank(newGameState.opponentHand).rank;
      
      // Fold on very weak hands (small probability)
      const shouldFold = Math.random() < 0.1 && handStrength <= 1 && newGameState.currentBet > 0;
      
      if (shouldFold) {
        // Opponent folds
        newGameState.winner = 'player';
        newGameState.playerChips += newGameState.pot;
        newGameState.gamePhase = 'gameOver';
        setShowOpponentCards(true);
        setOpponentMessage("Opponent folded!");
        setPlayerMessage("You win!");
      } 
      else if (newGameState.currentBet > 0) {
        // Calculate if opponent should raise or just call
        const shouldRaise = Math.random() < 0.3 + (handStrength * 0.05);
        
        if (shouldRaise && newGameState.opponentChips > newGameState.currentBet * 2) {
          // Opponent raises
          const raiseAmount = getAIBetAmount(
            newGameState.opponentHand, 
            newGameState.pot, 
            difficulty as string, 
            newGameState.opponentChips
          );
          
          newGameState.opponentChips -= raiseAmount;
          newGameState.pot += raiseAmount;
          newGameState.currentBet = raiseAmount;
          newGameState.playerTurn = true;
          setOpponentMessage(`Raised ${raiseAmount}`);
        } else {
          // Opponent calls
          newGameState.opponentChips -= newGameState.currentBet;
          newGameState.pot += newGameState.currentBet;
          newGameState.currentBet = 0;
          
          if (phase === 'firstBet') {
            newGameState.gamePhase = 'swap';
            newGameState.playerTurn = true;
          } else {
            newGameState.gamePhase = 'showdown';
          }
          
          setOpponentMessage(`Called ${gameState.currentBet}`);
        }
      } 
      else {
        // No bet to call, opponent can check or bet
        const shouldBet = Math.random() < 0.4 + (handStrength * 0.05);
        
        if (shouldBet) {
          // Opponent bets
          const betAmount = getAIBetAmount(
            newGameState.opponentHand, 
            newGameState.pot, 
            difficulty as string, 
            newGameState.opponentChips
          );
          
          newGameState.opponentChips -= betAmount;
          newGameState.pot += betAmount;
          newGameState.currentBet = betAmount;
          newGameState.playerTurn = true;
          setOpponentMessage(`Bet ${betAmount}`);
        } else {
          // Opponent checks
          if (phase === 'firstBet') {
            newGameState.gamePhase = 'swap';
            newGameState.playerTurn = true;
          } else {
            newGameState.gamePhase = 'showdown';
          }
          
          setOpponentMessage("Checked");
        }
      }
      
      // If moving to showdown, handle it
      if (newGameState.gamePhase === 'showdown') {
        handleShowdown(newGameState);
        return;
      }
    } 
    else if (phase === 'swap') {
      // Opponent decides which cards to swap
      const cardIndicesToSwap = getAICardSwapIndices(newGameState.opponentHand, difficulty as string);
      
      if (cardIndicesToSwap.length > 0) {
        // Swap cards
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
      
      // Move to second betting round
      newGameState.gamePhase = 'secondBet';
      newGameState.playerTurn = true;
    }
    
    // Update game state
    setGameState(newGameState);
  };
  
  // Handle card swap
  const handleCardSwap = () => {
    if (selectedCards.length === 0) return;
    
    // Swap selected cards
    const newPlayerHand = [...gameState.playerHand];
    let newDeck = [...gameState.deck];
    
    for (const index of selectedCards) {
      const { cards, remainingDeck } = dealCards(newDeck, 1);
      newPlayerHand[index] = cards[0];
      newDeck = remainingDeck;
    }
    
    // Update game state
    setGameState(prev => ({
      ...prev,
      playerHand: newPlayerHand,
      deck: newDeck,
      gamePhase: 'secondBet',
      playerTurn: false,
    }));
    
    setSelectedCards([]);
    setPlayerMessage(`Swapped ${selectedCards.length} card${selectedCards.length > 1 ? 's' : ''}`);
    
    // Let opponent make their move after a delay
    setTimeout(() => {
      handleOpponentTurn('swap');
    }, 2000);
  };
  
  // Handle showdown (compare hands)
  const handleShowdown = (currentState: GameState) => {
    setShowOpponentCards(true);
    
    const result = compareHands(currentState.playerHand, currentState.opponentHand);
    const playerHandRank = getHandRank(currentState.playerHand);
    const opponentHandRank = getHandRank(currentState.opponentHand);
    
    let winner: 'player' | 'opponent' | 'tie' | null = null;
    
    if (result === 'hand1') {
      winner = 'player';
      currentState.playerChips += currentState.pot;
      setPlayerMessage("You win!");
      setOpponentMessage("Opponent loses!");
      setWinningHand(`You won with ${playerHandRank.name}`);
    } 
    else if (result === 'hand2') {
      winner = 'opponent';
      currentState.opponentChips += currentState.pot;
      setPlayerMessage("You lose!");
      setOpponentMessage("Opponent wins!");
      setWinningHand(`Opponent won with ${opponentHandRank.name}`);
    } 
    else {
      winner = 'tie';
      const halfPot = Math.floor(currentState.pot / 2);
      currentState.playerChips += halfPot;
      currentState.opponentChips += halfPot;
      setPlayerMessage("It's a tie!");
      setOpponentMessage("It's a tie!");
      setWinningHand(`Tie with ${playerHandRank.name}`);
    }
    
    // Update localStorage
    localStorage.setItem('pokerChips', currentState.playerChips.toString());
    
    // Dispatch event to update chip counter
    const event = new CustomEvent('chipUpdate', { detail: { chips: currentState.playerChips } });
    window.dispatchEvent(event);
    
    // Update game state
    currentState.winner = winner;
    currentState.gamePhase = 'gameOver';
    setGameState(currentState);
  };
  
  // Handle card selection for swapping
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
  
  // Handle play again
  const handlePlayAgain = () => {
    initializeGame();
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 py-10 px-4">
      <ChipCounter />
      
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-4 mb-8"
        >
          <button 
            onClick={() => navigate('/')}
            className="bg-black/40 p-2 rounded-full hover:bg-black/60 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <h1 className="text-3xl font-bold">
            {roomCode 
              ? `Multiplayer Game (Room: ${roomCode})` 
              : `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Game`}
          </h1>
        </motion.div>
        
        {/* Game Messages */}
        <div className="flex justify-between mb-6">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="7" r="4" />
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Opponent ({gameState.opponentChips} chips)</p>
              {opponentMessage && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={opponentMessage}
                  className="text-white font-medium"
                >
                  {opponentMessage}
                </motion.p>
              )}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div>
              <p className="text-sm text-zinc-500 text-right">You ({gameState.playerChips} chips)</p>
              {playerMessage && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={playerMessage}
                  className="text-white font-medium text-right"
                >
                  {playerMessage}
                </motion.p>
              )}
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </motion.div>
        </div>
        
        {/* Poker Table */}
        <PokerTable
          playerHand={gameState.playerHand}
          opponentHand={gameState.opponentHand}
          showOpponentCards={showOpponentCards}
          selectedCards={selectedCards}
          pot={gameState.pot}
          onCardSelect={handleCardSelect}
          playerBet={0}
          opponentBet={0}
          className="mb-8"
        >
          <GameControls
            gamePhase={gameState.gamePhase}
            onAnte={handleAnte}
            onCutDeck={handleCutDeck}
            onBetAction={handleBetAction}
            onSwapCards={handleCardSwap}
            onPlayAgain={handlePlayAgain}
            playerChips={gameState.playerChips}
            anteAmount={gameState.anteAmount}
            currentBet={gameState.currentBet}
            minRaise={gameState.anteAmount}
            selectedCards={selectedCards}
            className="max-w-md mx-auto"
          />
        </PokerTable>
        
        {/* Hand Result */}
        {winningHand && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-md rounded-xl p-4 text-center max-w-md mx-auto"
          >
            <h3 className="text-xl font-bold text-poker-gold mb-2">{winningHand}</h3>
            <p className="text-zinc-400">Play again for another chance to win!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GamePage;
