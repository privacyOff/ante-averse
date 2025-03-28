import { Hand } from '@/types/poker';
import { getHandRank } from './handEvaluator';
import { getCardGroups, getCardValue } from './cardUtils';

// Determine AI bet based on hand strength and difficulty
export function getAIBetAmount(
  hand: Hand, 
  potSize: number, 
  difficulty: string, 
  availableChips: number
): number {
  const handRank = getHandRank(hand);
  let betAmount = 0;
  
  // Base multiplier on difficulty
  let difficultyMultiplier = 1;
  if (difficulty === 'intermediate') difficultyMultiplier = 1.5;
  if (difficulty === 'legend') difficultyMultiplier = 2;
  
  // Base bet on hand strength
  switch (handRank.rank) {
    case 10: // Royal Flush
    case 9:  // Straight Flush
      betAmount = potSize * 2 * difficultyMultiplier;
      break;
    case 8:  // Four of a Kind
      betAmount = potSize * 1.5 * difficultyMultiplier;
      break;
    case 7:  // Full House
    case 6:  // Flush
      betAmount = potSize * 1.2 * difficultyMultiplier;
      break;
    case 5:  // Straight
      betAmount = potSize * 1 * difficultyMultiplier;
      break;
    case 4:  // Three of a Kind
      betAmount = potSize * 0.8 * difficultyMultiplier;
      break;
    case 3:  // Two Pair
      betAmount = potSize * 0.6 * difficultyMultiplier;
      break;
    case 2:  // One Pair
      betAmount = potSize * 0.4 * difficultyMultiplier;
      break;
    case 1:  // High Card
      betAmount = potSize * 0.2 * difficultyMultiplier;
      break;
  }
  
  // Add randomness based on difficulty
  const randomFactor = Math.random() * 0.2; // 0-20% random factor
  if (difficulty === 'beginner') {
    betAmount = betAmount * (1 + randomFactor);
  } else if (difficulty === 'intermediate') {
    betAmount = betAmount * (1 - randomFactor/2 + randomFactor);
  } else if (difficulty === 'legend') {
    // Legend difficulty adds more calculated variance
    const strongBluff = Math.random() < 0.2; // 20% chance of strong bluff
    if (strongBluff) {
      betAmount = betAmount * 1.5;
    } else {
      betAmount = betAmount * (1 - randomFactor/2 + randomFactor);
    }
  }
  
  // Round to nearest 5 or 10
  betAmount = Math.round(betAmount / 10) * 10;
  
  // Cap at available chips
  return Math.min(betAmount, availableChips);
}

// Get cards the AI should swap based on current hand
export function getAICardSwapIndices(hand: Hand, difficulty: string): number[] {
  const handRank = getHandRank(hand);
  const indices: number[] = [];
  
  // Keep Joker card
  const jokerIndex = hand.findIndex(card => card.rank === 'Joker');
  if (jokerIndex !== -1) {
    // Don't swap Joker
  } else {
    // For 17 Poker, the strategy is similar but uses different hand rankings
    const groups = getCardGroups(hand);
    
    // Four of a Kind - keep all four cards, swap the other
    if (handRank.name === 'Four of a Kind') {
      for (let i = 0; i < hand.length; i++) {
        const cardRank = hand[i].rank;
        if (cardRank !== 'Joker') {
          const group = groups.get(cardRank);
          if (group && group.length < 4) {
            indices.push(i);
          }
        }
      }
      return indices;
    }
    
    // Full House - keep all cards, don't swap
    if (handRank.name === 'Full House') {
      return [];
    }
    
    // Three of a Kind - keep the three cards, swap the other two
    if (handRank.name === 'Three of a Kind') {
      for (let i = 0; i < hand.length; i++) {
        const cardRank = hand[i].rank;
        if (cardRank !== 'Joker') {
          const group = groups.get(cardRank);
          if (group && group.length < 3) {
            indices.push(i);
          }
        }
      }
      return indices;
    }
    
    // Two Pair - keep both pairs, swap the other card
    if (handRank.name === 'Two Pair') {
      for (let i = 0; i < hand.length; i++) {
        const cardRank = hand[i].rank;
        if (cardRank !== 'Joker') {
          const group = groups.get(cardRank);
          if (group && group.length < 2) {
            indices.push(i);
          }
        }
      }
      return indices;
    }
    
    // One Pair - keep the pair, swap the other three
    if (handRank.name === 'One Pair') {
      for (let i = 0; i < hand.length; i++) {
        const cardRank = hand[i].rank;
        if (cardRank !== 'Joker') {
          const group = groups.get(cardRank);
          if (group && group.length < 2) {
            indices.push(i);
          }
        }
      }
      return indices;
    }
    
    // High Card - keep the highest 2 cards, swap the rest
    const sortedIndices = [...hand.keys()].sort((a, b) => 
      getCardValue(hand[b].rank) - getCardValue(hand[a].rank)
    );
    
    // Keep top 2 cards (or fewer for easier difficulties)
    let keepCount = 2;
    if (difficulty === 'beginner') {
      keepCount = Math.max(1, Math.floor(Math.random() * 3)); // Keep 1-2 cards
    }
    
    return sortedIndices.slice(keepCount);
  }
  
  return indices;
}
