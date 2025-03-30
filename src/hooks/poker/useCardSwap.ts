
import { useState } from 'react';
import { Card, GamePhase } from '@/types/poker';
import { dealCards } from '@/utils/pokerUtils';

export const useCardSwap = (
  gameState: any,
  setGameState: React.Dispatch<React.SetStateAction<any>>,
  selectedCards: number[],
  setSelectedCards: React.Dispatch<React.SetStateAction<number[]>>,
  setPlayerMessage: React.Dispatch<React.SetStateAction<string | null>>,
  handleOpponentTurn: (phase: GamePhase) => void
) => {
  const handleCardSwap = () => {
    if (gameState.gamePhase !== 'swap') return;
    
    const cardsToSwap = selectedCards.length;
    if (cardsToSwap === 0) {
      setPlayerMessage("Kept all cards");
      
      setGameState(prev => ({
        ...prev,
        gamePhase: 'secondBet',
        playerTurn: cardsToSwap > 0 ? false : prev.currentRound === 1 || prev.lastRoundWinner === 'player',
      }));
      
      if (!(gameState.currentRound === 1 || gameState.lastRoundWinner === 'player') && cardsToSwap === 0) {
        setTimeout(() => {
          handleOpponentTurn('secondBet');
        }, 2000);
      }
      
      return;
    }
    
    const newPlayerHand = [...gameState.playerHand];
    let newDeck = [...gameState.deck];
    
    for (const index of selectedCards) {
      const { cards, remainingDeck } = dealCards(newDeck, 1);
      newPlayerHand[index] = cards[0];
      newDeck = remainingDeck;
    }
    
    setGameState(prev => ({
      ...prev,
      playerHand: newPlayerHand,
      deck: newDeck,
      gamePhase: 'secondBet',
      playerTurn: prev.currentRound === 1 || prev.lastRoundWinner === 'player',
    }));
    
    setSelectedCards([]);
    setPlayerMessage(`Swapped ${selectedCards.length} card${selectedCards.length > 1 ? 's' : ''}`);
    
    if (!(gameState.currentRound === 1 || gameState.lastRoundWinner === 'player')) {
      setTimeout(() => {
        handleOpponentTurn('secondBet');
      }, 2000);
    }
  };
  
  const handleCardSelect = (index: number) => {
    if (gameState.gamePhase !== 'swap') return;
    
    setSelectedCards(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };
  
  return {
    handleCardSwap,
    handleCardSelect
  };
};
