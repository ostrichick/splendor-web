import { canAffordCard, canReserveCard, canTakeDifferentTokens, canTakeSameTokens, getCardCostDeficit, getTotalTokenCount } from './rules';
import { DevelopmentCard, GameAction, GameState, GemColor, GEM_COLORS, Player, TokenType } from './types';

/**
 * Evaluates a card's strategic value for a specific player
 */
function evaluateCardValue(player: Player, card: DevelopmentCard, gameState: GameState): number {
  let value = card.points * 4; // High score priority

  // Value of the bonus gem toward target nobles
  for (const noble of gameState.nobles) {
    const req = noble.requirements[card.gem];
    if (req && (player.bonuses[card.gem] || 0) < req) {
      value += 2.5; // High synergy with open noble
    }
  }

  // Bonus for lower tier building in early game
  if (player.score < 8 && card.tier === 1) {
    value += 1.5;
  }

  // Efficiency: points per total cost
  const totalCost = Object.values(card.cost).reduce((sum, c) => sum + (c || 0), 0);
  if (totalCost > 0) {
    value += (card.points / totalCost) * 3;
  }

  return value;
}

/**
 * Main AI decision maker function
 */
export function computeBestAction(gameState: GameState): GameAction | null {
  const activePlayer = gameState.players[gameState.activePlayerIndex];
  if (!activePlayer.isAi) return null;

  const difficulty = activePlayer.aiDifficulty || 'normal';

  // If in discard phase, discard least needed tokens
  if (gameState.phase === 'discard_tokens') {
    return computeDiscardAction(activePlayer, gameState);
  }

  // If in noble selection phase, choose the first available noble
  if (gameState.phase === 'select_noble') {
    if (gameState.eligibleNobleIds && gameState.eligibleNobleIds.length > 0) {
      return { type: 'SELECT_NOBLE', nobleId: gameState.eligibleNobleIds[0] };
    }
  }

  // All visible cards on market
  const marketCards: DevelopmentCard[] = [
    ...gameState.visibleCards.tier3,
    ...gameState.visibleCards.tier2,
    ...gameState.visibleCards.tier1,
  ].filter((c): c is DevelopmentCard => c !== null);

  // All affordable cards (market + reserved)
  const affordableReserved = activePlayer.reservedCards.filter((c) => canAffordCard(activePlayer, c));
  const affordableMarket = marketCards.filter((c) => canAffordCard(activePlayer, c));
  const allAffordable = [...affordableReserved, ...affordableMarket];

  // ----------------------------------------------------
  // EASY DIFFICULTY
  // ----------------------------------------------------
  if (difficulty === 'easy') {
    // 1. Buy any affordable card (highest points first)
    if (allAffordable.length > 0) {
      allAffordable.sort((a, b) => b.points - a.points);
      return { type: 'BUY_CARD', cardId: allAffordable[0].id };
    }

    // 2. Take 3 available different tokens
    const availableGems = GEM_COLORS.filter((g) => (gameState.tokenBank[g] || 0) > 0);
    if (availableGems.length >= 3) {
      return {
        type: 'TAKE_DIFFERENT_TOKENS',
        gems: availableGems.slice(0, 3),
      };
    } else if (availableGems.length > 0) {
      return {
        type: 'TAKE_DIFFERENT_TOKENS',
        gems: availableGems,
      };
    }

    // 3. Fallback: take 2 of same if >= 4
    for (const gem of GEM_COLORS) {
      if (canTakeSameTokens(gameState.tokenBank, gem).valid) {
        return { type: 'TAKE_SAME_TOKENS', gem };
      }
    }

    // 4. Reserve random card if possible
    if (canReserveCard(activePlayer).valid && marketCards.length > 0) {
      return { type: 'RESERVE_CARD', cardId: marketCards[0].id };
    }

    return null;
  }

  // ----------------------------------------------------
  // NORMAL & HARD DIFFICULTY
  // ----------------------------------------------------
  // 1. If player can win THIS turn (>= 15 pts with purchase), DO IT!
  const winningCard = allAffordable.find((c) => activePlayer.score + c.points >= 15);
  if (winningCard) {
    return { type: 'BUY_CARD', cardId: winningCard.id };
  }

  // 2. Buy high-value affordable card
  if (allAffordable.length > 0) {
    allAffordable.sort(
      (a, b) => evaluateCardValue(activePlayer, b, gameState) - evaluateCardValue(activePlayer, a, gameState)
    );
    const bestAffordable = allAffordable[0];
    const bestValue = evaluateCardValue(activePlayer, bestAffordable, gameState);

    // If it's a good card (or we have reserved it), buy it
    if (bestValue >= 4 || activePlayer.reservedCards.some((c) => c.id === bestAffordable.id) || getTotalTokenCount(activePlayer.tokens) >= 8) {
      return { type: 'BUY_CARD', cardId: bestAffordable.id };
    }
  }

  // 3. HARD ONLY: Opponent blocking (Hate-drafting)
  if (difficulty === 'hard') {
    for (const opponent of gameState.players) {
      if (opponent.id === activePlayer.id) continue;
      // If opponent is close to winning (>= 12 pts)
      if (opponent.score >= 11) {
        const oppAffordable = marketCards.filter((c) => canAffordCard(opponent, c) && opponent.score + c.points >= 15);
        if (oppAffordable.length > 0 && canReserveCard(activePlayer).valid) {
          // Block opponent by reserving their winning card!
          return { type: 'RESERVE_CARD', cardId: oppAffordable[0].id };
        }
      }
    }
  }

  // 4. Pick best target card from market or reserved to work towards
  const candidates = [...activePlayer.reservedCards, ...marketCards];
  candidates.sort(
    (a, b) => evaluateCardValue(activePlayer, b, gameState) - evaluateCardValue(activePlayer, a, gameState)
  );
  const targetCard = candidates[0];

  if (targetCard) {
    const { deficits } = getCardCostDeficit(activePlayer, targetCard);
    const neededGems = (Object.keys(deficits) as GemColor[]).filter(
      (g) => deficits[g] > 0 && (gameState.tokenBank[g] || 0) > 0
    );

    // If we specifically need 2 of a gem and bank has >= 4, grab 2
    for (const gem of neededGems) {
      if (deficits[gem] >= 2 && canTakeSameTokens(gameState.tokenBank, gem).valid) {
        return { type: 'TAKE_SAME_TOKENS', gem };
      }
    }

    // Try to take 3 different needed tokens
    if (neededGems.length >= 3) {
      return { type: 'TAKE_DIFFERENT_TOKENS', gems: neededGems.slice(0, 3) };
    } else if (neededGems.length > 0) {
      // Fill remaining with other available gems in bank
      const otherGems = GEM_COLORS.filter(
        (g) => !neededGems.includes(g) && (gameState.tokenBank[g] || 0) > 0
      );
      const combined = [...neededGems, ...otherGems].slice(0, 3);
      if (canTakeDifferentTokens(gameState.tokenBank, combined).valid) {
        return { type: 'TAKE_DIFFERENT_TOKENS', gems: combined };
      }
    }
  }

  // 5. If we have free reserve slots and target card is high value, reserve it
  if (targetCard && canReserveCard(activePlayer).valid && !activePlayer.reservedCards.some((c) => c.id === targetCard.id)) {
    if (targetCard.points >= 3 || targetCard.tier === 3) {
      return { type: 'RESERVE_CARD', cardId: targetCard.id };
    }
  }

  // 6. Fallback: Take any valid 3 tokens or 2 tokens
  const anyAvailable = GEM_COLORS.filter((g) => (gameState.tokenBank[g] || 0) > 0);
  if (anyAvailable.length >= 3) {
    return { type: 'TAKE_DIFFERENT_TOKENS', gems: anyAvailable.slice(0, 3) };
  }
  for (const gem of GEM_COLORS) {
    if (canTakeSameTokens(gameState.tokenBank, gem).valid) {
      return { type: 'TAKE_SAME_TOKENS', gem };
    }
  }

  // 7. Last resort: buy whatever we can afford
  if (allAffordable.length > 0) {
    return { type: 'BUY_CARD', cardId: allAffordable[0].id };
  }

  // 8. Reserve top of tier 1 or 2 deck
  if (canReserveCard(activePlayer).valid) {
    if (gameState.decks.tier2.length > 0) {
      return { type: 'RESERVE_CARD', fromTierDeck: 2 };
    }
    if (gameState.decks.tier1.length > 0) {
      return { type: 'RESERVE_CARD', fromTierDeck: 1 };
    }
  }

  return null;
}

/**
 * Determines which tokens to discard when player exceeds 10 tokens
 */
function computeDiscardAction(player: Player, gameState: GameState): GameAction {
  const currentTotal = getTotalTokenCount(player.tokens);
  let required = gameState.discardRequiredCount || Math.max(0, currentTotal - 10);
  const discard: Partial<Record<TokenType, number>> = {};

  // Count which gems the player has the most of, or doesn't need for nobles
  const gemScores: { type: TokenType; count: number; priority: number }[] = [];

  for (const type of ['diamond', 'sapphire', 'emerald', 'ruby', 'onyx', 'gold'] as TokenType[]) {
    const count = player.tokens[type] || 0;
    if (count > 0) {
      // Gold has highest priority to keep
      let priority = type === 'gold' ? 100 : count;
      gemScores.push({ type, count, priority });
    }
  }

  // Sort ascending by priority so we discard lowest priority first (exclude gold if possible)
  gemScores.sort((a, b) => a.priority - b.priority);

  for (const item of gemScores) {
    if (required <= 0) break;
    const discardCount = Math.min(item.count, required);
    if (discardCount > 0) {
      discard[item.type] = discardCount;
      required -= discardCount;
    }
  }

  return { type: 'DISCARD_TOKENS', tokens: discard };
}
