/**
 * Headless entry point. Same core as the extension, no vscode import.
 *   prompt-to-website "<prompt>" [--out dir] [--stack ...] [--dry]
 *   prompt-to-website --refine "<step>" [--out dir]
 *   prompt-to-website --stack-list [--out dir]
 *   prompt-to-website --toggle <id> [--out dir]
 */
import * as path from 'node:path';
import { compose, vendorFiles } from './compose/compose.js';
import { writeAll } from './write/writer.js';
import { resolveSession } from './refine/resolve.js';
import { loadSession, saveSession, newSession, addStep, toggleStep } from './refine/session.js';
import type { Stack } from './types.js';

function flag(args: string[], name: string, fallback: string): string {
  const i = args.indexOf('--' + name);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}

export async function run(argv: string[]): Promise<number> {
  const args = argv.slice(2);
  const out = path.resolve(flag(args, 'out', 'site'));
  const dry = args.includes('--dry');

  const refineIdx = args.indexOf('--refine');
  const toggleIdx = args.indexOf('--toggle');
  const listOnly = args.includes('--stack-list');

  let session = await loadSession(out);

  if (listOnly) {
    if (!session) { console.error('No session at ' + out); return 1; }
    for (const s of session.steps) {
      console.log(`${s.enabled ? '[x]' : '[ ]'} ${s.id}  ${s.text}`);
    }
    return 0;
  }

  if (toggleIdx !== -1) {
    if (!session) { console.error('No session at ' + out); return 1; }
    session = toggleStep(session, Number(args[toggleIdx + 1]));
  } else if (refineIdx !== -1) {
    if (!session) { console.error('No session at ' + out + '. Generate first.'); return 1; }
    const step = args[refineIdx + 1];
    if (!step) { console.error('--refine needs a step, e.g. --refine "add a blog page"'); return 1; }
    session = addStep(session, step);
  } else {
    const prompt = args.filter((a) => !a.startsWith('--'))[0];
    if (!prompt) {
      console.error('usage: prompt-to-website "<prompt>" [--out dir] [--stack bootstrap|html-css-js|html-css]');
      console.error('       prompt-to-website --refine "<step>" [--out dir]');
      return 1;
    }
    session = newSession(prompt, flag(args, 'stack', 'bootstrap') as Stack);
  }

  const t0 = Date.now();
  const { plan, model } = resolveSession(session);
  const { files, warnings } = compose(plan);
  const vendorRoot = path.resolve(__dirname, '..', 'corpus', 'vendor');
  const all = files.concat(vendorFiles(plan.intent.stack, vendorRoot));
  const ms = Date.now() - t0;

  console.log('steps       : ' + session.steps.filter((s) => s.enabled).length +
              ' of ' + session.steps.length + ' active');
  console.log('site type   : ' + model.siteType + (plan.intent.ambiguous ? '  (LOW CONFIDENCE)' : ''));
  console.log('stack       : ' + model.stack);
  console.log('brand       : ' + (model.brand || '(placeholder)'));
  console.log('palette     : ' + model.palette +
              '  radius=' + model.axes.radius + ' density=' + model.axes.density +
              ' elevation=' + model.axes.elevation + (model.axes.primary ? ' primary=' + model.axes.primary : ''));
  console.log('pages       : ' + plan.pages.map((p) => p.slug).join(', '));
  console.log('blocks      : ' + plan.blocks.length);
  if (model.unknown.length) console.log('not understood: ' + model.unknown.join(', '));
  for (const n of model.notes) console.log('note        : ' + n);
  for (const w of warnings) console.log('warning     : ' + w);
  console.log('composed in : ' + ms + 'ms  (' + all.length + ' files)');

  if (dry) return 0;
  await writeAll(out, all);
  await saveSession(out, session);
  console.log('written to  : ' + out);
  return 0;
}

run(process.argv).then((code) => { process.exitCode = code; }, (err) => {
  console.error(err);
  process.exitCode = 1;
});
