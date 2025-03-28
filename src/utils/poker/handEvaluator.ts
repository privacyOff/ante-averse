
import { Hand, PokerHandRanking, HAND_RANKINGS } from '@/types/poker';
import { findJoker, getCardGroups, getCardValue } from './cardUtils';

// Determine hand rank for comparison
export function getHandRank(hand: Hand): { rank: number, name: PokerHandRanking } {
  if (hand.length !== 5) {
    throw new Error('Hand must contain exactly 5 cards');
  }
  
  const hasJoker = hand.some(card => card.rank === 'Joker');
  const groups = getCardGroups(hand);
  
  // Sort groups by size (largest first) for easier hand detection
  const sortedGroups = [...groups.entries()]
    .sort((a, b) => b[1].length - a[1].length);
  
  // Five of a Kind (only possible with Joker)
  if (hasJoker && sortedGroups.length > 0 && sortedGroups[0][1].length === 4) {
    return { rank: HAND_RANKINGS['Five of a Kind'], name: 'Five of a Kind' };
  }
  
  // Four of a Kind
  if (sortedGroups.length > 0 && sortedGroups[0][1].length === 4) {
    return { rank: HAND_RANKINGS['Four of a Kind'], name: 'Four of a Kind' };
  }
  
  if (hasJoker && sortedGroups.length > 0 && sortedGroups[0][1].length === 3) {
    return { rank: HAND_RANKINGS['Four of a Kind'], name: 'Four of a Kind' };
  }
  
  // Full House
  if (sortedGroups.length >= 2 && sortedGroups[0][1].length === 3 && sortedGroups[1][1].length === 2) {
    return { rank: HAND_RANKINGS['Full House'], name: 'Full House' };
  }
  
  if (hasJoker && sortedGroups.length >= 2 && 
      ((sortedGroups[0][1].length === 2 && sortedGroups[1][1].length === 2) || 
       sortedGroups[0][1].length === 3)) {
    return { rank: HAND_RANKINGS['Full House'], name: 'Full House' };
  }
  
  // Three of a Kind
  if (sortedGroups.length > 0 && sortedGroups[0][1].length === 3) {
    return { rank: HAND_RANKINGS['Three of a Kind'], name: 'Three of a Kind' };
  }
  
  if (hasJoker && sortedGroups.length > 0 && sortedGroups[0][1].length === 2) {
    return { rank: HAND_RANKINGS['Three of a Kind'], name: 'Three of a Kind' };
  }
  
  // Two Pair
  if (sortedGroups.length >= 2 && sortedGroups[0][1].length === 2 && sortedGroups[1][1].length === 2) {
    return { rank: HAND_RANKINGS['Two Pair'], name: 'Two Pair' };
  }
  
  if (hasJoker && sortedGroups.length >= 2 && sortedGroups[0][1].length === 2 && sortedGroups[1][1].length === 1) {
    return { rank: HAND_RANKINGS['Two Pair'], name: 'Two Pair' };
  }
  
  // One Pair
  if (sortedGroups.length > 0 && sortedGroups[0][1].length === 2) {
    return { rank: HAND_RANKINGS['One Pair'], name: 'One Pair' };
  }
  
  if (hasJoker) {
    return { rank: HAND_RANKINGS['One Pair'], name: 'One Pair' };
  }
  
  // High Card
  return { rank: HAND_RANKINGS['High Card'], name: 'High Card' };
}

// Compare two hands and determine the winner
export function compareHands(hand1: Hand, hand2: Hand): 'hand1' | 'hand2' | 'tie' {
  const hand1Rank = getHandRank(hand1);
  const hand2Rank = getHandRank(hand2);
  
  if (hand1Rank.rank > hand2Rank.rank) {
    return 'hand1';
  }
  
  if (hand2Rank.rank > hand1Rank.rank) {
    return 'hand2';
  }
  
  // Hands have same rank, compare high cards
  const sortedHand1 = [...hand1].sort((a, b) => getCardValue(b.rank) - getCardValue(a.rank));
  const sortedHand2 = [...hand2].sort((a, b) => getCardValue(b.rank) - getCardValue(a.rank));
  
  for (let i = 0; i < sortedHand1.length; i++) {
    const card1Value = getCardValue(sortedHand1[i].rank);
    const card2Value = getCardValue(sortedHand2[i].rank);
    
    if (card1Value > card2Value) {
      return 'hand1';
    }
    
    if (card2Value > card1Value) {
      return 'hand2';
    }
  }
  
  return 'tie';
}
