
import { useState } from 'react';
import { BetAction, GamePhase } from '@/types/poker';

export const useBetting = (
  gameState: any,
  setGameState: React.Dispatch<React.SetStateAction<any>>,
  setPlayerMessage: React.Dispatch<React.SetStateAction<string | null>>,
  setOpponentMessage: React.Dispatch<React.SetStateAction<string | null>>,
  handleOpponentTurn: (phase: GamePhase) => void,
  setShowOpponentCards: React.Dispatch<React.SetStateAction<boolean>>,
  updateLocalStorage: (chips: number) => void
) => {
  const handleBetAction = (action: BetAction, amount?: number) => {
    console.log("Bet action received:", action, "with amount:", amount);
    
    if (gameState.gamePhase !== 'firstBet' && gameState.gamePhase !== 'secondBet') {
      console.log("Invalid game phase for betting:", gameState.gamePhase);
      return;
    }
    
    const phase = gameState.gamePhase;
    const currentBet = gameState.currentBet;
    
    let newPlayerChips = gameState.playerChips;
    let newPot = gameState.pot;
    let newGamePhase: GamePhase = phase;
    let message = '';
    
    switch (action) {
      case 'fold':
        // Player folds, opponent wins
        setGameState(prev => ({
          ...prev,
          opponentChips: prev.opponentChips + prev.pot,
          pot: 0,
          gamePhase: 'roundOver' as GamePhase,
          lastRoundWinner: 'opponent'
        }));
        
        setPlayerMessage("You folded");
        setOpponentMessage("Opponent folded, you win!");
        return;
        
      case 'call':
        if (currentBet > 0) {
          newPlayerChips -= currentBet;
          newPot += currentBet;
          message = `Called ${currentBet}`;
        } else {
          message = "Checked";
        }
        break;
        
      case 'raise':
        if (!amount) {
          console.error("Raise action requires an amount");
          return;
        }
        
        const raiseAmount = amount;
        if (raiseAmount > newPlayerChips) {
          console.error("Not enough chips to raise");
          return;
        }
        
        newPlayerChips -= raiseAmount;
        newPot += raiseAmount;
        message = `Raised ${raiseAmount}`;
        break;
        
      default:
        console.error("Unknown bet action:", action);
        return;
    }
    
    // Move to the next phase
    if (phase === 'firstBet') {
      newGamePhase = 'swap' as GamePhase;
    } else if (phase === 'secondBet') {
      newGamePhase = 'showdown' as GamePhase;
      setShowOpponentCards(true);
    }
    
    console.log("Updating game state:", {
      playerChips: newPlayerChips,
      pot: newPot,
      gamePhase: newGamePhase,
      message: message
    });
    
    setGameState(prev => ({
      ...prev,
      playerChips: newPlayerChips,
      pot: newPot,
      currentBet: action === 'raise' && amount ? amount : 0,
      gamePhase: newGamePhase,
      playerTurn: newGamePhase === 'swap' // Player always goes first in swap phase
    }));
    
    updateLocalStorage(newPlayerChips);
    
    setPlayerMessage(message);
    
    // If moving to showdown, handle it immediately
    if (newGamePhase === 'showdown') {
      // Call the showdown handler (to be implemented in a different hook)
    } else if (newGamePhase === 'swap' && !gameState.playerTurn) {
      // If it's not player's turn during swap phase, let the opponent swap
      setTimeout(() => {
        handleOpponentTurn('swap');
      }, 2000);
    }
  };
  
  return { handleBetAction };
};
