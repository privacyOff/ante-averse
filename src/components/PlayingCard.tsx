
import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Card } from '@/types/poker';
import { cn } from '@/lib/utils';

interface PlayingCardProps {
  card?: Card;
  isHidden?: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  index?: number;
  delay?: number;
  className?: string;
}

const PlayingCard = ({
  card,
  isHidden = false,
  isSelectable = false,
  isSelected = false,
  onSelect,
  index = 0,
  delay = 0,
  className
}: PlayingCardProps) => {
  const [isFlipped, setIsFlipped] = useState(true);
  const controls = useAnimation();
  
  useEffect(() => {
    // Define the initial position based on the index (for "dealing" animation)
    controls.set({
      x: 300,
      y: -200,
      rotateZ: 20,
      opacity: 0
    });
    
    // Animate the card in with a delay based on index
    const timer = setTimeout(() => {
      controls.start({
        x: 0,
        y: 0,
        rotateZ: 0,
        opacity: 1,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 25,
          mass: 1.1,
          duration: 0.5
        }
      });
    }, delay);
    
    // After another short delay, flip the card if it shouldn't be hidden
    const flipTimer = setTimeout(() => {
      if (!isHidden) {
        setIsFlipped(false);
      }
    }, delay + 300);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(flipTimer);
    };
  }, [controls, index, delay, isHidden]);
  
  // Update flipped state when isHidden changes
  useEffect(() => {
    setIsFlipped(isHidden);
  }, [isHidden]);
  
  if (!card) {
    return (
      <div className={cn(
        "relative w-24 h-36 rounded-lg border border-white/10 bg-zinc-800/50",
        className
      )} />
    );
  }
  
  // Get suit symbol and color
  const getSuitDetails = (suit: string) => {
    switch (suit) {
      case 'hearts':
        return { symbol: '♥', color: 'text-red-500' };
      case 'diamonds':
        return { symbol: '♦', color: 'text-red-500' };
      case 'clubs':
        return { symbol: '♣', color: 'text-white' };
      case 'spades':
        return { symbol: '♠', color: 'text-white' };
      case 'joker':
        return { symbol: '★', color: 'text-amber-400' };
      default:
        return { symbol: '', color: '' };
    }
  };
  
  const { symbol, color } = getSuitDetails(card.suit);
  
  const handleClick = () => {
    if (isSelectable && onSelect) {
      onSelect();
    }
  };
  
  return (
    <div className={cn("relative preserve-3d", className)}>
      <motion.div
        animate={controls}
        className={cn(
          "relative w-24 h-36 rounded-lg shadow-xl transition-transform cursor-default",
          isSelectable && "cursor-pointer hover:shadow-white/10",
          isSelected && "ring-4 ring-primary shadow-primary/30 translate-y-(-8px)"
        )}
        style={{ transformStyle: 'preserve-3d' }}
        onClick={handleClick}
      >
        <motion.div
          className="absolute w-full h-full backface-hidden rounded-lg"
          animate={{ rotateY: isFlipped ? 0 : 180 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Card Back */}
          <div className="w-full h-full rounded-lg bg-gradient-to-br from-poker-red to-red-900 p-1">
            <div className="w-full h-full rounded-md border-2 border-white/20 bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-black/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">17</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          className={cn(
            "absolute w-full h-full backface-hidden rounded-lg p-2 flex flex-col justify-between",
            card.rank === 'Joker' ? "bg-gradient-to-br from-zinc-900 to-black" : "bg-white"
          )}
          initial={{ rotateY: 180 }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Card Front */}
          {card.rank === 'Joker' ? (
            // Joker Card
            <div className="h-full flex flex-col items-center justify-between py-2">
              <div className="text-xl font-bold text-amber-400">JOKER</div>
              <div className="text-5xl text-amber-400 flex-grow flex items-center justify-center">★</div>
              <div className="text-xl font-bold text-amber-400 rotate-180">JOKER</div>
            </div>
          ) : (
            // Normal Card
            <>
              <div className={cn("text-xl font-bold", color)}>
                <div className="flex flex-col items-start">
                  <span>{card.rank}</span>
                  <span className="text-lg">{symbol}</span>
                </div>
              </div>
              <div className={cn("text-4xl flex-grow flex items-center justify-center", color)}>
                {symbol}
              </div>
              <div className={cn("text-xl font-bold rotate-180", color)}>
                <div className="flex flex-col items-start">
                  <span>{card.rank}</span>
                  <span className="text-lg">{symbol}</span>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PlayingCard;
