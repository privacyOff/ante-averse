
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BetAction } from '@/types/poker';
import { toast } from 'sonner';

interface ActionButtonsProps {
  onBetAction?: (action: BetAction, amount?: number) => void;
  currentBet: number;
  betAmount: number;
  minRaise: number;
  maxRaise: number;
  playerChips: number;
}

const ActionButtons = ({
  onBetAction,
  currentBet,
  betAmount,
  minRaise,
  maxRaise,
  playerChips
}: ActionButtonsProps) => {
  
  useEffect(() => {
    console.log("ActionButtons rendered with onBetAction:", !!onBetAction);
    console.log("betAmount:", betAmount, "currentBet:", currentBet);
  }, [onBetAction, betAmount, currentBet]);
  
  const handleBetAction = (action: BetAction) => {
    console.log(`ActionButtons: handleBetAction called with ${action}`);
    console.log(`ActionButtons: onBetAction function exists: ${!!onBetAction}`);
    
    if (!onBetAction) {
      toast.error("Bet action function not available");
      console.error("onBetAction function is not defined");
      return;
    }
    
    try {
      console.log(`Executing ${action.toUpperCase()} action`);
      
      if (action === 'raise') {
        // Validate bet amount
        if (betAmount < minRaise) {
          toast.error(`Minimum raise is ${minRaise} chips`);
          return;
        }
        
        if (betAmount > maxRaise) {
          toast.error(`Maximum raise is ${maxRaise} chips`);
          return;
        }
        
        if (playerChips < betAmount) {
          toast.error("Not enough chips to raise");
          return;
        }
        
        console.log(`Raising ${betAmount} chips`);
        onBetAction(action, betAmount);
        toast.success(`Raising ${betAmount} chips`);
      } else if (action === 'call') {
        if (currentBet > 0 && playerChips < currentBet) {
          toast.error("Not enough chips to call");
          return;
        }
        
        onBetAction(action);
        toast.success(currentBet > 0 ? "Calling" : "Checking");
      } else if (action === 'fold') {
        onBetAction(action);
        toast.success("Folding");
      }
    } catch (error) {
      console.error("Error executing bet action:", error);
      toast.error("Failed to execute bet action");
    }
  };
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      <Button 
        onClick={() => handleBetAction('fold')}
        className="bg-zinc-800 hover:bg-zinc-700 text-white"
        type="button"
      >
        Fold
      </Button>
      
      <Button 
        onClick={() => handleBetAction('call')}
        className="bg-blue-600 hover:bg-blue-700 text-white"
        type="button"
        disabled={currentBet > 0 && playerChips < currentBet}
      >
        {currentBet > 0 ? `Call (${currentBet})` : 'Check'}
      </Button>
      
      <Button 
        onClick={() => handleBetAction('raise')}
        className="bg-green-600 hover:bg-green-700 text-white col-span-2 lg:col-span-1"
        type="button"
        disabled={playerChips < betAmount || betAmount < minRaise || betAmount > maxRaise}
      >
        Raise ({betAmount})
      </Button>
    </div>
  );
};

export default ActionButtons;
