
import { motion } from 'framer-motion';

interface PlayerInfoProps {
  isOpponent: boolean;
  chips: number;
  message: string | null;
}

const PlayerInfo = ({ isOpponent, chips, message }: PlayerInfoProps) => {
  return (
    <motion.div 
      initial={{ x: isOpponent ? -20 : 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex items-center gap-3"
    >
      {isOpponent ? (
        <>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="7" r="4" />
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Opponent ({chips} chips)</p>
            {message && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={message}
                className="text-white font-medium"
              >
                {message}
              </motion.p>
            )}
          </div>
        </>
      ) : (
        <>
          <div>
            <p className="text-sm text-zinc-500 text-right">You ({chips} chips)</p>
            {message && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={message}
                className="text-white font-medium text-right"
              >
                {message}
              </motion.p>
            )}
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default PlayerInfo;
