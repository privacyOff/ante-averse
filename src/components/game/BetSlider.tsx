
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
    console.log("BetSlider: minRaise changed to", minRaise);
    console.log("BetSlider: maxRaise is", maxRaise);
    console.log("BetSlider: playerChips is", playerChips);
    
    const newBetAmount = Math.min(Math.max(minRaise, 5), playerChips);
    setBetAmount(newBetAmount);
    onBetAmountChange(newBetAmount);
  }, [minRaise, maxRaise, playerChips, onBetAmountChange]);
  
  const handleBetAmountChange = (value: number[]) => {
    console.log("BetSlider: Changing bet amount to", value[0]);
    setBetAmount(value[0]);
    onBetAmountChange(value[0]);
  };
  
  const effectiveMaxRaise = Math.min(playerChips, maxRaise);
  
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-white text-sm">Bet Amount: {betAmount}</span>
      </div>
      
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
    </div>
  );
};

export default BetSlider;
