import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';
import { BetAction, GamePhase } from '@/types/poker';
import { toast } from 'sonner';

interface GameControlsProps {
  gamePhase: GamePhase;
  onAnte?: () => void;
  onCutDeck?: () => void;
  onBetAction?: (action: BetAction, amount?: number) => void;
  onSwapCards?: () => void;
  onPlayAgain?: () => void;
  playerChips: number;
  anteAmount: number;
  currentBet: number;
  minRaise?: number;
  maxRaise?: number;
  selectedCards?: number[];
  cutAmount?: number;
  onCutAmountChange?: (amount: number) => void;
  playAgainLabel?: string;
  className?: string;
}

const GameControls = ({ 
  gamePhase,
  onAnte,
  onCutDeck,
  onBetAction,
  onSwapCards,
  onPlayAgain,
  playerChips,
  anteAmount,
  currentBet,
  minRaise = 10,
  maxRaise = 30,
  selectedCards = [],
  cutAmount = 3,
  onCutAmountChange,
  playAgainLabel = "Play Again",
  className
}: GameControlsProps) => {
  const [betAmount, setBetAmount] = useState(minRaise);
  const [localCutAmount, setLocalCutAmount] = useState(cutAmount);
  
  useEffect(() => {
    console.log("GameControls: Game phase changed to:", gamePhase);
  }, [gamePhase]);
  
  const handleAnte = () => {
    console.log("Ante button clicked, function exists:", !!onAnte);
    if (onAnte) {
      toast.success("Placing ante...");
      onAnte();
    } else {
      toast.error("Ante function not available");
      console.error("onAnte function is not defined");
    }
  };
  
  const handleCutDeck = () => {
    console.log("Cut deck button clicked, function exists:", !!onCutDeck);
    if (onCutDeck) {
      toast.success("Cutting deck...");
      onCutDeck();
    } else {
      toast.error("Cut deck function not available");
    }
  };
  
  const handleBetAction = (action: BetAction) => {
    console.log(`Bet action: ${action}, function exists:`, !!onBetAction);
    if (onBetAction) {
      if (action === 'raise') {
        toast.success(`Raising ${betAmount} chips`);
        onBetAction(action, betAmount);
      } else {
        toast.success(action === 'fold' ? "Folding" : action === 'call' ? (currentBet > 0 ? "Calling" : "Checking") : "");
        onBetAction(action);
      }
    } else {
      toast.error("Bet action function not available");
    }
  };
  
  const handleCutAmountChange = (value: number[]) => {
    setLocalCutAmount(value[0]);
    if (onCutAmountChange) onCutAmountChange(value[0]);
  };
  
  console.log("Current game phase:", gamePhase);
  console.log("Player chips:", playerChips);
  console.log("Ante amount:", anteAmount);
  
  const container = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div 
      className={className}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {gamePhase === 'start' && (
        <motion.div variants={item}>
          <Button 
            onClick={handleAnte}
            className="w-full bg-gradient-to-r from-poker-red to-red-600 hover:from-red-600 hover:to-red-700 text-white py-6 text-lg font-bold relative shine-effect"
            disabled={playerChips < anteAmount}
          >
            Place Ante ({anteAmount} chips)
            <div className="button-shine"></div>
          </Button>
          {playerChips < anteAmount && (
            <p className="text-red-500 text-center mt-2">Not enough chips! Visit the shop to buy more.</p>
          )}
        </motion.div>
      )}
      
      {gamePhase === 'cutDeck' && (
        <motion.div variants={container} className="space-y-4">
          <motion.div variants={item} className="flex items-center gap-4 text-sm">
            <span className="text-white/60">Cards to cut:</span>
            <Slider
              value={[localCutAmount]}
              min={1}
              max={10}
              step={1}
              onValueChange={handleCutAmountChange}
              className="flex-1"
            />
            <span className="text-white/60 min-w-[20px] text-center">{localCutAmount}</span>
          </motion.div>
          
          <motion.div variants={item}>
            <Button 
              onClick={handleCutDeck}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-6 text-lg font-bold"
            >
              Cut the Deck
            </Button>
          </motion.div>
        </motion.div>
      )}
      
      {(gamePhase === 'firstBet' || gamePhase === 'secondBet') && (
        <motion.div 
          variants={container}
          className="grid grid-cols-1 gap-4"
        >
          <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <Button 
              onClick={() => handleBetAction('fold')}
              className="bg-zinc-800 hover:bg-zinc-700 text-white"
            >
              Fold
            </Button>
            
            <Button 
              onClick={() => handleBetAction('call')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {currentBet > 0 ? `Call (${currentBet})` : 'Check'}
            </Button>
            
            <Button 
              onClick={() => handleBetAction('raise')}
              className="bg-green-600 hover:bg-green-700 text-white col-span-2 lg:col-span-1"
            >
              Raise ({betAmount})
            </Button>
          </motion.div>
          
          <motion.div variants={item} className="flex items-center gap-4 text-sm">
            <span className="text-white/60 min-w-[40px]">Min: {minRaise}</span>
            <Slider
              value={[betAmount]}
              min={minRaise}
              max={Math.min(playerChips, maxRaise)}
              step={5}
              onValueChange={(value) => setBetAmount(value[0])}
              className="flex-1"
            />
            <span className="text-white/60 min-w-[40px]">Max: {Math.min(playerChips, maxRaise)}</span>
          </motion.div>
        </motion.div>
      )}
      
      {gamePhase === 'swap' && (
        <motion.div variants={item}>
          <Button 
            onClick={onSwapCards}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white py-6 text-lg font-bold"
          >
            {selectedCards.length > 0 
              ? `Swap ${selectedCards.length} Card${selectedCards.length > 1 ? 's' : ''}` 
              : 'Keep All Cards'}
          </Button>
        </motion.div>
      )}
      
      {(gamePhase === 'roundOver' || gamePhase === 'gameOver') && (
        <motion.div variants={item}>
          <Button 
            onClick={onPlayAgain}
            className="w-full bg-gradient-to-r from-poker-gold to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black py-6 text-lg font-bold"
          >
            {playAgainLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GameControls;
