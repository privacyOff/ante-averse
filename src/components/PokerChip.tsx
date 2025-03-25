
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PokerChipProps {
  value: number;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  label?: string;
}

const PokerChip = ({ value, className, size = 'medium', onClick, label }: PokerChipProps) => {
  const getChipClass = (value: number) => {
    if (value <= 250) return 'chip-130';
    if (value <= 750) return 'chip-550';
    if (value <= 1500) return 'chip-1040';
    if (value <= 4000) return 'chip-3250';
    if (value <= 6000) return 'chip-5000';
    if (value <= 10000) return 'chip-8600';
    return 'chip-17400';
  };
  
  const chipClass = getChipClass(value);
  
  const sizeClasses = {
    small: 'w-10 h-10 text-xs',
    medium: 'w-16 h-16 text-base',
    large: 'w-20 h-20 text-lg'
  };
  
  return (
    <motion.div
      className={cn(
        'chip',
        chipClass,
        sizeClasses[size],
        onClick && 'cursor-pointer hover:shadow-lg',
        className
      )}
      whileHover={onClick ? { scale: 1.1 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      onClick={onClick}
    >
      {label || value}
    </motion.div>
  );
};

export default PokerChip;
