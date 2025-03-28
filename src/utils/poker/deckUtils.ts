
import { Card, CardRank, CardSuit } from '@/types/poker';

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
