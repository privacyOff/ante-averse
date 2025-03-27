
import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';

interface BetSliderProps {
  minRaise: number;
  maxRaise: number;
  playerChips: number;
  onBetAmountChange: (amount: number) => void;
}

const BetSlider = ({ 
  minRaise, 
  maxRaise, 
  playerChips, 
  onBetAmountChange 
}: BetSliderProps) => {
  const [betAmount, setBetAmount] = useState(minRaise);
  
  // Reset betAmount when minRaise changes
  useEffect(() => {
    setBetAmount(minRaise);
    onBetAmountChange(minRaise);
  }, [minRaise, onBetAmountChange]);
  
  const handleBetAmountChange = (value: number[]) => {
    setBetAmount(value[0]);
    onBetAmountChange(value[0]);
  };
  
  const effectiveMaxRaise = Math.min(playerChips, maxRaise);
  
  return (
    <div className="flex items-center gap-4 text-sm">
      <span className="text-white/60 min-w-[40px]">Min: {minRaise}</span>
      <Slider
        value={[betAmount]}
        min={minRaise}
        max={effectiveMaxRaise}
        step={5}
        onValueChange={handleBetAmountChange}
        className="flex-1"
      />
      <span className="text-white/60 min-w-[40px]">Max: {effectiveMaxRaise}</span>
    </div>
  );
};

export default BetSlider;
