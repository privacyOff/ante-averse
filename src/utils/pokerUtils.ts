import { Card, CardRank, CardSuit, Hand, HAND_RANKINGS, PokerHandRanking } from '@/types/poker';

// Create a 17-card deck for 17 Poker
export function createDeck(): Card[] {
  const suits: CardSuit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: CardRank[] = ['A', 'K', 'Q', 'J'];
  
  const deck: Card[] = [];
  
  // Add regular cards (A, K, Q, J of each suit)
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank, isFlipped: true });
    }
  }
  
  // Add the Joker card
  deck.push({ suit: 'joker', rank: 'Joker', isFlipped: true });
  
  return shuffleDeck(deck);
}

// Shuffle the deck using Fisher-Yates algorithm
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

// Deal a specific number of cards from the deck
export function dealCards(deck: Card[], count: number): { cards: Card[], remainingDeck: Card[] } {
  if (count > deck.length) {
    throw new Error('Not enough cards in the deck');
  }
  
  const cards = deck.slice(0, count).map(card => ({ ...card, isFlipped: false }));
  const remainingDeck = deck.slice(count);
  
  return { cards, remainingDeck };
}

// Get card value for hand comparison
export function getCardValue(rank: CardRank): number {
  const values: Record<CardRank, number> = {
    'A': 14, 
    'K': 13, 
    'Q': 12, 
    'J': 11,
    'Joker': 15  // Joker has highest single card value
  };
  
  return values[rank];
}

// Find Joker card in hand
export function findJoker(hand: Hand): Card | undefined {
  return hand.find(card => card.rank === 'Joker');
}

// Get pairs, three of a kind, four of a kind, etc.
export function getCardGroups(hand: Hand): Map<CardRank, Card[]> {
  const groups = new Map<CardRank, Card[]>();
  
  for (const card of hand) {
    // Skip joker for now, we'll handle it separately
    if (card.rank === 'Joker') continue;
    
    if (!groups.has(card.rank)) {
      groups.set(card.rank, []);
    }
    groups.get(card.rank)!.push(card);
  }
  
  return groups;
}

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
