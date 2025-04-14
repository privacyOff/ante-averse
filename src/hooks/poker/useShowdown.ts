
import { useState } from 'react';
import { GamePhase } from '@/types/poker';
import { compareHands, getHandRank, createDeck } from '@/utils/pokerUtils';
import { toast } from 'sonner';

export const useShowdown = (
  gameState: any,
  setGameState: React.Dispatch<React.SetStateAction<any>>,
  setShowOpponentCards: React.Dispatch<React.SetStateAction<boolean>>,
  setPlayerMessage: React.Dispatch<React.SetStateAction<string | null>>,
  setOpponentMessage: React.Dispatch<React.SetStateAction<string | null>>,
  setWinningHand: React.Dispatch<React.SetStateAction<string | null>>,
  selectedCards: number[],
  setSelectedCards: React.Dispatch<React.SetStateAction<number[]>>,
  updateLocalStorage: (chips: number) => void
) => {
  const handleShowdown = (currentState = gameState) => {
    if (currentState.gamePhase !== 'showdown') return;
    
    setShowOpponentCards(true);
    
    const result = compareHands(currentState.playerHand, currentState.opponentHand);
    const playerHandRank = getHandRank(currentState.playerHand);
    const opponentHandRank = getHandRank(currentState.opponentHand);
    
    let roundWinner: 'player' | 'opponent' | 'tie' | null = null;
    let winningMessage = '';
    
    if (result === 'hand1') {
      roundWinner = 'player';
      const winAmount = currentState.pot;
      currentState.playerChips += winAmount;
      setPlayerMessage(`You win ${winAmount} chips!`);
      setOpponentMessage("Opponent loses!");
      winningMessage = `You won with ${playerHandRank.name}`;
      toast.success(`You won the round with ${playerHandRank.name}!`);
    } 
    else if (result === 'hand2') {
      roundWinner = 'opponent';
      currentState.opponentChips += currentState.pot;
      setPlayerMessage("You lose this round!");
      setOpponentMessage("Opponent wins!");
      winningMessage = `Opponent won with ${opponentHandRank.name}`;
      toast.error(`Opponent won the round with ${opponentHandRank.name}.`);
    } 
    else {
      roundWinner = 'tie';
      const halfPot = Math.floor(currentState.pot / 2);
      currentState.playerChips += halfPot;
      currentState.opponentChips += halfPot;
      setPlayerMessage("It's a tie!");
      setOpponentMessage("It's a tie!");
      winningMessage = `Tie with ${playerHandRank.name}`;
      toast.info(`The round ended in a tie with ${playerHandRank.name}.`);
    }
    
    updateLocalStorage(currentState.playerChips);
    
    const newState = {
      ...currentState,
      lastRoundWinner: roundWinner === 'tie' ? currentState.lastRoundWinner : roundWinner,
      gamePhase: 'roundOver' as GamePhase,
      pot: 0
    };
    
    if (newState.currentRound >= newState.totalRounds) {
      newState.gamePhase = 'gameOver' as GamePhase;
      
      if (newState.playerChips > newState.opponentChips) {
        newState.winner = 'player';
        toast.success("Congratulations! You've won the game!");
      } else if (newState.opponentChips > newState.playerChips) {
        newState.winner = 'opponent';
        toast.error("Game over! Your opponent has won.");
      } else {
        newState.winner = 'tie';
        toast.info("The game has ended in a tie!");
      }
    }
    
    setGameState(newState);
    setWinningHand(winningMessage);
  };
  
  const handleNextRound = () => {
    if (gameState.gamePhase !== 'roundOver') return;
    
    if (gameState.playerChips < gameState.anteAmount) {
      toast.error("Not enough chips for the next round's ante!");
      return { redirect: true, to: '/buy-chips' };
    }
    
    if (gameState.opponentChips < gameState.anteAmount) {
      toast.success("You've cleaned out your opponent! Game over.");
      setGameState(prev => ({
        ...prev,
        gamePhase: 'gameOver' as GamePhase,
        winner: 'player'
      }));
      return { redirect: false };
    }
    
    const newDeck = createDeck();
    
    toast.info(`Starting round ${gameState.currentRound + 1} of ${gameState.totalRounds}`);
    
    setGameState(prev => ({
      ...prev,
      deck: newDeck,
      playerHand: [],
      opponentHand: [],
      communityCards: [],
      pot: 0,
      currentBet: 0,
      gamePhase: 'start' as GamePhase,
      winner: null,
      currentRound: prev.currentRound + 1
    }));
    
    setSelectedCards([]);
    setShowOpponentCards(false);
    setPlayerMessage(`Round ${gameState.currentRound + 1} of ${gameState.totalRounds}`);
    setOpponentMessage(null);
    setWinningHand(null);
    
    return { redirect: false };
  };
  
  const handlePlayAgain = () => {
    const newDeck = createDeck();
    
    toast.success("Starting a new game!");
    
    setGameState(prev => ({
      ...prev,
      deck: newDeck,
      playerHand: [],
      opponentHand: [],
      communityCards: [],
      pot: 0,
      currentBet: 0,
      playerTurn: true,
      gamePhase: 'start' as GamePhase,
      winner: null,
      currentRound: 1,
      lastRoundWinner: null,
      cutDeckAmount: 0
    }));
    setSelectedCards([]);
    setShowOpponentCards(false);
    setPlayerMessage("New game started!");
    setOpponentMessage(null);
    setWinningHand(null);
  };
  
  return {
    handleShowdown,
    handleNextRound,
    handlePlayAgain
  };
};
