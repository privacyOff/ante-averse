
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CutDeckControlProps {
  onCutDeck?: () => void;
  cutAmount: number;
  onCutAmountChange?: (amount: number) => void;
}

const CutDeckControl = ({ 
  onCutDeck, 
  cutAmount, 
  onCutAmountChange 
}: CutDeckControlProps) => {
  const handleCutDeck = () => {
    console.log("Cut deck button clicked, function exists:", !!onCutDeck);
    console.log("Current cut amount:", cutAmount);
    
    if (onCutDeck) {
      toast.success(`Cutting deck by ${cutAmount} cards...`);
      onCutDeck();
    } else {
      toast.error("Cut deck function not available");
      console.error("onCutDeck function is not defined");
    }
  };
  
  const handleCutAmountChange = (value: number[]) => {
    if (onCutAmountChange) onCutAmountChange(value[0]);
  };
  
  return (
    <div className="space-y-4 relative z-10">
      <div className="flex items-center gap-4 text-sm">
        <span className="text-white/60">Cards to cut:</span>
        <Slider
          value={[cutAmount]}
          min={1}
          max={10}
          step={1}
          onValueChange={handleCutAmountChange}
          className="flex-1 cursor-pointer"
        />
        <span className="text-white/60 min-w-[20px] text-center">{cutAmount}</span>
      </div>
      
      <Button 
        onClick={handleCutDeck}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-6 text-lg font-bold relative shine-effect cursor-pointer"
        type="button"
        style={{cursor: 'pointer'}}
      >
        Cut the Deck
        <div className="button-shine"></div>
      </Button>
    </div>
  );
};

export default CutDeckControl;
