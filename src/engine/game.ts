import { ALL_CARDS } from './data/cards';
import { ALL_NOBLES } from './data/nobles';
import {
  canAffordCard,
  canReserveCard,
  canTakeDifferentTokens,
  canTakeSameTokens,
  calculatePayment,
  determineWinners,
  getEligibleNobles,
  getTotalTokenCount,
} from './rules';
import {
  DevelopmentCard,
  GameAction,
  GameState,
  GemColor,
  Noble,
  Player,
  TokenType,
  TOKEN_TYPES,
} from './types';

// Deterministic or random shuffle utility
export function shuffle<T>(array: T[], rng = Math.random): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface PlayerConfig {
  id: string;
  name: string;
  isAi: boolean;
  aiDifficulty?: 'easy' | 'normal' | 'hard';
}

/**
 * Initializes a new Splendor game state
 */
export function createInitialGameState(
  playersConfig: PlayerConfig[],
  customRng = Math.random
): GameState {
  const playerCount = playersConfig.length;
  if (playerCount < 2 || playerCount > 4) {
    throw new Error('Splendor requires 2 to 4 players.');
  }

  // Token counts based on player count
  // 2 players: 4 each gem, 5 gold
  // 3 players: 5 each gem, 5 gold
  // 4 players: 7 each gem, 5 gold
  const gemCount = playerCount === 2 ? 4 : playerCount === 3 ? 5 : 7;
  const tokenBank: Record<TokenType, number> = {
    diamond: gemCount,
    sapphire: gemCount,
    emerald: gemCount,
    ruby: gemCount,
    onyx: gemCount,
    gold: 5,
  };

  // Prepare cards by tier
  const tier1Cards = shuffle(ALL_CARDS.filter((c) => c.tier === 1), customRng);
  const tier2Cards = shuffle(ALL_CARDS.filter((c) => c.tier === 2), customRng);
  const tier3Cards = shuffle(ALL_CARDS.filter((c) => c.tier === 3), customRng);

  // Draw 4 cards for each tier
  const visibleTier1 = tier1Cards.splice(0, 4);
  const visibleTier2 = tier2Cards.splice(0, 4);
  const visibleTier3 = tier3Cards.splice(0, 4);

  // Nobles: player count + 1
  const nobleCount = playerCount + 1;
  const shuffledNobles = shuffle(ALL_NOBLES, customRng).slice(0, nobleCount);

  // Setup players
  const players: Player[] = playersConfig.map((p) => ({
    id: p.id,
    name: p.name,
    isAi: p.isAi,
    aiDifficulty: p.aiDifficulty,
    tokens: { diamond: 0, sapphire: 0, emerald: 0, ruby: 0, onyx: 0, gold: 0 },
    bonuses: { diamond: 0, sapphire: 0, emerald: 0, ruby: 0, onyx: 0 },
    reservedCards: [],
    purchasedCards: [],
    nobles: [],
    score: 0,
  }));

  return {
    id: `game-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    players,
    activePlayerIndex: 0,
    phase: 'turn_action',
    tokenBank,
    decks: {
      tier1: tier1Cards,
      tier2: tier2Cards,
      tier3: tier3Cards,
    },
    visibleCards: {
      tier1: visibleTier1,
      tier2: visibleTier2,
      tier3: visibleTier3,
    },
    nobles: shuffledNobles,
    turnCount: 1,
    isFinalRound: false,
    winnerIds: [],
    lastActionMessage: 'Game started. Player 1 turn.',
  };
}

/**
 * Executes a player action and returns the updated state or an error.
 */
export function applyAction(
  currentState: GameState,
  action: GameAction
): { state: GameState; error?: string } {
  if (currentState.phase === 'game_over') {
    return { state: currentState, error: 'Game is already over.' };
  }

  // Deep clone state for immutability
  const state: GameState = JSON.parse(JSON.stringify(currentState));
  const player = state.players[state.activePlayerIndex];

  // If in discard phase, only DISCARD_TOKENS is allowed
  if (state.phase === 'discard_tokens') {
    if (action.type !== 'DISCARD_TOKENS') {
      return { state: currentState, error: 'Must discard excess tokens first.' };
    }
    return handleDiscardTokens(state, player, action);
  }

  // If in noble selection phase, only SELECT_NOBLE is allowed
  if (state.phase === 'select_noble') {
    if (action.type !== 'SELECT_NOBLE') {
      return { state: currentState, error: 'Must select which noble to visit.' };
    }
    return handleSelectNoble(state, player, action);
  }

  // Standard turn action handling
  switch (action.type) {
    case 'TAKE_DIFFERENT_TOKENS': {
      const validation = canTakeDifferentTokens(state.tokenBank, action.gems);
      if (!validation.valid) {
        return { state: currentState, error: validation.reason };
      }

      for (const gem of action.gems) {
        state.tokenBank[gem] -= 1;
        player.tokens[gem] += 1;
      }
      state.lastActionMessage = `${player.name} took tokens: ${action.gems.join(', ')}.`;
      return finishPlayerTurn(state, player);
    }

    case 'TAKE_SAME_TOKENS': {
      const validation = canTakeSameTokens(state.tokenBank, action.gem);
      if (!validation.valid) {
        return { state: currentState, error: validation.reason };
      }

      state.tokenBank[action.gem] -= 2;
      player.tokens[action.gem] += 2;
      state.lastActionMessage = `${player.name} took 2 ${action.gem} tokens.`;
      return finishPlayerTurn(state, player);
    }

    case 'BUY_CARD': {
      let cardToBuy: DevelopmentCard | null = null;
      let cardTier: 1 | 2 | 3 | null = null;
      let visibleCardIndex = -1;
      let isFromReserved = false;

      // 1. Check reserved cards
      const reservedIndex = player.reservedCards.findIndex((c) => c.id === action.cardId);
      if (reservedIndex !== -1) {
        cardToBuy = player.reservedCards[reservedIndex];
        isFromReserved = true;
      } else {
        // 2. Check visible cards on board
        for (const tier of [1, 2, 3] as const) {
          const tierKey = `tier${tier}` as const;
          const idx = state.visibleCards[tierKey].findIndex((c) => c?.id === action.cardId);
          if (idx !== -1) {
            cardToBuy = state.visibleCards[tierKey][idx];
            cardTier = tier;
            visibleCardIndex = idx;
            break;
          }
        }
      }

      if (!cardToBuy) {
        return { state: currentState, error: 'Card not found on board or in reserved cards.' };
      }

      if (!canAffordCard(player, cardToBuy)) {
        return { state: currentState, error: 'Cannot afford this card.' };
      }

      // Execute payment
      const payment = calculatePayment(player, cardToBuy);
      for (const type of TOKEN_TYPES) {
        player.tokens[type] -= payment[type];
        state.tokenBank[type] += payment[type];
      }

      // Add card to player
      player.purchasedCards.push(cardToBuy);
      player.bonuses[cardToBuy.gem] += 1;
      player.score += cardToBuy.points;

      // Remove from source & replenish market if needed
      if (isFromReserved) {
        player.reservedCards.splice(reservedIndex, 1);
      } else if (cardTier && visibleCardIndex !== -1) {
        const tierKey = `tier${cardTier}` as const;
        const nextCard = state.decks[tierKey].shift() || null;
        state.visibleCards[tierKey][visibleCardIndex] = nextCard;
      }

      state.lastActionMessage = `${player.name} purchased ${cardToBuy.gem} card (Tier ${cardToBuy.tier}) for ${cardToBuy.points} pts.`;

      // Check for Noble visits
      const eligibleNobles = getEligibleNobles(player, state.nobles);
      if (eligibleNobles.length === 1) {
        const noble = eligibleNobles[0];
        player.nobles.push(noble);
        player.score += noble.points;
        state.nobles = state.nobles.filter((n) => n.id !== noble.id);
        state.lastActionMessage += ` Noble visited for +3 pts!`;
      } else if (eligibleNobles.length > 1) {
        state.phase = 'select_noble';
        state.eligibleNobleIds = eligibleNobles.map((n) => n.id);
        return { state };
      }

      return finishPlayerTurn(state, player);
    }

    case 'RESERVE_CARD': {
      const reserveCheck = canReserveCard(player);
      if (!reserveCheck.valid) {
        return { state: currentState, error: reserveCheck.reason };
      }

      let cardToReserve: DevelopmentCard | null = null;
      let cardTier: 1 | 2 | 3 | null = null;
      let visibleIndex = -1;

      if (action.cardId) {
        // Reserve visible card
        for (const tier of [1, 2, 3] as const) {
          const tierKey = `tier${tier}` as const;
          const idx = state.visibleCards[tierKey].findIndex((c) => c?.id === action.cardId);
          if (idx !== -1) {
            cardToReserve = state.visibleCards[tierKey][idx];
            cardTier = tier;
            visibleIndex = idx;
            break;
          }
        }
        if (!cardToReserve) {
          return { state: currentState, error: 'Target card not found to reserve.' };
        }
      } else if (action.fromTierDeck) {
        // Reserve blind from top of deck
        const tierKey = `tier${action.fromTierDeck}` as const;
        if (state.decks[tierKey].length === 0) {
          return { state: currentState, error: `Deck Tier ${action.fromTierDeck} is empty.` };
        }
        cardToReserve = state.decks[tierKey].shift()!;
      } else {
        return { state: currentState, error: 'Must specify cardId or fromTierDeck to reserve.' };
      }

      // Add to player's reserved cards
      player.reservedCards.push(cardToReserve);

      // Replenish visible card if reserved from market
      if (cardTier && visibleIndex !== -1) {
        const tierKey = `tier${cardTier}` as const;
        state.visibleCards[tierKey][visibleIndex] = state.decks[tierKey].shift() || null;
      }

      // Award gold token if available in bank
      let gotGold = false;
      if (state.tokenBank.gold > 0) {
        state.tokenBank.gold -= 1;
        player.tokens.gold += 1;
        gotGold = true;
      }

      state.lastActionMessage = `${player.name} reserved a card${gotGold ? ' and gained a gold token' : ''}.`;
      return finishPlayerTurn(state, player);
    }

    default:
      return { state: currentState, error: 'Unknown action type.' };
  }
}

function handleSelectNoble(
  state: GameState,
  player: Player,
  action: { type: 'SELECT_NOBLE'; nobleId: string }
): { state: GameState; error?: string } {
  if (!state.eligibleNobleIds?.includes(action.nobleId)) {
    return { state, error: 'Selected noble is not eligible.' };
  }

  const nobleIndex = state.nobles.findIndex((n) => n.id === action.nobleId);
  if (nobleIndex === -1) {
    return { state, error: 'Noble not found.' };
  }

  const noble = state.nobles[nobleIndex];
  state.nobles.splice(nobleIndex, 1);
  player.nobles.push(noble);
  player.score += noble.points;
  state.phase = 'turn_action';
  state.eligibleNobleIds = undefined;
  state.lastActionMessage += ` ${player.name} chose noble (${noble.id}) for +3 pts.`;

  return finishPlayerTurn(state, player);
}

function handleDiscardTokens(
  state: GameState,
  player: Player,
  action: { type: 'DISCARD_TOKENS'; tokens: Partial<Record<TokenType, number>> }
): { state: GameState; error?: string } {
  const currentTotal = getTotalTokenCount(player.tokens);
  const discardReq = state.discardRequiredCount || Math.max(0, currentTotal - 10);

  // Count how many tokens are being discarded
  let totalDiscarding = 0;
  for (const [type, count] of Object.entries(action.tokens) as [TokenType, number][]) {
    if (count < 0) {
      return { state, error: 'Discard count cannot be negative.' };
    }
    if ((player.tokens[type] || 0) < count) {
      return { state, error: `Cannot discard more ${type} than you possess.` };
    }
    totalDiscarding += count;
  }

  if (totalDiscarding !== discardReq) {
    return {
      state,
      error: `You must discard exactly ${discardReq} tokens (selected ${totalDiscarding}).`,
    };
  }

  // Apply discards
  for (const [type, count] of Object.entries(action.tokens) as [TokenType, number][]) {
    player.tokens[type] -= count;
    state.tokenBank[type] += count;
  }

  state.phase = 'turn_action';
  state.discardRequiredCount = undefined;
  state.lastActionMessage += ` ${player.name} discarded ${totalDiscarding} excess tokens.`;

  return advanceToNextPlayer(state);
}

function finishPlayerTurn(state: GameState, player: Player): { state: GameState; error?: string } {
  // Check token count limit (max 10 tokens)
  const tokenCount = getTotalTokenCount(player.tokens);
  if (tokenCount > 10) {
    state.phase = 'discard_tokens';
    state.discardRequiredCount = tokenCount - 10;
    return { state };
  }

  return advanceToNextPlayer(state);
}

function advanceToNextPlayer(state: GameState): { state: GameState; error?: string } {
  const currentPlayer = state.players[state.activePlayerIndex];

  // Trigger final round if a player reaches 15 points
  if (currentPlayer.score >= 15) {
    state.isFinalRound = true;
  }

  // Next player index
  const nextIndex = (state.activePlayerIndex + 1) % state.players.length;

  // If next player is player 0 and isFinalRound is active, game ends
  if (nextIndex === 0 && state.isFinalRound) {
    state.phase = 'game_over';
    state.winnerIds = determineWinners(state.players);
    const winnerNames = state.players
      .filter((p) => state.winnerIds.includes(p.id))
      .map((p) => p.name)
      .join(', ');
    state.lastActionMessage = `Game Over! Winner: ${winnerNames}!`;
    return { state };
  }

  state.activePlayerIndex = nextIndex;
  state.turnCount += 1;
  return { state };
}
