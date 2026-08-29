import { pick } from '../hash.js';
import type { Block } from '../types.js';

/**
 * Slot filling, driven by convention rather than a hardcoded table:
 *   bank["<category>.<slot>"]  ->  array of variants  ->  deterministic pick
 *
 * Falls back to the slot's declared default, then to a visible TODO marker.
 * A silently blank slot is worse than an obvious one (D5).
 */
export interface SlotContext {
  brand: string;
  navLinks: Array<{ label: string; href: string }>;
  pageTitle: string;
  seed: number;
}

export function fillSlots(
  block: Block,
  bank: Record<string, any>,
  ctx: SlotContext
): { data: Record<string, any>; todos: string[] } {
  const data: Record<string, any> = {};
  const todos: string[] = [];
  let salt = 1;

  for (const [name, spec] of Object.entries(block.slots || {})) {
    // Structural slots the composer owns outright.
    if (name === 'brand') { data[name] = ctx.brand; continue; }
    if (name === 'links') { data[name] = ctx.navLinks; continue; }
    if (name === 'legal') {
      data[name] = '© 2026 ' + ctx.brand + '. Built with Prompt to Website — no AI.';
      continue;
    }

    const key = block.category + '.' + name;
    const options = bank[key];
    salt++;

    if (Array.isArray(options) && options.length) {
      const chosen = pick(options as any[], ctx.seed, salt);
      // A client-logo list must never contain the brand itself. Generic copy
      // banks cannot know the brand, so the collision is filtered here.
      data[name] = Array.isArray(chosen)
        ? chosen.filter((row: any) =>
            !(row && typeof row.name === 'string' &&
              row.name.toLowerCase() === ctx.brand.toLowerCase()))
        : chosen;
      continue;
    }
    if (spec && typeof spec.default === 'string') {
      data[name] = spec.default;
      continue;
    }
    if (spec && spec.type === 'list') {
      data[name] = [];
      todos.push(block.id + '.' + name);
      continue;
    }
    // Visible, greppable, and listed in the generated README.
    data[name] = 'TODO: ' + name.replace(/_/g, ' ');
    todos.push(block.id + '.' + name);
  }

  // page-header takes its heading from the page it sits on when the bank is silent.
  if (block.category === 'page-header' && String(data.heading || '').startsWith('TODO')) {
    data.heading = ctx.pageTitle;
    const i = todos.indexOf(block.id + '.heading');
    if (i !== -1) todos.splice(i, 1);
  }

  return { data, todos };
}
