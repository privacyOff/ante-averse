
import { useState } from 'react';
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
  
  const handleBetAction = (action: BetAction) => {
    console.log(`Bet action: ${action}, function exists:`, !!onBetAction);
    console.log(`Current bet amount: ${betAmount}, current bet: ${currentBet}`);
    
    if (!onBetAction) {
      toast.error("Bet action function not available");
      console.error("onBetAction function is not defined");
      return;
    }
    
    try {
      if (action === 'raise') {
        console.log("Executing RAISE action with amount:", betAmount);
        toast.success(`Raising ${betAmount} chips`);
        onBetAction(action, betAmount);
      } else if (action === 'call') {
        console.log("Executing CALL action");
        toast.success(currentBet > 0 ? "Calling" : "Checking");
        onBetAction(action);
      } else if (action === 'fold') {
        console.log("Executing FOLD action");
        toast.success("Folding");
        onBetAction(action);
      } else {
        console.error("Unknown bet action:", action);
        toast.error("Unknown bet action");
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
      >
        {currentBet > 0 ? `Call (${currentBet})` : 'Check'}
      </Button>
      
      <Button 
        onClick={() => handleBetAction('raise')}
        className="bg-green-600 hover:bg-green-700 text-white col-span-2 lg:col-span-1"
        type="button"
      >
        Raise ({betAmount})
      </Button>
    </div>
  );
};

export default ActionButtons;
