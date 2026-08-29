import { CORPUS } from '../generated/corpus.js';
import { seedFrom, pick } from '../hash.js';
import type { Intent, Plan, ResolvedPage } from '../types.js';

/** Intent -> concrete blocks, filtered by what the chosen stack supports. */
export function buildPlan(intent: Intent): Plan {
  const recipe = CORPUS.recipes[intent.siteType];
  if (!recipe) throw new Error(`No recipe for site type "${intent.siteType}"`);
  const tokens = CORPUS.tokens[recipe.defaultTokens];
  const seed = seedFrom(intent.prompt);

  const variantKey = intent.stack === 'bootstrap' ? 'bootstrap' : 'vanilla';
  const byCategory: Record<string, string[]> = {};
  for (const b of Object.values(CORPUS.blocks)) {
    const avail = b.stacks[variantKey]?.available && b.variants[variantKey];
    if (!avail) continue;
    (byCategory[b.category] ??= []).push(b.id);
  }
  for (const k of Object.keys(byCategory)) byCategory[k].sort();

  const dropped: string[] = [];
  const pages: ResolvedPage[] = recipe.pages.map((p) => {
    const sections: string[] = [];
    const variants: Record<string, string> = {};
    for (const cat of p.sections) {
      const options = byCategory[cat];
      if (!options || !options.length) { dropped.push(cat); continue; }
      sections.push(cat);
      variants[cat] = pick(options, seed, sections.length);
    }
    return { slug: p.slug, title: p.title, sections, variants };
  });

  // Explicitly requested sections the recipe did not already include
  for (const want of intent.sections) {
    const options = byCategory[want];
    if (!options || !options.length) continue;
    const home = pages[0];
    if (home.sections.includes(want)) continue;
    home.sections.splice(Math.max(0, home.sections.length - 1), 0, want);
    home.variants[want] = pick(options, seed, home.sections.length);
  }

  const blocks = [...new Set(pages.flatMap((p) => p.sections.map((s) => p.variants[s])))];
  return { intent, recipe, tokens, pages, blocks, seed, dropped } as Plan & { dropped: string[] };
}
