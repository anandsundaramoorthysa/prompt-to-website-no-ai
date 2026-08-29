import { CORPUS } from '../generated/corpus.js';
import { pick, saltFor } from '../hash.js';
import type { ResolvedPage, Stack } from '../types.js';

/**
 * The edit grammar (D12). A refinement resolves against a model that already
 * exists — a known page list, section list and token set — so the target space
 * is small and enumerable. That is why refinement is easier than the first parse.
 *
 *   VERB [TARGET] [PREPOSITION SCOPE]
 */

export type Verb = 'add' | 'remove' | 'replace' | 'restyle' | 'rename' | 'move' | null;

export interface Axes {
  radius: 'sharp' | 'soft' | 'rounded' | 'pill';
  density: 'compact' | 'normal' | 'roomy';
  elevation: 'flat' | 'subtle' | 'lifted';
  primary?: string;
}

export const DEFAULT_AXES: Axes = { radius: 'soft', density: 'normal', elevation: 'subtle' };

export interface SiteModel {
  siteType: string;
  stack: Stack;
  palette: string;
  brand: string | null;
  axes: Axes;
  pages: ResolvedPage[];
  seed: number;
  unknown: string[];
  notes: string[];
}

const VERBS: Record<Exclude<Verb, null>, string[]> = {
  add: ['add', 'include', 'also add', 'plus'],
  remove: ['remove', 'delete', 'drop', 'without', 'no longer', 'take out'],
  replace: ['use', 'switch to', 'swap to', 'replace with'],
  restyle: ['make it', 'make the site', 'set'],
  rename: ['rename', 'call it'],
  move: ['move']
};

const AXIS_TERMS: Array<[keyof Axes, string, string[]]> = [
  ['radius', 'sharp', ['sharp', 'sharp corners', 'square corners']],
  ['radius', 'soft', ['soft corners']],
  ['radius', 'rounded', ['rounded', 'round corners']],
  ['radius', 'pill', ['pill', 'pill buttons']],
  ['density', 'compact', ['compact', 'tight', 'dense']],
  ['density', 'normal', ['normal spacing']],
  ['density', 'roomy', ['roomy', 'roomier', 'airy', 'spacious']],
  ['elevation', 'flat', ['flat']],
  ['elevation', 'subtle', ['subtle shadows']],
  ['elevation', 'lifted', ['lifted', 'raised shadows']]
];

const NAMED_COLORS: Record<string, string> = {
  red: '#9B2C2C', orange: '#9C4A21', amber: '#8A6E3B', yellow: '#7A6A1F',
  green: '#2F6B38', teal: '#0F6E70', blue: '#1F5C94',
  indigo: '#3C4B9A', violet: '#5B3E9B', purple: '#6B3FA0', pink: '#A63478',
  slate: '#3D5A80', black: '#1A1A1A', grey: '#4A4A4A', gray: '#4A4A4A'
};

const RE_SPECIALS = /[.*+?^${}()|[\]\\]/g;
const esc = (s: string) => s.replace(RE_SPECIALS, '\\$&');
const has = (text: string, phrase: string) =>
  new RegExp('\\b' + esc(phrase) + '\\b', 'i').test(text);

export interface Mutation {
  verb: Verb;
  sections: string[];
  pages: string[];
  stack: Stack | null;
  palette: string | null;
  axes: Partial<Axes>;
  brand: string | null;
  scopePage: string | null;
  moveUp: boolean;
  unknown: string[];
}

/** Parse one refinement step. Never throws; unknown terms are reported. */
export function parseMutation(text: string): Mutation {
  const m: Mutation = {
    verb: null, sections: [], pages: [], stack: null, palette: null,
    axes: {}, brand: null, scopePage: null, moveUp: false, unknown: []
  };

  for (const [verb, phrases] of Object.entries(VERBS)) {
    if (phrases.some((p) => has(text, p))) { m.verb = verb as Verb; break; }
  }

  for (const [id, phrases] of Object.entries(CORPUS.lexicon.sections)) {
    if (phrases.some((p) => has(text, p))) m.sections.push(id);
  }
  const pageLex: Record<string, string[]> = CORPUS.lexicon.pages || {};
  for (const [slug, phrases] of Object.entries(pageLex)) {
    if (phrases.some((p) => has(text, p))) m.pages.push(slug);
  }
  for (const [id, phrases] of Object.entries(CORPUS.lexicon.stacks)) {
    if (phrases.some((p) => has(text, p))) m.stack = id as Stack;
  }
  for (const [axis, value, phrases] of AXIS_TERMS) {
    if (phrases.some((p) => has(text, p))) (m.axes as any)[axis] = value;
  }

  const hex = /#[0-9a-fA-F]{6}\b/.exec(text);
  if (hex) m.axes.primary = hex[0];
  else {
    for (const [name, value] of Object.entries(NAMED_COLORS)) {
      if (new RegExp('\\b' + name + '\\b', 'i').test(text) && /colou?r|primary|accent/i.test(text)) {
        m.axes.primary = value;
        break;
      }
    }
  }

  for (const id of Object.keys(CORPUS.tokens)) {
    const label = CORPUS.tokens[id].label.toLowerCase();
    if (has(text, id.replace(/-/g, ' ')) || has(text, label)) m.palette = id;
  }
  if (has(text, 'dark')) m.palette = m.palette || 'ink-minimal';

  const rn = /\b(?:rename .*? to|call it|named|called)\s+([A-Z][\w'&-]*(?:\s+[A-Z][\w'&-]*)?)/.exec(text);
  if (rn) m.brand = rn[1];

  const scope = /\bon the ([a-z]+) page\b/i.exec(text);
  if (scope) m.scopePage = scope[1].toLowerCase() === 'home' ? 'index' : scope[1].toLowerCase();

  return m;
}

