import { CORPUS } from '../generated/corpus.js';
import { parse } from '../parser/parse.js';
import { buildPlan } from '../compose/plan.js';
import { applyAxes } from '../compose/axes.js';
import { seedFrom } from '../hash.js';
import { DEFAULT_AXES, parseMutation, applyMutation } from './mutate.js';
import type { SiteModel } from './mutate.js';
import type { Session } from './session.js';
import type { Plan, Stack } from '../types.js';

/**
 * The site is a pure function of the enabled steps (D12).
 * Same stack, same corpus version, same bytes — however many refinements deep.
 */
export function resolveSession(session: Session): { plan: Plan; model: SiteModel } {
  const enabled = session.steps.filter((s) => s.enabled);
  if (!enabled.length) throw new Error('The prompt stack has no enabled steps.');

  const base = enabled[0].text;
  const intent = parse(base, session.stack);
  const basePlan = buildPlan(intent);

  const model: SiteModel = {
    siteType: intent.siteType,
    stack: intent.stack,
    palette: basePlan.recipe.defaultTokens,
    brand: intent.brand,
    axes: { ...DEFAULT_AXES },
    pages: basePlan.pages.map((p) => ({ ...p, sections: [...p.sections], variants: { ...p.variants } })),
    seed: seedFrom(base),
    unknown: [...intent.unknown],
    notes: [],
    claims: intent.claims
      .filter((c) => c.kind !== 'unknown')
      .map((c) => ({ text: c.text, kind: c.kind, value: c.value }))
  };

  for (let i = 1; i < enabled.length; i++) {
    const mutation = parseMutation(enabled[i].text);
    if (mutation.verb === null && !mutation.sections.length && !mutation.pages.length &&
        !mutation.stack && !mutation.palette && !Object.keys(mutation.axes).length && !mutation.brand) {
      model.notes.push('Step ' + (i + 1) + ' changed nothing I understood: "' + enabled[i].text + '"');
      continue;
    }
    applyMutation(model, mutation);
  }

  // A stack switch after the fact can strand blocks that variant does not have.
  const variantKey = model.stack === 'bootstrap' ? 'bootstrap' : 'vanilla';
  for (const page of model.pages) {
    const kept: string[] = [];
    for (const cat of page.sections) {
      const block = CORPUS.blocks[page.variants[cat]];
      if (block && block.stacks[variantKey]?.available && block.variants[variantKey]) {
        kept.push(cat);
        continue;
      }
      const alt = Object.values(CORPUS.blocks).find(
        (b) => b.category === cat && b.stacks[variantKey]?.available && b.variants[variantKey]
      );
      if (alt) {
        kept.push(cat);
        page.variants[cat] = alt.id;
      } else {
        model.notes.push('Dropped "' + cat + '": no block available in stack ' + model.stack + '.');
      }
    }
    page.sections = kept;
  }

  const recipe = CORPUS.recipes[model.siteType];
  const preset = CORPUS.tokens[model.palette] || CORPUS.tokens[recipe.defaultTokens];

  const plan: Plan = {
    intent: { ...intent, stack: model.stack as Stack, brand: model.brand, siteType: model.siteType },
    recipe,
    tokens: applyAxes(preset, model.axes),
    pages: model.pages,
    blocks: [...new Set(model.pages.flatMap((p) => p.sections.map((s) => p.variants[s])))],
    seed: model.seed
  };

  return { plan, model };
}
