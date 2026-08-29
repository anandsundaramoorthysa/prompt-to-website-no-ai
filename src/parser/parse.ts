import { CORPUS } from '../generated/corpus.js';
import type { Claim, ClaimKind, Intent, Stack } from '../types.js';

interface Entry { phrase: string; kind: ClaimKind; value: string; weight: number; }

let ENTRIES: Entry[] | null = null;

function entries(): Entry[] {
  if (ENTRIES) return ENTRIES;
  const e: Entry[] = [];
  for (const [id, def] of Object.entries(CORPUS.lexicon.siteTypes)) {
    for (const [phrase, weight] of Object.entries(def.terms)) {
      e.push({ phrase, kind: 'type', value: id, weight });
    }
  }
  for (const [id, list] of Object.entries(CORPUS.lexicon.sections)) {
    for (const phrase of list) e.push({ phrase, kind: 'section', value: id, weight: 0 });
  }
  for (const [id, list] of Object.entries(CORPUS.lexicon.stacks)) {
    for (const phrase of list) e.push({ phrase, kind: 'stack', value: id, weight: 0 });
  }
  // Longest phrase first, so "landing page" wins over "page".
  ENTRIES = e.sort((a, b) => b.phrase.length - a.phrase.length);
  return ENTRIES;
}

const RE_SPECIALS = /[.*+?^${}()|[\]\\]/g;
const escapeRe = (s: string): string => s.replace(RE_SPECIALS, '\\$&');
const wordRe = (phrase: string): RegExp => new RegExp('\\b' + escapeRe(phrase) + '\\b', 'gi');

/**
 * Deterministic prompt parse. No model, no network, no randomness.
 * The same input always produces the same Intent.
 */
export function parse(prompt: string, defaultStack: Stack = 'bootstrap'): Intent {
  const claims: Claim[] = [];
  const taken: boolean[] = new Array(prompt.length).fill(false);

  const free = (s: number, e: number): boolean => {
    for (let i = s; i < e; i++) if (taken[i]) return false;
    return true;
  };
  const claim = (s: number, e: number, kind: ClaimKind, value: string, weight = 0): void => {
    for (let i = s; i < e; i++) taken[i] = true;
    claims.push({ start: s, end: e, kind, value, weight, text: prompt.slice(s, e) });
  };

  // Brand: "called X" / "named X"
  let brand: string | null = null;
  const bm = /\b(?:called|named)\s+([A-Z][\w'&-]*(?:\s+[A-Z][\w'&-]*)?)/.exec(prompt);
  if (bm) {
    const s = bm.index + bm[0].length - bm[1].length;
    if (free(s, s + bm[1].length)) {
      brand = bm[1];
      claim(s, s + bm[1].length, 'brand', brand);
    }
  }

  // Dictionary phrases, longest first
  for (const en of entries()) {
    const re = wordRe(en.phrase);
    let m: RegExpExecArray | null;
    while ((m = re.exec(prompt)) !== null) {
      if (free(m.index, m.index + m[0].length)) {
        claim(m.index, m.index + m[0].length, en.kind, en.value, en.weight);
      }
    }
  }

  // Leftovers that look meaningful are reported, never silently guessed (D5)
  const stop = new Set(CORPUS.lexicon.stopwords);
  const unknown: string[] = [];
  const words = /[A-Za-z][A-Za-z'-]{3,}/g;
  let w: RegExpExecArray | null;
  while ((w = words.exec(prompt)) !== null) {
    const s = w.index;
    const e = s + w[0].length;
    if (!free(s, e)) continue;
    const word = w[0].toLowerCase();
    if (stop.has(word)) continue;
    claim(s, e, 'unknown', word);
    if (unknown.indexOf(word) === -1) unknown.push(word);
  }

  claims.sort((a, b) => a.start - b.start);

  // Site type: weighted score plus negative terms
  const scores: Record<string, number> = {};
  for (const c of claims) {
    if (c.kind === 'type') scores[c.value] = (scores[c.value] || 0) + c.weight;
  }
  for (const [id, def] of Object.entries(CORPUS.lexicon.siteTypes)) {
    const negatives = def.negative || {};
    for (const [phrase, penalty] of Object.entries(negatives)) {
      if (wordRe(phrase).test(prompt)) scores[id] = (scores[id] || 0) + penalty;
    }
  }

  let siteType = '';
  let best = -Infinity;
  for (const [id, v] of Object.entries(scores)) {
    if (v > best) { best = v; siteType = id; }
  }

  const FLOOR = 6;
  const ambiguous = !siteType || best < FLOOR;
  if (!siteType) {
    siteType = CORPUS.recipes['business'] ? 'business' : Object.keys(CORPUS.recipes)[0];
    best = 0;
  }

  const stackClaims = claims.filter((c) => c.kind === 'stack');
  const stack = (stackClaims.length
    ? stackClaims[stackClaims.length - 1].value
    : defaultStack) as Stack;

  const sections = Array.from(
    new Set(claims.filter((c) => c.kind === 'section').map((c) => c.value))
  );

  return {
    prompt,
    siteType,
    siteTypeConfidence: Math.max(0, best),
    ambiguous,
    stack,
    brand,
    sections,
    claims,
    unknown
  };
}