function pageFor(slug: string, siteType: string, seed: number): ResolvedPage {
  const recipe = CORPUS.recipes[siteType];
  const fromRecipe = recipe.pages.find((p) => p.slug === slug);
  const generic = ['nav', 'page-header', 'about-strip', 'cta', 'footer'];
  const sections = fromRecipe ? [...fromRecipe.sections] : generic;
  const title = fromRecipe ? fromRecipe.title : slug.charAt(0).toUpperCase() + slug.slice(1);

  const available: Record<string, string[]> = {};
  for (const b of Object.values(CORPUS.blocks)) (available[b.category] ??= []).push(b.id);
  for (const k of Object.keys(available)) available[k].sort();

  const shared = new Set(recipe.shared || []);
  const kept: string[] = [];
  const variants: Record<string, string> = {};
  for (const cat of sections) {
    if (!available[cat]?.length) continue;
    kept.push(cat);
    // Shared blocks keep a stable salt so a page added later matches the rest.
    variants[cat] = pick(available[cat], seed, shared.has(cat) ? saltFor(cat) : kept.length);
  }
  return { slug, title, sections: kept, variants };
}

/** Apply one parsed mutation to the model, in place. */
export function applyMutation(model: SiteModel, m: Mutation): void {
  const available: Record<string, string[]> = {};
  const variantKey = model.stack === 'bootstrap' ? 'bootstrap' : 'vanilla';
  for (const b of Object.values(CORPUS.blocks)) {
    if (!b.stacks[variantKey]?.available) continue;
    (available[b.category] ??= []).push(b.id);
  }
  for (const k of Object.keys(available)) available[k].sort();

  const target =
    (m.scopePage && model.pages.find((p) => p.slug === m.scopePage)) || model.pages[0];

  if (m.verb === 'remove') {
    for (const slug of m.pages) {
      const i = model.pages.findIndex((p) => p.slug === slug);
      if (i !== -1 && model.pages.length > 1) model.pages.splice(i, 1);
      else if (i !== -1) model.notes.push('Kept ' + slug + ': a site needs at least one page.');
    }
    for (const cat of m.sections) {
      for (const p of model.pages) {
        const i = p.sections.indexOf(cat);
        if (i !== -1) p.sections.splice(i, 1);
      }
    }
  } else if (m.verb === 'add' || (!m.verb && (m.sections.length || m.pages.length))) {
    for (const slug of m.pages) {
      if (!model.pages.some((p) => p.slug === slug)) {
        model.pages.push(pageFor(slug, model.siteType, model.seed));
      }
    }
    for (const cat of m.sections) {
      if (!available[cat]?.length) {
        model.notes.push('No block for "' + cat + '" in stack ' + model.stack + '.');
        continue;
      }
      if (target.sections.includes(cat)) continue;
      target.sections.splice(Math.max(0, target.sections.length - 1), 0, cat);
      target.variants[cat] = pick(available[cat], model.seed, target.sections.length);
    }
  } else if (m.verb === 'replace') {
    for (const cat of m.sections) {
      for (const p of model.pages) {
        if (!p.sections.includes(cat)) continue;
        const options = available[cat] || [];
        if (options.length < 2) continue;
        const next = (options.indexOf(p.variants[cat]) + 1) % options.length;
        p.variants[cat] = options[next];
      }
    }
  } else if (m.verb === 'move') {
    // Direction comes from the step text, captured by the caller as scopeDir.
    const dir = m.moveUp ? -1 : 1;
    for (const cat of m.sections.slice(0, 1)) {
      for (const p of model.pages) {
        const i = p.sections.indexOf(cat);
        const j = i + dir;
        // Never move past nav (first) or footer (last).
        if (i <= 0 || j <= 0 || j >= p.sections.length - 1) continue;
        [p.sections[j], p.sections[i]] = [p.sections[i], p.sections[j]];
      }
    }
  }

  if (m.brand) model.brand = m.brand;
  if (m.stack) model.stack = m.stack;
  if (m.palette) model.palette = m.palette;
  Object.assign(model.axes, m.axes);
}
