/**
 * Renders every block in the corpus, in both variants, and writes:
 *   .tmp/coverage        two contact sheets (fast axe pass over everything)
 *   .tmp/coverage-blocks one page per block  (manual criteria)
 *
 * The split matters. A contact sheet stacks three sticky navs on one page,
 * which no real page does, and that makes focus-not-obscured meaningless.
 * Per-block pages are the honest unit for the manual gate.
 */
import { mkdirSync, writeFileSync, rmSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const core = require(join(root, 'dist', 'core.cjs'));
const { CORPUS } = core;

const NL = String.fromCharCode(10);
const sheetDir = join(root, '.tmp', 'coverage');
const blocksDir = join(root, '.tmp', 'coverage-blocks');
const preset = CORPUS.tokens['clean-corporate'];
const tokensCss = core.__renderTokensForCoverage(preset, 'bootstrap') + NL;
const vendorSrc = join(root, 'corpus', 'vendor', 'bootstrap');

for (const d of [sheetDir, blocksDir]) {
  rmSync(d, { recursive: true, force: true });
  mkdirSync(join(d, 'css'), { recursive: true });
  writeFileSync(join(d, 'css', 'tokens.css'), tokensCss, 'utf8');
  if (existsSync(vendorSrc)) cpSync(vendorSrc, join(d, 'assets', 'bootstrap'), { recursive: true });
}

function sample(spec, name) {
  if (spec.type === 'list') {
    const n = Math.max(spec.min || 2, 3);
    return Array.from({ length: n }, (_, i) => ({
      title: 'Item ' + (i + 1), body: 'Sample body text for coverage rendering.',
      name: 'Name ' + (i + 1), role: 'Role', quote: 'A sample quote for coverage.',
      price: '£' + (10 + i), period: 'per month', note: 'Sample note.',
      cta_label: 'Choose', label: 'Link ' + (i + 1), href: '#', initial: 'A',
      q: 'A sample question?', a: 'A sample answer.', day: 'Monday', time: '09:00 to 17:00',
      dish: 'Sample dish', course: 'Starters', caption: 'Sample caption',
      meta: 'Sample meta', date: '2026-01-01', excerpt: 'Sample excerpt.',
      value: '42', who: 'Someone', topic: 'A talk title', year: '2020',
      mark: 'A', source: 'Source', key: 'Email', link_label: 'Read more'
    }));
  }
  if (typeof spec.default === 'string') return spec.default;
  return 'Sample ' + name.replace(/_/g, ' ');
}

const ASSETS = {
  'hero-gradient': '<svg class="pw-hero__media" viewBox="0 0 640 420" role="img" aria-label="Sample"><rect width="640" height="420" fill="#8899aa"/></svg>',
  tile: '<svg class="pw-tile" viewBox="0 0 400 300" role="img" aria-label="Sample"><rect width="400" height="300" fill="#8899aa"/></svg>'
};

function page(title, bs, cssHref, body) {
  return [
    '<!doctype html>', '<html lang="en" dir="ltr">', '<head>', '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>' + title + '</title>',
    bs ? '<link rel="stylesheet" href="assets/bootstrap/bootstrap.min.css">' : '',
    '<link rel="stylesheet" href="css/tokens.css">',
    '<link rel="stylesheet" href="css/' + cssHref + '">',
    '</head>', '<body>',
    '<a class="pw-visually-hidden" href="#main">Skip to content</a>',
    '<main id="main">', body, '</main>',
    '</body>', '</html>', ''
  ].filter(Boolean).join(NL);
}

const rendered = { bootstrap: 0, vanilla: 0 };
const missing = [];

for (const variant of ['bootstrap', 'vanilla']) {
  const bs = variant === 'bootstrap';
  const parts = [];
  const sheetCss = [CORPUS.baseCss];

  for (const block of Object.values(CORPUS.blocks)) {
    const v = block.variants[variant];
    const usable = block.stacks[variant] && block.stacks[variant].available && v;
    if (!usable) { missing.push(block.id + '/' + variant); continue; }

    const data = { brand: 'Coverage', legal: '© 2026 Coverage.',
      links: [{ label: 'Home', href: 'index.html' }, { label: 'About', href: 'about.html' }] };
    for (const [name, spec] of Object.entries(block.slots || {})) {
      if (!(name in data)) data[name] = sample(spec, name);
    }

    const markup = core.__renderForCoverage(v.html, data, ASSETS);
    parts.push('<!-- ' + block.id + ' -->' + NL + markup);
    if (!sheetCss.includes(v.css)) sheetCss.push(v.css);
    rendered[variant]++;

    const name = variant + '__' + block.id;
    writeFileSync(join(blocksDir, 'css', name + '.css'), [CORPUS.baseCss, v.css].join(NL), 'utf8');
    writeFileSync(join(blocksDir, name + '.html'),
      page(block.id, bs, name + '.css', markup), 'utf8');
  }

  writeFileSync(join(sheetDir, variant + '.html'),
    page('Coverage sheet ' + variant, bs, variant + '.css', parts.join(NL)), 'utf8');
  writeFileSync(join(sheetDir, 'css', variant + '.css'), sheetCss.join(NL), 'utf8');
}

console.log('contact sheets  : ' + sheetDir);
console.log('per-block pages : ' + blocksDir + '  (' + (rendered.bootstrap + rendered.vanilla) + ' pages)');
console.log('  bootstrap: ' + rendered.bootstrap + ' blocks');
console.log('  vanilla  : ' + rendered.vanilla + ' blocks');
console.log('  corpus   : ' + Object.keys(CORPUS.blocks).length + ' blocks');

if (missing.length) {
  console.error(NL + 'Blocks with no usable variant:' + NL + '  ' + missing.join(NL + '  '));
  process.exit(1);
}
