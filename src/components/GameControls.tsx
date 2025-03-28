
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BetAction, GamePhase } from '@/types/poker';
import { toast } from 'sonner';
import AnteButton from './game/AnteButton';
import CutDeckControl from './game/CutDeckControl';
import ActionButtons from './game/ActionButtons';
import BetSlider from './game/BetSlider';
import SwapButton from './game/SwapButton';
import PlayAgainButton from './game/PlayAgainButton';

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
  
  useEffect(() => {
    console.log("GameControls: Game phase changed to:", gamePhase);
    console.log("GameControls: onBetAction exists:", !!onBetAction);
    console.log("GameControls: Current bet:", currentBet);
    console.log("GameControls: Min/Max raise:", minRaise, maxRaise);
  }, [gamePhase, onBetAction, currentBet, minRaise, maxRaise]);
  
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
  
  const handleLocalBetAction = (action: BetAction, amount?: number) => {
    console.log("GameControls: handleLocalBetAction called with", action, amount);
    if (onBetAction) {
      onBetAction(action, amount);
    } else {
      console.error("onBetAction function is not defined in GameControls");
      toast.error("Bet action handler not available");
    }
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
          <AnteButton 
            onAnte={onAnte}
            anteAmount={anteAmount}
            playerChips={playerChips}
          />
        </motion.div>
      )}
      
      {gamePhase === 'cutDeck' && (
        <motion.div variants={container} className="space-y-4">
          <CutDeckControl 
            onCutDeck={onCutDeck}
            cutAmount={cutAmount ?? 3}
            onCutAmountChange={onCutAmountChange}
          />
        </motion.div>
      )}
      
      {(gamePhase === 'firstBet' || gamePhase === 'secondBet') && (
        <motion.div 
          variants={container}
          className="grid grid-cols-1 gap-4"
        >
          <motion.div variants={item}>
            <BetSlider 
              minRaise={minRaise}
              maxRaise={maxRaise}
              playerChips={playerChips}
              onBetAmountChange={setBetAmount}
            />
          </motion.div>
          
          <motion.div variants={item}>
            <ActionButtons 
              onBetAction={handleLocalBetAction}
              currentBet={currentBet}
              betAmount={betAmount}
              minRaise={minRaise}
              maxRaise={maxRaise}
              playerChips={playerChips}
            />
          </motion.div>
        </motion.div>
      )}
      
      {gamePhase === 'swap' && (
        <motion.div variants={item}>
          <SwapButton 
            onSwapCards={onSwapCards}
            selectedCards={selectedCards}
          />
        </motion.div>
      )}
      
      {(gamePhase === 'roundOver' || gamePhase === 'gameOver') && (
        <motion.div variants={item}>
          <PlayAgainButton 
            onPlayAgain={onPlayAgain}
            playAgainLabel={playAgainLabel}
            gamePhase={gamePhase}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default GameControls;
