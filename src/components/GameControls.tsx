
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';
import { BetAction, GamePhase } from '@/types/poker';

interface GameControlsProps {
  gamePhase: GamePhase;
  onAnte?: (amount: number) => void;
  onCutDeck?: () => void;
  onBetAction?: (action: BetAction, amount?: number) => void;
  onSwapCards?: () => void;
  onPlayAgain?: () => void;
  playerChips: number;
  anteAmount: number;
  currentBet: number;
  minRaise?: number;
  selectedCards?: number[];
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
  selectedCards = [],
  className
}: GameControlsProps) => {
  const [betAmount, setBetAmount] = useState(minRaise);
  
  const handleAnte = () => {
    if (onAnte) onAnte(anteAmount);
  };
  
  const handleBetAction = (action: BetAction) => {
    if (onBetAction) {
      if (action === 'raise') {
        onBetAction(action, betAmount);
      } else {
        onBetAction(action);
      }
    }
  };
  
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
            className="w-full bg-gradient-to-r from-poker-red to-red-600 hover:from-red-600 hover:to-red-700 text-white py-6 text-lg font-bold"
          >
            Place Ante ({anteAmount} chips)
          </Button>
        </motion.div>
      )}
      
      {gamePhase === 'ante' && (
        <motion.div variants={item}>
          <Button 
            onClick={onCutDeck}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-6 text-lg font-bold"
          >
            Cut the Deck
          </Button>
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
              disabled={currentBet === 0}
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
            <span className="text-white/60">Min: {minRaise}</span>
            <Slider
              value={[betAmount]}
              min={minRaise}
              max={Math.min(playerChips, minRaise * 10)}
              step={minRaise}
              onValueChange={(value) => setBetAmount(value[0])}
              className="flex-1"
            />
            <span className="text-white/60">Max: {Math.min(playerChips, minRaise * 10)}</span>
          </motion.div>
        </motion.div>
      )}
      
      {gamePhase === 'swap' && (
        <motion.div variants={item}>
          <Button 
            onClick={onSwapCards}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white py-6 text-lg font-bold"
            disabled={selectedCards.length === 0}
          >
            {selectedCards.length > 0 
              ? `Swap ${selectedCards.length} Card${selectedCards.length > 1 ? 's' : ''}` 
              : 'Select Cards to Swap'}
          </Button>
        </motion.div>
      )}
      
      {gamePhase === 'gameOver' && (
        <motion.div variants={item}>
          <Button 
            onClick={onPlayAgain}
            className="w-full bg-gradient-to-r from-poker-gold to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black py-6 text-lg font-bold"
          >
            Play Again
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GameControls;
