export type GemColor = 'diamond' | 'sapphire' | 'emerald' | 'ruby' | 'onyx';
export type TokenType = GemColor | 'gold';

export const GEM_COLORS: GemColor[] = ['diamond', 'sapphire', 'emerald', 'ruby', 'onyx'];
export const TOKEN_TYPES: TokenType[] = ['diamond', 'sapphire', 'emerald', 'ruby', 'onyx', 'gold'];

export type CardCost = Partial<Record<GemColor, number>>;

export interface DevelopmentCard {
  id: string;
  tier: 1 | 2 | 3;
  gem: GemColor;
  points: number;
  cost: CardCost;
}

export interface Noble {
  id: string;
  points: number; // usually 3
  requirements: Partial<Record<GemColor, number>>;
}

export type AIDifficulty = 'easy' | 'normal' | 'hard';

export interface Player {
  id: string;
  name: string;
  isAi: boolean;
  aiDifficulty?: AIDifficulty;
  tokens: Record<TokenType, number>;
  bonuses: Record<GemColor, number>;
  reservedCards: DevelopmentCard[];
  purchasedCards: DevelopmentCard[];
  nobles: Noble[];
  score: number;
}

export type GamePhase = 
  | 'turn_action'      // Regular action (take tokens, buy, reserve)
  | 'discard_tokens'  // Player has > 10 tokens and must discard
  | 'select_noble'    // Multiple nobles eligible in single turn (rare)
  | 'game_over';      // Game completed

export interface GameState {
  id: string;
  players: Player[];
  activePlayerIndex: number;
  phase: GamePhase;
  tokenBank: Record<TokenType, number>;
  
  // Market decks and visible cards (up to 4 per tier)
  decks: {
    tier1: DevelopmentCard[];
    tier2: DevelopmentCard[];
    tier3: DevelopmentCard[];
  };
  visibleCards: {
    tier1: (DevelopmentCard | null)[];
    tier2: (DevelopmentCard | null)[];
    tier3: (DevelopmentCard | null)[];
  };
  nobles: Noble[];
  
  turnCount: number;
  isFinalRound: boolean;
  winnerIds: string[];
  lastActionMessage?: string;
  
  // Transient state for token discarding
  discardRequiredCount?: number;
  eligibleNobleIds?: string[];
}

export type GameAction =
  | {
      type: 'TAKE_DIFFERENT_TOKENS';
      gems: GemColor[]; // 1 to 3 distinct colors
    }
  | {
      type: 'TAKE_SAME_TOKENS';
      gem: GemColor; // 2 of same color
    }
  | {
      type: 'BUY_CARD';
      cardId: string;
      fromReserved?: boolean;
    }
  | {
      type: 'RESERVE_CARD';
      cardId?: string; // If null/undefined, reserve from deck top
      fromTierDeck?: 1 | 2 | 3;
    }
  | {
      type: 'DISCARD_TOKENS';
      tokens: Partial<Record<TokenType, number>>;
    }
  | {
      type: 'SELECT_NOBLE';
      nobleId: string;
    };
