import { describe, expect, it } from 'vitest';
import {
  JOIN_ATTEMPT_LIMIT,
  JOIN_ATTEMPT_WINDOW_MS,
  JOIN_SECRET_LENGTH,
  ROOM_CODE_LENGTH,
  SlidingWindowRateLimiter,
  generateJoinSecret,
  generateRoomCode,
  isAiDifficulty,
  hashJoinSecret,
  isOriginAllowed,
  parseRoomCode,
  parseAllowedOrigins,
  safePlayerName,
  verifyJoinSecret,
} from './security';

describe('multiplayer security helpers', () => {
  it('generates long room codes and join secrets from the unambiguous alphabet', () => {
    expect(generateRoomCode()).toMatch(new RegExp(`^[A-HJ-NP-Z2-9]{${ROOM_CODE_LENGTH}}$`));
    expect(generateJoinSecret()).toMatch(new RegExp(`^[A-HJ-NP-Z2-9]{${JOIN_SECRET_LENGTH}}$`));
  });

  it('validates malformed socket room codes and bounds untrusted player names', () => {
    expect(parseRoomCode(' abcd2345 ')).toBe('ABCD2345');
    for (const input of [null, undefined, {}, [], 12345, 'invalid!', 'A'.repeat(500)]) {
      expect(parseRoomCode(input)).toBeNull();
    }
    expect(safePlayerName(null, 'Host')).toBe('Host');
    expect(safePlayerName('  ', 'Host')).toBe('Host');
    expect(safePlayerName('a'.repeat(1000), 'Host')).toHaveLength(40);
    expect(isAiDifficulty('easy')).toBe(true);
    expect(isAiDifficulty('expert')).toBe(false);
    expect(isAiDifficulty({})).toBe(false);
  });

  it('verifies join secrets without storing plaintext', () => {
    const secret = 'ABCD2345';
    const digest = hashJoinSecret(secret);
    expect(digest).not.toContain(secret);
    expect(verifyJoinSecret('abcd2345', digest)).toBe(true);
    expect(verifyJoinSecret('WRONG999', digest)).toBe(false);
  });

  it('rejects wildcard CORS and uses only the deployed production origins by default', () => {
    expect(() => parseAllowedOrigins('*', 'production')).toThrow(/not permitted/);
    expect(parseAllowedOrigins(undefined, 'production')).toEqual([
      'https://ostrichick.github.io',
      'https://splendor-web-yrrr.onrender.com',
    ]);
    expect(parseAllowedOrigins('https://game.example, https://admin.example/', 'production')).toEqual([
      'https://game.example',
      'https://admin.example',
    ]);
    expect(isOriginAllowed('https://game.example/path', ['https://game.example'])).toBe(true);
    expect(isOriginAllowed('https://evil.example', ['https://game.example'])).toBe(false);
  });

  it('limits repeated join attempts within a sliding window', () => {
    const limiter = new SlidingWindowRateLimiter(JOIN_ATTEMPT_LIMIT, JOIN_ATTEMPT_WINDOW_MS);
    const start = 1_000_000;
    for (let index = 0; index < JOIN_ATTEMPT_LIMIT; index += 1) {
      expect(limiter.attempt('client-a', start + index).allowed).toBe(true);
    }
    const blocked = limiter.attempt('client-a', start + JOIN_ATTEMPT_LIMIT);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
    expect(limiter.attempt('client-a', start + JOIN_ATTEMPT_WINDOW_MS + 1).allowed).toBe(true);
  });
});
