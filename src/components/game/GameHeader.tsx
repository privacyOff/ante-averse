
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface GameHeaderProps {
  title: string;
  currentRound: number;
  totalRounds: number;
}

const GameHeader = ({ title, currentRound, totalRounds }: GameHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between gap-4 mb-8"
    >
      <button 
        onClick={() => navigate('/')}
        className="bg-black/40 p-2 rounded-full hover:bg-black/60 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg">
        <span className="text-sm text-zinc-500">Round</span>
        <span className="text-xl font-bold text-amber-500">{currentRound}/{totalRounds}</span>
      </div>
    </motion.div>
  );
};

export default GameHeader;
