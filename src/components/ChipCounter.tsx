
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ChipCounterProps {
  className?: string;
  variant?: 'default' | 'small';
}

const ChipCounter = ({ className, variant = 'default' }: ChipCounterProps) => {
  const [chips, setChips] = useState(1000);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load chips from localStorage
    const savedChips = localStorage.getItem('pokerChips');
    if (savedChips) {
      setChips(parseInt(savedChips));
    }

    // Listen for chip updates from other components
    const handleChipUpdate = (e: CustomEvent) => {
      const newChips = e.detail.chips;
      setChips(newChips);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
      
      // Save to localStorage
      localStorage.setItem('pokerChips', newChips.toString());
    };

    window.addEventListener('chipUpdate' as any, handleChipUpdate);
    return () => {
      window.removeEventListener('chipUpdate' as any, handleChipUpdate);
    };
  }, []);

  const handleClick = () => {
    navigate('/buy-chips');
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "fixed top-6 right-6 bg-black/60 backdrop-blur-lg p-3 rounded-full flex items-center gap-3 cursor-pointer transition-all z-50",
        "border border-white/10 hover:border-white/20",
        "animate-fade-in shadow-lg",
        isAnimating && "animate-pulse-glow",
        variant === 'small' ? "p-2 gap-2" : "",
        className
      )}
    >
      <span className={cn(
        "text-2xl",
        variant === 'small' ? "text-lg" : ""
      )}>🪙</span>
      <span className={cn(
        "text-xl font-bold text-poker-gold",
        variant === 'small' ? "text-base" : ""
      )}>
        {chips.toLocaleString()}
      </span>
    </div>
  );
};

export default ChipCounter;
