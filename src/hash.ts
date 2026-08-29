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

/**
 * Stable salt from a category name. Shared blocks (nav, footer) must resolve to
 * the same variant on every page; salting by section index gave a site three
 * different footers because the footer sits at a different index on each page.
 */
export function saltFor(name: string): number {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
