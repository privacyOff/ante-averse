export type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades' | 'joker';
export type CardRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'Joker';

export interface Card {
  suit: CardSuit;
  rank: CardRank;
  isFlipped?: boolean;
  isSelected?: boolean;
}

export type Hand = Card[];

export type GameDifficulty = 'beginner' | 'intermediate' | 'legend';

export interface GameState {
  deck: Card[];
  playerHand: Hand;
  opponentHand: Hand;
  communityCards: Card[];
  pot: number;
  playerChips: number;
  opponentChips: number;
  currentBet: number;
  playerTurn: boolean;
  gamePhase: GamePhase;
  winner: 'player' | 'opponent' | 'tie' | null;
  anteAmount: number;
  currentRound: number;
  totalRounds: number;
  lastRoundWinner: 'player' | 'opponent' | null;
  cutDeckAmount: number;
}

export type GamePhase = 
  | 'start' 
  | 'ante'
  | 'cutDeck'
  | 'deal'
  | 'firstBet'
  | 'swap'
  | 'secondBet'
  | 'showdown'
  | 'roundOver'
  | 'gameOver';

export type BetAction = 'fold' | 'call' | 'raise';

export type PokerHandRanking = 
  | 'Five of a Kind'
  | 'Four of a Kind'
  | 'Full House'
  | 'Three of a Kind'
  | 'Two Pair'
  | 'One Pair'
  | 'High Card';

export const HAND_RANKINGS: Record<PokerHandRanking, number> = {
  'Five of a Kind': 6,
  'Four of a Kind': 5,
  'Full House': 4,
  'Three of a Kind': 3,
  'Two Pair': 2,
  'One Pair': 1,
  'High Card': 0
};

export interface RoundResult {
  roundNumber: number;
  playerHand: string;
  opponentHand: string;
  potAmount: number;
  winner: 'player' | 'opponent' | 'tie';
}
