
import { useState } from 'react';
import { GamePhase } from '@/types/poker';
import { dealCards } from '@/utils/pokerUtils';

export const useCutDeck = (
  gameState: any,
  setGameState: React.Dispatch<React.SetStateAction<any>>,
  setPlayerMessage: React.Dispatch<React.SetStateAction<string | null>>,
  setOpponentMessage: React.Dispatch<React.SetStateAction<string | null>>,
  handleOpponentTurn: (phase: GamePhase) => void,
  cutAmount: number,
  setCutAmount: React.Dispatch<React.SetStateAction<number>>
) => {
  const handleCutDeck = () => {
    if (gameState.gamePhase !== 'cutDeck') return;
    
    console.log("handleCutDeck called with cutAmount:", cutAmount);
    
    // Simulate cutting the deck
    let deck = [...gameState.deck];
    console.log("Initial deck length:", deck.length);
    
    // Player cuts
    const playerCutIndex = Math.floor(Math.random() * deck.length);
    deck = [...deck.slice(playerCutIndex), ...deck.slice(0, playerCutIndex)];
    console.log("After player cut, deck length:", deck.length);
    
    // AI cuts
    const aiCutIndex = Math.floor(Math.random() * deck.length);
    deck = [...deck.slice(aiCutIndex), ...deck.slice(0, aiCutIndex)];
    console.log("After AI cut, deck length:", deck.length);
    
    // Deal cards
    console.log("Dealing cards from deck of length:", deck.length);
    const playerResult = dealCards(deck, 5);
    const playerHand = playerResult.cards;
    deck = playerResult.remainingDeck;
    console.log("Player cards dealt:", playerHand.length);
    console.log("Remaining deck length after player cards:", deck.length);
    
    const opponentResult = dealCards(deck, 5);
    const opponentHand = opponentResult.cards;
    deck = opponentResult.remainingDeck;
    console.log("Opponent cards dealt:", opponentHand.length);
    console.log("Final remaining deck length:", deck.length);
    
    // Update game state
    setGameState(prev => ({
      ...prev,
      deck: deck,
      playerHand: playerHand,
      opponentHand: opponentHand,
      gamePhase: 'firstBet',
      playerTurn: prev.currentRound === 1 || prev.lastRoundWinner === 'player'
    }));
    
    setPlayerMessage("Deck cut and cards dealt");
    setOpponentMessage("Deck cut and cards dealt");
    
    // If it's not the player's turn, the opponent should make the first bet
    if (!(gameState.currentRound === 1 || gameState.lastRoundWinner === 'player')) {
      setTimeout(() => {
        handleOpponentTurn('firstBet');
      }, 2000);
    }
  };
  
  const handleCutAmountChange = (amount: number): boolean => {
    setCutAmount(amount);
    return true;
  };
  
  return { handleCutDeck, handleCutAmountChange };
};
