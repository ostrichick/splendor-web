import { DevelopmentCard, GameState, GemColor, Noble, Player, TokenType, GEM_COLORS, TOKEN_TYPES } from './types';

/**
 * Returns total number of tokens (including gold) in a player's inventory
 */
export function getTotalTokenCount(tokens: Record<TokenType, number>): number {
  return TOKEN_TYPES.reduce((sum, type) => sum + (tokens[type] || 0), 0);
}

/**
 * Validates taking 1 to 3 distinct gem colors.
 * Official rule: Take up to 3 tokens of different colors.
 * If fewer than 3 types of tokens are available in the bank, player can take fewer.
 */
export function canTakeDifferentTokens(
  bank: Record<TokenType, number>,
  gems: GemColor[]
): { valid: boolean; reason?: string } {
  if (gems.length === 0 || gems.length > 3) {
    return { valid: false, reason: 'Must choose between 1 and 3 tokens.' };
  }

  // Check uniqueness
  const uniqueGems = new Set(gems);
  if (uniqueGems.size !== gems.length) {
    return { valid: false, reason: 'All selected tokens must be different colors.' };
  }

  // Check bank availability
  for (const gem of gems) {
    if ((bank[gem] || 0) < 1) {
      return { valid: false, reason: `Not enough ${gem} tokens in the bank.` };
    }
  }

  // Count available distinct gem colors in bank
  const availableColorsInBank = GEM_COLORS.filter((g) => (bank[g] || 0) > 0);
  if (gems.length < 3 && availableColorsInBank.length >= 3) {
    return {
      valid: false,
      reason: 'You must select 3 tokens if at least 3 distinct colors are available.',
    };
  }

  return { valid: true };
}

/**
 * Validates taking 2 tokens of the same gem color.
 * Official rule: Can only take 2 of same color if at least 4 tokens of that color are in the bank.
 */
export function canTakeSameTokens(
  bank: Record<TokenType, number>,
  gem: GemColor
): { valid: boolean; reason?: string } {
  if ((bank[gem] || 0) < 4) {
    return {
      valid: false,
      reason: `Must have at least 4 ${gem} tokens in bank to take 2 (currently ${bank[gem] || 0}).`,
    };
  }
  return { valid: true };
}

/**
 * Calculates how much additional tokens (deficits) player needs to buy a card.
 * Returns deficit breakdown per gem and whether player has enough gold jokers to cover total deficit.
 */
export function getCardCostDeficit(
  player: Player,
  card: DevelopmentCard
): {
  deficits: Record<GemColor, number>;
  totalDeficit: number;
  canAfford: boolean;
} {
  let totalDeficit = 0;
  const deficits: Record<GemColor, number> = {
    diamond: 0,
    sapphire: 0,
    emerald: 0,
    ruby: 0,
    onyx: 0,
  };

  for (const gem of GEM_COLORS) {
    const cost = card.cost[gem] || 0;
    const bonus = player.bonuses[gem] || 0;
    const effectiveCost = Math.max(0, cost - bonus);
    const playerTokens = player.tokens[gem] || 0;

    if (effectiveCost > playerTokens) {
      const diff = effectiveCost - playerTokens;
      deficits[gem] = diff;
      totalDeficit += diff;
    }
  }

  const canAfford = totalDeficit <= (player.tokens.gold || 0);

  return { deficits, totalDeficit, canAfford };
}

/**
 * Checks if player can afford to buy the given card.
 */
export function canAffordCard(player: Player, card: DevelopmentCard): boolean {
  return getCardCostDeficit(player, card).canAfford;
}

/**
 * Calculates optimal token payment for a card.
 * Deducts bonuses, uses regular tokens first, and covers the rest with gold.
 */
export function calculatePayment(
  player: Player,
  card: DevelopmentCard
): Record<TokenType, number> {
  const payment: Record<TokenType, number> = {
    diamond: 0,
    sapphire: 0,
    emerald: 0,
    ruby: 0,
    onyx: 0,
    gold: 0,
  };

  let goldNeeded = 0;

  for (const gem of GEM_COLORS) {
    const cost = card.cost[gem] || 0;
    const bonus = player.bonuses[gem] || 0;
    const effectiveCost = Math.max(0, cost - bonus);
    const playerTokens = player.tokens[gem] || 0;

    const tokensToPay = Math.min(effectiveCost, playerTokens);
    payment[gem] = tokensToPay;

    if (effectiveCost > tokensToPay) {
      goldNeeded += effectiveCost - tokensToPay;
    }
  }

  payment.gold = goldNeeded;
  return payment;
}

/**
 * Checks if a player can reserve a card.
 * Rule: Maximum of 3 reserved cards per player.
 */
export function canReserveCard(player: Player): { valid: boolean; reason?: string } {
  if (player.reservedCards.length >= 3) {
    return { valid: false, reason: 'Cannot reserve more than 3 cards at once.' };
  }
  return { valid: true };
}

/**
 * Checks which nobles are currently eligible to visit the player based on bonuses.
 */
export function getEligibleNobles(player: Player, nobles: Noble[]): Noble[] {
  return nobles.filter((noble) => {
    for (const [gem, req] of Object.entries(noble.requirements)) {
      if (req && (player.bonuses[gem as GemColor] || 0) < req) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Check if game should end and determine winners.
 * In Splendor, when any player reaches 15 points, the current round continues
 * until the last player in the turn order finishes their turn.
 * Winner is player with highest score. Tiebreaker: fewest development cards purchased.
 */
export function determineWinners(players: Player[]): string[] {
  let highestScore = -1;
  let fewestCards = Infinity;
  let winners: string[] = [];

  for (const p of players) {
    if (p.score > highestScore) {
      highestScore = p.score;
      fewestCards = p.purchasedCards.length;
      winners = [p.id];
    } else if (p.score === highestScore) {
      if (p.purchasedCards.length < fewestCards) {
        fewestCards = p.purchasedCards.length;
        winners = [p.id];
      } else if (p.purchasedCards.length === fewestCards) {
        winners.push(p.id);
      }
    }
  }

  return winners;
}
