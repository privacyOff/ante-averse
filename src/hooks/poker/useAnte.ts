
import { useState } from 'react';
import { dealCards } from '@/utils/pokerUtils';

export const useAnte = (
  gameState: any,
  setGameState: React.Dispatch<React.SetStateAction<any>>,
  setPlayerMessage: React.Dispatch<React.SetStateAction<string | null>>,
  setOpponentMessage: React.Dispatch<React.SetStateAction<string | null>>,
  updateLocalStorage: (chips: number) => void
) => {
  const handleAnte = () => {
    if (gameState.gamePhase !== 'start') return;
    
    const anteAmount = gameState.anteAmount;
    
    // Check if player has enough chips
    if (gameState.playerChips < anteAmount) {
      setPlayerMessage("Not enough chips for ante!");
      return;
    }
    
    // Subtract ante from both players and add to pot
    const newPlayerChips = gameState.playerChips - anteAmount;
    const newOpponentChips = gameState.opponentChips - anteAmount;
    const newPot = anteAmount * 2;
    
    setGameState(prev => ({
      ...prev,
      playerChips: newPlayerChips,
      opponentChips: newOpponentChips,
      pot: newPot,
      gamePhase: 'cutDeck'
    }));
    
    updateLocalStorage(newPlayerChips);
    
    setPlayerMessage(`Ante placed: ${anteAmount} chips`);
    setOpponentMessage(`Ante placed: ${anteAmount} chips`);
    
    console.log("Game phase updated to: cutDeck");
  };
  
  return { handleAnte };
};
