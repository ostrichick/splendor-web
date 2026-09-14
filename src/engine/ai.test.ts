import { describe, expect, it } from 'vitest';
import { computeBestAction } from './ai';
import { applyAction, createInitialGameState } from './game';

describe('Splendor AI Engine', () => {
  it('computes valid action for Easy AI', () => {
    const state = createInitialGameState([
      { id: 'p1', name: 'Human', isAi: false },
      { id: 'p2', name: 'AI Easy', isAi: true, aiDifficulty: 'easy' },
    ]);

    // Fast-forward to AI turn
    state.activePlayerIndex = 1;

    const action = computeBestAction(state);
    expect(action).not.toBeNull();

    // Verify the action can be applied without error
    const result = applyAction(state, action!);
    expect(result.error).toBeUndefined();
  });

  it('computes valid action for Hard AI and plans token pickup', () => {
    const state = createInitialGameState([
      { id: 'p1', name: 'Human', isAi: false },
      { id: 'p2', name: 'AI Hard', isAi: true, aiDifficulty: 'hard' },
    ]);

    state.activePlayerIndex = 1;
    const action = computeBestAction(state);
    expect(action).not.toBeNull();

    const result = applyAction(state, action!);
    expect(result.error).toBeUndefined();
  });

  it('computes valid discard action when AI has more than 10 tokens', () => {
    const state = createInitialGameState([
      { id: 'p1', name: 'Human', isAi: false },
      { id: 'p2', name: 'AI Player', isAi: true, aiDifficulty: 'normal' },
    ]);

    state.activePlayerIndex = 1;
    state.phase = 'discard_tokens';
    state.discardRequiredCount = 2;
    state.players[1].tokens = {
      diamond: 3,
      sapphire: 3,
      emerald: 3,
      ruby: 3,
      onyx: 0,
      gold: 0,
    };

    const action = computeBestAction(state);
    expect(action).not.toBeNull();
    expect(action?.type).toBe('DISCARD_TOKENS');

    const result = applyAction(state, action!);
    expect(result.error).toBeUndefined();
    expect(result.state.phase).toBe('turn_action');
  });
});
