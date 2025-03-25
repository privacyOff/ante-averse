
import { motion } from 'framer-motion';
import { Card } from '@/types/poker';
import PlayingCard from './PlayingCard';
import PokerChip from './PokerChip';
import { cn } from '@/lib/utils';

interface PokerTableProps {
  playerHand: Card[];
  opponentHand: Card[];
  showOpponentCards: boolean;
  selectedCards: number[];
  pot: number;
  onCardSelect?: (index: number) => void;
  playerBet: number;
  opponentBet: number;
  children?: React.ReactNode;
  className?: string;
}

const PokerTable = ({
  playerHand,
  opponentHand,
  showOpponentCards,
  selectedCards,
  pot,
  onCardSelect,
  playerBet,
  opponentBet,
  children,
  className
}: PokerTableProps) => {
  return (
    <div className={cn(
      "relative min-h-[500px] rounded-[50px] bg-gradient-to-b from-green-900 to-green-800 p-10 shadow-2xl border-8 border-zinc-800",
      className
    )}>
      {/* Felt Pattern Overlay */}
      <div className="absolute inset-0 rounded-[42px] opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiPjwvcmVjdD4KPC9zdmc+')]" />
      
      {/* Opponent's Cards */}
      <div className="flex justify-center mb-16">
        <div className="flex gap-2">
          {opponentHand.map((card, index) => (
            <PlayingCard
              key={`opponent-${index}`}
              card={card}
              isHidden={!showOpponentCards}
              index={index}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
      
      {/* Center of Table - Pot */}
      <div className="flex flex-col items-center justify-center gap-3 mb-16">
        {pot > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex gap-2 items-center"
          >
            <PokerChip value={pot} />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white font-bold text-xl"
            >
              {pot} chips
            </motion.span>
          </motion.div>
        )}
        
        {/* Player and Opponent Bets */}
        <div className="flex w-full justify-between px-10">
          {opponentBet > 0 && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2"
            >
              <PokerChip value={opponentBet} size="small" />
              <span className="text-white/80">{opponentBet}</span>
            </motion.div>
          )}
          
          {playerBet > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 ml-auto"
            >
              <span className="text-white/80">{playerBet}</span>
              <PokerChip value={playerBet} size="small" />
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Player's Cards */}
      <div className="flex justify-center mb-6">
        <div className="flex gap-2">
          {playerHand.map((card, index) => (
            <PlayingCard
              key={`player-${index}`}
              card={card}
              isSelectable={!!onCardSelect}
              isSelected={selectedCards.includes(index)}
              onSelect={() => onCardSelect && onCardSelect(index)}
              index={index}
              delay={500 + index * 100}
            />
          ))}
        </div>
      </div>
      
      {/* Game Controls */}
      {children}
    </div>
  );
};

export default PokerTable;
