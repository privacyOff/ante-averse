
export type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type CardRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

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
