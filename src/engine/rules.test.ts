import { describe, expect, it } from 'vitest';
import { applyAction, createInitialGameState } from './game';
import { canAffordCard, canTakeDifferentTokens, canTakeSameTokens } from './rules';
import { DevelopmentCard, GameState, Player } from './types';

describe('Splendor Game Engine', () => {
  it('initializes game state correctly for 2 players', () => {
    const state = createInitialGameState([
      { id: 'p1', name: 'Alice', isAi: false },
      { id: 'p2', name: 'Bob', isAi: true, aiDifficulty: 'easy' },
    ]);

    expect(state.players).toHaveLength(2);
    expect(state.tokenBank.diamond).toBe(4);
    expect(state.tokenBank.gold).toBe(5);
    expect(state.nobles).toHaveLength(3); // 2 + 1
    expect(state.visibleCards.tier1).toHaveLength(4);
    expect(state.visibleCards.tier2).toHaveLength(4);
    expect(state.visibleCards.tier3).toHaveLength(4);
    expect(state.phase).toBe('turn_action');
    expect(state.activePlayerIndex).toBe(0);
  });

  it('validates taking different tokens', () => {
    const bank = { diamond: 4, sapphire: 4, emerald: 4, ruby: 4, onyx: 4, gold: 5 };

    // Valid 3 different
    expect(canTakeDifferentTokens(bank, ['diamond', 'sapphire', 'ruby']).valid).toBe(true);

    // Invalid duplicates
    expect(canTakeDifferentTokens(bank, ['diamond', 'diamond', 'ruby']).valid).toBe(false);

    // Invalid when 3 available but taking 2
    expect(canTakeDifferentTokens(bank, ['diamond', 'sapphire']).valid).toBe(false);

    // Valid taking 2 when only 2 types available in bank
    const scarceBank = { diamond: 2, sapphire: 1, emerald: 0, ruby: 0, onyx: 0, gold: 5 };
    expect(canTakeDifferentTokens(scarceBank, ['diamond', 'sapphire']).valid).toBe(true);
  });

  it('validates taking same tokens', () => {
    const bank = { diamond: 4, sapphire: 3, emerald: 0, ruby: 4, onyx: 4, gold: 5 };

    // Valid when 4 available
    expect(canTakeSameTokens(bank, 'diamond').valid).toBe(true);

    // Invalid when < 4 available
    expect(canTakeSameTokens(bank, 'sapphire').valid).toBe(false);
  });

  it('calculates affordability and purchases with gold wildcard', () => {
    const card: DevelopmentCard = {
      id: 'test-card',
      tier: 1,
      gem: 'diamond',
      points: 0,
      cost: { sapphire: 2, ruby: 2 },
    };

    const player: Player = {
      id: 'p1',
      name: 'Alice',
      isAi: false,
      tokens: { diamond: 0, sapphire: 1, emerald: 0, ruby: 1, onyx: 0, gold: 2 },
      bonuses: { diamond: 0, sapphire: 0, emerald: 0, ruby: 0, onyx: 0 },
      reservedCards: [],
      purchasedCards: [],
      nobles: [],
      score: 0,
    };

    // Needs 2 sapphire, 2 ruby. Has 1 sapphire, 1 ruby, 2 gold -> Can afford!
    expect(canAffordCard(player, card)).toBe(true);

    // With bonus: 1 ruby bonus -> needs 2 sapphire, 1 ruby. Has 1 sapphire, 1 ruby, 1 gold -> Can afford!
    player.bonuses.ruby = 1;
    player.tokens.gold = 1;
    expect(canAffordCard(player, card)).toBe(true);

    // Without enough gold
    player.tokens.gold = 0;
    expect(canAffordCard(player, card)).toBe(false);
  });

  it('executes TAKE_DIFFERENT_TOKENS and advances turn', () => {
    const state = createInitialGameState([
      { id: 'p1', name: 'Alice', isAi: false },
      { id: 'p2', name: 'Bob', isAi: false },
    ]);

    const res = applyAction(state, {
      type: 'TAKE_DIFFERENT_TOKENS',
      gems: ['diamond', 'sapphire', 'emerald'],
    });

    expect(res.error).toBeUndefined();
    expect(res.state.players[0].tokens.diamond).toBe(1);
    expect(res.state.players[0].tokens.sapphire).toBe(1);
    expect(res.state.players[0].tokens.emerald).toBe(1);
    expect(res.state.tokenBank.diamond).toBe(3);
    expect(res.state.activePlayerIndex).toBe(1); // Next turn
  });

  it('allows reserving a card and awards gold token', () => {
    const state = createInitialGameState([
      { id: 'p1', name: 'Alice', isAi: false },
      { id: 'p2', name: 'Bob', isAi: false },
    ]);

    const targetCard = state.visibleCards.tier1[0]!;
    const res = applyAction(state, {
      type: 'RESERVE_CARD',
      cardId: targetCard.id,
    });

    expect(res.error).toBeUndefined();
    expect(res.state.players[0].reservedCards).toHaveLength(1);
    expect(res.state.players[0].reservedCards[0].id).toBe(targetCard.id);
    expect(res.state.players[0].tokens.gold).toBe(1);
    expect(res.state.tokenBank.gold).toBe(4);
    // Board slot should be replenished
    expect(res.state.visibleCards.tier1[0]).not.toBeNull();
    expect(res.state.visibleCards.tier1[0]?.id).not.toBe(targetCard.id);
  });

  it('handles token discarding when exceeding 10 tokens', () => {
    const state = createInitialGameState([
      { id: 'p1', name: 'Alice', isAi: false },
      { id: 'p2', name: 'Bob', isAi: false },
    ]);

    // Give player 9 tokens
    state.players[0].tokens.diamond = 3;
    state.players[0].tokens.sapphire = 3;
    state.players[0].tokens.emerald = 3;

    // Take 2 ruby tokens -> total 11 tokens (> 10)
    const res1 = applyAction(state, {
      type: 'TAKE_SAME_TOKENS',
      gem: 'ruby',
    });

    expect(res1.state.phase).toBe('discard_tokens');
    expect(res1.state.discardRequiredCount).toBe(1);
    expect(res1.state.activePlayerIndex).toBe(0); // Still active until discarded

    // Discard 1 emerald token
    const res2 = applyAction(res1.state, {
      type: 'DISCARD_TOKENS',
      tokens: { emerald: 1 },
    });

    expect(res2.error).toBeUndefined();
    expect(res2.state.phase).toBe('turn_action');
    expect(res2.state.players[0].tokens.emerald).toBe(2);
    expect(res2.state.activePlayerIndex).toBe(1); // Turn advanced
  });

  it('awards noble visit when bonus requirements are met upon card purchase', () => {
    const state = createInitialGameState([
      { id: 'p1', name: 'Alice', isAi: false },
      { id: 'p2', name: 'Bob', isAi: false },
    ]);

    // Give player almost enough bonuses for the first noble
    const noble = state.nobles[0];
    const nobleReqKeys = Object.keys(noble.requirements) as ('diamond' | 'sapphire' | 'emerald' | 'ruby' | 'onyx')[];
    const targetGem = nobleReqKeys[0];

    // Set player bonuses to fulfill requirements except 1
    for (const gem of nobleReqKeys) {
      state.players[0].bonuses[gem] = noble.requirements[gem]!;
    }
    state.players[0].bonuses[targetGem] -= 1; // 1 short

    // Put a free card in visibleCards tier1 giving that bonus
    const freeCard: DevelopmentCard = {
      id: 'free-card',
      tier: 1,
      gem: targetGem,
      points: 1,
      cost: {},
    };
    state.visibleCards.tier1[0] = freeCard;

    const res = applyAction(state, {
      type: 'BUY_CARD',
      cardId: 'free-card',
    });

    expect(res.error).toBeUndefined();
    // Alice now has the noble (+3) + card (+1) = 4 points
    expect(res.state.players[0].score).toBe(4);
    expect(res.state.players[0].nobles).toHaveLength(1);
    expect(res.state.nobles.some((n) => n.id === noble.id)).toBe(false);
  });
});
