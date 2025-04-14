
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SwapButtonProps {
  onSwapCards?: () => void;
  selectedCards: number[];
}

const SwapButton = ({ onSwapCards, selectedCards }: SwapButtonProps) => {
  const handleSwapCards = () => {
    console.log("Swap cards button clicked, function exists:", !!onSwapCards);
    console.log("Selected cards:", selectedCards);
    
    if (onSwapCards) {
      toast.success(selectedCards.length > 0 
        ? `Swapping ${selectedCards.length} card${selectedCards.length > 1 ? 's' : ''}` 
        : "Keeping all cards");
      onSwapCards();
    } else {
      toast.error("Swap cards function not available");
      console.error("onSwapCards function is not defined");
    }
  };
  
  return (
    <Button 
      onClick={handleSwapCards}
      className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white py-6 text-lg font-bold cursor-pointer relative z-10 shine-effect"
      type="button"
    >
      <span>
        {selectedCards.length > 0 
          ? `Swap ${selectedCards.length} Card${selectedCards.length > 1 ? 's' : ''}` 
          : 'Keep All Cards'}
      </span>
      <div className="button-shine"></div>
    </Button>
  );
};

export default SwapButton;
