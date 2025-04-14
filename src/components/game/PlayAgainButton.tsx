
import { Button } from '@/components/ui/button';
import { GamePhase } from '@/types/poker';
import { toast } from 'sonner';

interface PlayAgainButtonProps {
  onPlayAgain?: () => void;
  playAgainLabel: string;
  gamePhase: GamePhase;
}

const PlayAgainButton = ({ 
  onPlayAgain, 
  playAgainLabel, 
  gamePhase 
}: PlayAgainButtonProps) => {
  const handlePlayAgain = () => {
    console.log("Play again button clicked, function exists:", !!onPlayAgain);
    
    if (onPlayAgain) {
      toast.success(gamePhase === 'gameOver' ? "Starting new game..." : "Moving to next round...");
      onPlayAgain();
    } else {
      toast.error("Play again function not available");
      console.error("onPlayAgain function is not defined");
    }
  };
  
  return (
    <Button 
      onClick={handlePlayAgain}
      className="w-full bg-gradient-to-r from-poker-gold to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black py-6 text-lg font-bold cursor-pointer relative z-10"
      type="button"
      style={{cursor: 'pointer'}}
    >
      {playAgainLabel}
    </Button>
  );
};

export default PlayAgainButton;
