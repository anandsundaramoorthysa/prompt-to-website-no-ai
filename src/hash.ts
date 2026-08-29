import { createHash } from 'node:crypto';

/** Stable 32-bit seed from a string. Same prompt always seeds the same site. */
export function seedFrom(text: string): number {
  const h = createHash('sha256').update(text).digest();
  return h.readUInt32BE(0);
}
export function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}
/** Deterministic pick — never Math.random(). */
export function pick<T>(list: T[], seed: number, salt = 0): T {
  if (!list.length) throw new Error('pick() on empty list');
  return list[(seed + salt * 2654435761) % list.length];
}
