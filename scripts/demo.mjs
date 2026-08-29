/**
 * Narrated dry run. Walks one sentence through every stage and prints what the
 * tool actually decided, so the explanation is the real thing rather than a
 * description of it. Writes nothing unless --write is passed.
 */
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const core = require(join(root, 'dist', 'core.cjs'));

const PROMPT = process.argv[2] || 'a 4 page site for a bakery called Sunrise with a menu page';
const REFINEMENTS = process.argv.slice(3).filter((a) => !a.startsWith('--'));

const line = (c = '─') => console.log(c.repeat(74));
const step = (n, title) => { console.log(''); line(); console.log('  STEP ' + n + '   ' + title); line(); };

console.log('');
console.log('  YOU TYPE:');
console.log('  "' + PROMPT + '"');

/* ---------------------------------------------------------------- step 1 */
step(1, 'Reading the sentence against a dictionary');

const intent = core.parse(PROMPT, 'bootstrap');
const marks = { type: 'business type', brand: 'business name', section: 'wants this section',
                stack: 'technology choice', pages: 'page count', unknown: 'NOT RECOGNISED' };

console.log('');
for (const c of intent.claims) {
  console.log('    "' + c.text + '"' + ' '.repeat(Math.max(1, 16 - c.text.length)) +
              '-> ' + (marks[c.kind] || c.kind) + ': ' + c.value);
}
if (!intent.unknown.length) {
  console.log('');
  console.log('    Every meaningful word was recognised. Nothing ignored.');
} else {
  console.log('');
  console.log('    Ignored (and it says so): ' + intent.unknown.join(', '));
}

/* ---------------------------------------------------------------- step 2 */
step(2, 'Deciding what kind of business this is');

const types = Object.entries(core.CORPUS.lexicon.siteTypes);
console.log('');
console.log('    Scores:');
for (const [id, def] of types) {
  let score = 0;
  for (const c of intent.claims) if (c.kind === 'type' && c.value === id) score += c.weight;
  const bar = score > 0 ? '█'.repeat(score) : '';
  console.log('      ' + id.padEnd(16) + String(score).padStart(3) + '  ' + bar);
}
console.log('');
console.log('    Winner: ' + intent.siteType + '   (needs at least 6 to be confident;');
console.log('             below that it stops and asks you instead)');

/* ---------------------------------------------------------------- step 3 */
let session = core.newSession(PROMPT, 'bootstrap');
for (const r of REFINEMENTS) session = core.addStep(session, r);
const { plan, model } = core.resolveSession(session);

step(3, 'Picking the blueprint a person wrote for this business type');

console.log('');
console.log('    Blueprint: ' + plan.recipe.label);
console.log('    Colours:   ' + core.CORPUS.tokens[model.palette].label);
console.log('    Wording:   ' + plan.recipe.copyBank + ' collection');
console.log('');
for (const p of plan.recipe.pages) {
  console.log('      ' + (p.title + ' page').padEnd(16) + p.sections.join(', '));
}

/* ---------------------------------------------------------------- step 4 */
step(4, 'Choosing which version of each piece');

console.log('');
console.log('    The choice is calculated from your exact sentence, so the same');
console.log('    sentence always gives the same pieces.');
console.log('');
for (const p of plan.pages) {
  console.log('      ' + p.title + ' page');
  for (const cat of p.sections) {
    const options = Object.values(core.CORPUS.blocks).filter((b) => b.category === cat).length;
    console.log('        ' + cat.padEnd(16) + '-> ' + p.variants[cat].padEnd(28) +
                '(' + options + ' option' + (options === 1 ? '' : 's') + ')');
  }
  console.log('');
}

/* ---------------------------------------------------------------- step 5 */
step(5, 'Filling in the words');

const { files, warnings } = core.compose(plan);
const home = files.find((f) => f.path === 'index.html').content;
const grab = (re) => { const m = re.exec(home); return m ? m[1].replace(/\s+/g, ' ').trim() : null; };

console.log('');
console.log('    Business name : ' + (model.brand || '(placeholder)'));
const heading = grab(/<h1[^>]*>([\s\S]*?)<\/h1>/);
if (heading) console.log('    Main heading  : "' + heading + '"');
const sub = grab(/class="pw-hero__sub"[^>]*>([\s\S]*?)<\/p>/) ||
            grab(/class="pw-heroc__sub"[^>]*>([\s\S]*?)<\/p>/);
if (sub) console.log('    Sub heading   : "' + sub + '"');
const dish = grab(/class="pw-menu2__dish"[^>]*>([\s\S]*?)<span/) ||
             grab(/class="pw-menu__dish"[^>]*>([\s\S]*?)<\/dt>/);
if (dish) console.log('    A menu item   : "' + dish + '"');
console.log('');
console.log('    None of this is invented. It is chosen from wording written in');
console.log('    advance for this industry.');
if (warnings.length) {
  console.log('');
  for (const w of warnings.slice(0, 3)) console.log('    Left blank, and flagged: ' + w);
}

/* ---------------------------------------------------------------- step 6 */
step(6, 'Building the files');

console.log('');
const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1) + ' KB';
for (const f of files) {
  const note = {
    'index.html': 'the home page',
    'css/tokens.css': 'the colour scheme',
    'css/styles.css': 'the styling for the pieces used',
    'favicon.svg': 'the little tab icon, drawn from the initial',
    'robots.txt': 'instructions for search engines',
    'sitemap.xml': 'a list of pages for search engines',
    'README.md': 'a checklist of what to replace before publishing',
    'PROVENANCE.txt': 'proof of what built this site'
  }[f.path] || (f.path.endsWith('.html') ? 'a page' : '');
  console.log('      ' + f.path.padEnd(22) + kb(f.content).padStart(9) + '   ' + note);
}

/* ------------------------------------------------------------ refinement */
if (REFINEMENTS.length) {
  step(7, 'What your follow-up instructions changed');
  console.log('');
  session.steps.forEach((s, i) => {
    console.log('      ' + (s.enabled ? '[on ]' : '[off]') + ' ' + (i + 1) + '. ' + s.text);
  });
  console.log('');
  console.log('    Pages now : ' + plan.pages.map((p) => p.title).join(', '));
  console.log('    Style now : spacing ' + model.axes.density + ', corners ' + model.axes.radius +
              (model.axes.primary ? ', colour ' + model.axes.primary : ''));
}

/* ---------------------------------------------------------------- proof */
step(REFINEMENTS.length ? 8 : 7, 'The proof it ships with');

const prov = files.find((f) => f.path === 'PROVENANCE.txt').content;
console.log('');
for (const l of prov.split('\n').slice(0, 12)) console.log('    ' + l);
console.log('    ...');

line('═');
console.log('  Same sentence tomorrow, next year: identical site, character for character.');
line('═');
console.log('');
