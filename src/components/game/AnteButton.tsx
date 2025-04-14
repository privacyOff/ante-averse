
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AnteButtonProps {
  onAnte?: () => void;
  anteAmount: number;
  playerChips: number;
}

const AnteButton = ({ onAnte, anteAmount, playerChips }: AnteButtonProps) => {
  const handleAnte = () => {
    console.log("Ante button clicked, function exists:", !!onAnte);
    if (onAnte) {
      toast.success("Placing ante...");
      onAnte();
    } else {
      toast.error("Ante function not available");
      console.error("onAnte function is not defined");
    }
  };
  
  return (
    <div className="relative z-10">
      <Button 
        onClick={handleAnte}
        className="w-full bg-gradient-to-r from-poker-red to-red-600 hover:from-red-600 hover:to-red-700 text-white py-6 text-lg font-bold relative shine-effect cursor-pointer"
        disabled={playerChips < anteAmount}
        type="button"
        style={{cursor: playerChips < anteAmount ? 'not-allowed' : 'pointer'}}
      >
        Place Ante ({anteAmount} chips)
        <div className="button-shine"></div>
      </Button>
      {playerChips < anteAmount && (
        <p className="text-red-500 text-center mt-2">Not enough chips! Visit the shop to buy more.</p>
      )}
    </div>
  );
};

export default AnteButton;
