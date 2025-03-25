
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ChipCounter from '@/components/ChipCounter';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  
  const startAIGame = (difficulty: string) => {
    // Save difficulty to localStorage
    localStorage.setItem('aiDifficulty', difficulty);
    
    // Navigate to the appropriate game page based on difficulty
    navigate(`/game/${difficulty}`);
  };
  
  const createPrivateGame = () => {
    // Generate a random room code
    const newRoomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    setRoomCode(newRoomCode);
    
    // Copy to clipboard
    navigator.clipboard.writeText(newRoomCode).then(() => {
      toast.success("Room code copied to clipboard", {
        description: `Share this code with your friend: ${newRoomCode}`,
        duration: 5000,
      });
    });
  };
  
  const joinPrivateGame = () => {
    if (!roomCode.trim()) {
      toast.error("Please enter a room code");
      return;
    }
    
    // Navigate to multiplayer game with room code
    navigate(`/game/multiplayer?room=${roomCode}`);
  };
  
  // Controls the staggered animation of items
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const buttonHover = {
    scale: 1.05,
    boxShadow: "0px 10px 30px rgba(255, 68, 68, 0.3)"
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 overflow-hidden">
      <ChipCounter />
      
      <div className="max-w-6xl mx-auto px-4 py-10">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-poker-red via-poker-gold to-poker-red">
            17 Poker
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Experience premium poker gameplay with sleek design and challenging opponents
          </p>
        </motion.div>
      
        <motion.section 
          variants={container}
          initial="hidden"
          animate="show"
          className="mb-20"
        >
          <motion.h2 
            variants={item}
            className="text-2xl font-semibold mb-8 flex items-center justify-center gap-3"
          >
            <span className="text-3xl">🎮</span> Game Modes
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* VS Computer Card */}
            <motion.div 
              variants={item}
              className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden card-hover-effect"
            >
              <div className="p-8">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mb-6 mx-auto shadow-lg animate-float">
                  <svg className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                    <circle cx="10" cy="14" r="1"/>
                    <circle cx="14" cy="14" r="1"/>
                    <path d="M16 17s-1.5 2-4 2-4-2-4-2"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-center mb-6">VS Computer</h3>
                
                <div className="space-y-4">
                  <motion.button
                    whileHover={buttonHover}
                    onClick={() => startAIGame('beginner')}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-medium flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-green-500/20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12a10 10 0 1 1 20 0c0 2.8-1.2 5.3-3 7l-7 5-7-5a10 10 0 0 1-3-7z" />
                      <path d="m12 19-5-4" />
                      <path d="m12 19 5-4" />
                    </svg>
                    Beginner
                  </motion.button>
                  
                  <motion.button
                    whileHover={buttonHover}
                    onClick={() => startAIGame('intermediate')}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-amber-500/20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 11h16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4Z" />
                      <path d="M8 5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6H8V5Z" />
                      <path d="M8 5V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                      <path d="M4 15h16" />
                    </svg>
                    Intermediate
                  </motion.button>
                  
                  <motion.button
                    whileHover={buttonHover}
                    onClick={() => startAIGame('legend')}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-red-500/20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a2 2 0 0 1-2-2V4h-4v2a2 2 0 0 1-2 2h-3v2.833c0 1.53.386 3.032 1.122 4.368l.506.913a8 8 0 0 0 1.372 1.886V20h8v-5L18 13V8h-2z" />
                      <path d="M7.5 12.5a4.5 4.5 0 0 0 9 0" />
                    </svg>
                    Legend
                  </motion.button>
                </div>
              </div>
            </motion.div>
            
            {/* VS Friend Card */}
            <motion.div 
              variants={item}
              className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden card-hover-effect"
            >
              <div className="p-8">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-6 mx-auto shadow-lg animate-float">
                  <svg className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-center mb-6">VS Friend</h3>
                
                <div className="space-y-6">
                  <motion.button
                    whileHover={buttonHover}
                    onClick={createPrivateGame}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-poker-red to-red-600 text-white font-medium flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-red-500/20 relative overflow-hidden shine-effect"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <line x1="8" x2="16" y1="12" y2="12" />
                      <line x1="12" x2="12" y1="8" y2="16" />
                    </svg>
                    Create Private Room
                  </motion.button>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value)}
                      placeholder="Enter Room Code"
                      className="flex-1 bg-zinc-900/90 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-poker-red/50 text-white placeholder-zinc-500"
                    />
                    <motion.button
                      whileHover={buttonHover}
                      onClick={joinPrivateGame}
                      className="py-3 px-6 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-medium flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-green-500/20"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                      Join Room
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
        
        <motion.section 
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.h2 
            variants={item}
            className="text-2xl font-semibold mb-8 flex items-center justify-center gap-3"
          >
            <span className="text-3xl">💎</span> Buy Chips
          </motion.h2>
          
          <motion.div 
            variants={item} 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4"
          >
            {[
              { chips: 130, price: 100, colorClass: 'chip-130' },
              { chips: 550, price: 360, colorClass: 'chip-550' },
              { chips: 1040, price: 800, colorClass: 'chip-1040' },
              { chips: 3250, price: 3000, colorClass: 'chip-3250' },
              { chips: 5000, price: 4400, colorClass: 'chip-5000' },
              { chips: 8600, price: 7100, colorClass: 'chip-8600' },
              { chips: 17400, price: 16000, colorClass: 'chip-17400' }
            ].map((pkg, index) => (
              <motion.div 
                key={index}
                variants={item}
                className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-4 flex flex-col items-center justify-center text-center card-hover-effect"
              >
                <div className={`chip ${pkg.colorClass} mb-3`}>{pkg.chips}</div>
                <p className="text-poker-gold font-medium mb-3">${pkg.price.toLocaleString()}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/buy-chips', { state: { selectedPackage: pkg } })}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-medium transition-all text-sm"
                >
                  Purchase
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
};

export default Index;
