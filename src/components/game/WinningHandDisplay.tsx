
import { motion } from 'framer-motion';

interface WinningHandDisplayProps {
  winningHand: string | null;
  gamePhase: string;
  winner: 'player' | 'opponent' | 'tie' | null;
}

const WinningHandDisplay = ({ winningHand, gamePhase, winner }: WinningHandDisplayProps) => {
  if (!winningHand) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-md rounded-xl p-4 text-center max-w-md mx-auto"
    >
      <h3 className="text-xl font-bold text-poker-gold mb-2">{winningHand}</h3>
      <p className="text-zinc-400">
        {gamePhase === 'gameOver' 
          ? winner === 'player' 
            ? 'Congratulations! You won the game!'
            : winner === 'opponent'
              ? 'Better luck next time, your opponent won the game.'
              : 'The game ended in a tie!'
          : 'Get ready for the next round!'}
      </p>
    </motion.div>
  );
};

export default WinningHandDisplay;
