import { createHash, randomInt, timingSafeEqual } from 'node:crypto';

export const ROOM_CODE_LENGTH = 8;
export const JOIN_SECRET_LENGTH = 8;
export const JOIN_ATTEMPT_LIMIT = 6;
export const JOIN_ATTEMPT_WINDOW_MS = 60_000;

const TOKEN_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const DEFAULT_PRODUCTION_ORIGINS = [
  'https://ostrichick.github.io',
  'https://splendor-web-yrrr.onrender.com',
];

function randomToken(length: number): string {
  let value = '';
  for (let index = 0; index < length; index += 1) {
    value += TOKEN_ALPHABET[randomInt(TOKEN_ALPHABET.length)];
  }
  return value;
}

export function generateRoomCode(): string {
  return randomToken(ROOM_CODE_LENGTH);
}

export function generateJoinSecret(): string {
  return randomToken(JOIN_SECRET_LENGTH);
}

export function normalizeJoinSecret(value: unknown): string {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

export function hashJoinSecret(value: string): string {
  return createHash('sha256').update(normalizeJoinSecret(value)).digest('hex');
}

export function verifyJoinSecret(candidate: unknown, expectedHash: string): boolean {
  const normalized = normalizeJoinSecret(candidate);
  if (!normalized || !expectedHash) return false;

  const actual = Buffer.from(hashJoinSecret(normalized), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function normalizeOrigin(value: string): string | null {
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

export function parseAllowedOrigins(raw: string | undefined, nodeEnv: string | undefined): string[] {
  if (raw?.trim()) {
    const entries = raw.split(',').map((value) => value.trim()).filter(Boolean);
    if (entries.includes('*')) {
      throw new Error("ALLOWED_ORIGINS='*' is not permitted.");
    }
    return [...new Set(entries.map(normalizeOrigin).filter((value): value is string => Boolean(value)))];
  }

  if (nodeEnv === 'production') return DEFAULT_PRODUCTION_ORIGINS;
  return [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
  ];
}

export function isOriginAllowed(origin: string | undefined, allowedOrigins: readonly string[]): boolean {
  if (!origin) return true;
  const normalized = normalizeOrigin(origin);
  return normalized !== null && allowedOrigins.includes(normalized);
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
}

export class SlidingWindowRateLimiter {
  private readonly attempts = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  attempt(key: string, now = Date.now()): RateLimitResult {
    const cutoff = now - this.windowMs;
    const recent = (this.attempts.get(key) ?? []).filter((timestamp) => timestamp > cutoff);
    if (recent.length >= this.limit) {
      const retryAfterMs = Math.max(1, this.windowMs - (now - recent[0]));
      this.attempts.set(key, recent);
      return { allowed: false, retryAfterMs };
    }

    recent.push(now);
    this.attempts.set(key, recent);
    return { allowed: true, retryAfterMs: 0 };
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}
