
import { Card, CardRank, Hand } from '@/types/poker';

// Get card value for hand comparison
export function getCardValue(rank: CardRank): number {
  const values: Record<CardRank, number> = {
    'A': 14, 
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    'J': 11,
    'Q': 12, 
    'K': 13, 
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
