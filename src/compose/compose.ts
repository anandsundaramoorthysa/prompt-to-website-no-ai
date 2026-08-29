import { CORPUS } from '../generated/corpus.js';
import { sha256 } from '../hash.js';
import { renderTokens } from './tokens.js';
import { render, missingSlots } from './template.js';
import { heroGradient, favicon, tile } from './assets.js';
import { fillSlots } from './slots.js';
import type { Plan } from '../types.js';

export interface GeneratedFile { path: string; content: string; copyFrom?: string; }

const EMDASH = '—';

/** Plan -> the complete set of files. Pure: the same plan always yields the same bytes. */
export function compose(plan: Plan): { files: GeneratedFile[]; warnings: string[] } {
  const { intent, recipe, tokens, pages, seed } = plan;
  const brand = intent.brand || 'Your Brand';
  const bank: Record<string, any> = CORPUS.copy[recipe.copyBank] || {};
  const warnings: string[] = [];
  const bs = intent.stack === 'bootstrap';

  const navLinks = pages.map((p) => ({
    label: p.title,
    href: p.slug === 'index' ? 'index.html' : p.slug + '.html'
  }));

  const assets: Record<string, string> = {
    'hero-gradient': heroGradient(seed, brand + ' illustration'),
    'tile': tile(seed)
  };
  const allTodos: string[] = [];

  const files: GeneratedFile[] = [];
  const usedCss: string[] = [];
  const usedBlocks: string[] = [];

  for (const page of pages) {
    const parts: string[] = [];
    for (const cat of page.sections) {
      const block = CORPUS.blocks[page.variants[cat]];
      const variant = block.variants[bs ? 'bootstrap' : 'vanilla'];
      const filled = fillSlots(block, bank, { brand, navLinks, pageTitle: page.title, seed });
      const data = filled.data;
      for (const t of filled.todos) if (allTodos.indexOf(t) === -1) allTodos.push(t);
      const missing = missingSlots(variant.html, data);
      if (missing.length) warnings.push(block.id + ': unfilled slots ' + missing.join(', '));
      parts.push(render(variant.html, data, assets));
      if (usedCss.indexOf(variant.css) === -1) usedCss.push(variant.css);
      if (usedBlocks.indexOf(block.id) === -1) usedBlocks.push(block.id);
    }
    files.push({
      path: page.slug + '.html',
      content: htmlDocument(page.title, brand, parts.join('\n'), intent.stack)
    });
  }

  files.push({ path: 'css/tokens.css', content: renderTokens(tokens, intent.stack) + '\n' });
  files.push({ path: 'css/styles.css', content: [CORPUS.baseCss].concat(usedCss).join('\n') });
  if (intent.stack === 'html-css-js') {
    files.push({ path: 'js/main.js', content: progressiveJs() });
  }
  files.push({ path: 'favicon.svg', content: favicon(brand, seed) });
  files.push({ path: 'robots.txt', content: 'User-agent: *\nAllow: /\nSitemap: sitemap.xml\n' });
  files.push({ path: 'sitemap.xml', content: sitemap(pages.map((p) => p.slug)) });
  files.push({ path: 'README.md', content: readme(brand, intent.stack, pages.length, allTodos) });
  files.push({ path: 'PROVENANCE.txt', content: provenance(intent.prompt, usedBlocks, intent.stack) });

  return { files, warnings };
}

function htmlDocument(title: string, brand: string, body: string, stack: string): string {
  const bs = stack === 'bootstrap';
  const head = [
    '<!doctype html>',
    '<html lang="en" dir="ltr">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>' + esc(title) + ' ' + EMDASH + ' ' + esc(brand) + '</title>',
    '<meta name="description" content="TODO: one-sentence description of ' + esc(brand) + '.">',
    '<meta property="og:title" content="' + esc(title) + ' ' + EMDASH + ' ' + esc(brand) + '">',
    '<meta property="og:type" content="website">',
    '<meta name="theme-color" content="#1F5C94">',
    '<link rel="icon" href="favicon.svg" type="image/svg+xml">',
    bs ? '<link rel="stylesheet" href="assets/bootstrap/bootstrap.min.css">' : '',
    '<link rel="stylesheet" href="css/tokens.css">',
    '<link rel="stylesheet" href="css/styles.css">',
    '</head>',
    '<body>',
    '<a class="pw-visually-hidden" href="#main">Skip to content</a>'
  ].filter(Boolean).join('\n');

  // Stack 3 gets the Bootstrap bundle, stack 2 gets progressive enhancement,
  // stack 1 gets nothing at all — that absence is the whole point of stack 1.
  const script = bs
    ? '<script src="assets/bootstrap/bootstrap.bundle.min.js"></script>\n'
    : stack === 'html-css-js'
      ? '<script src="js/main.js" defer></script>\n'
      : '';
  const cut = body.indexOf('</header>');
  const nav = cut === -1 ? '' : body.slice(0, cut + 9);
  const rest = cut === -1 ? body : body.slice(cut + 9);

  return head + '\n' + nav + '\n<main id="main">\n' + rest + '\n</main>\n' + script + '</body>\n</html>\n';
}

function esc(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

function sitemap(slugs: string[]): string {
  const urls = slugs.map((s) => '  <url><loc>' + s + '.html</loc></url>').join('\n');
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + '\n</urlset>\n';
}

function readme(brand: string, stack: string, pageCount: number, todos: string[] = []): string {
  return [
    '# ' + brand,
    '',
    pageCount + ' page static site, stack: `' + stack + '`. No build step ' + EMDASH + ' open `index.html`.',
    '',
    '## Your licence',
    '',
    'This site is yours. No attribution required, no obligations inherited, no restrictions',
    'on commercial use. Third-party notices in `assets/` cover only those bundled files.',
    '',
    '## Before you publish',
    '',
    '- [ ] Replace every TODO marker (meta description, image alt text)',
    ...(todos.length ? ['', 'Unfilled slots in this build:', ...todos.map((t) => '- `' + t + '`')] : []),
    '- [ ] Replace the placeholder copy with your own',
    '- [ ] Swap the generated SVG placeholders for real images',
    '',
    '## Accessibility',
    '',
    'Every block ships WCAG 2.2 AA-audited. **Your content determines final conformance** ' + EMDASH,
    'alt text, copy and any markup you add are not covered by that audit.',
    ''
  ].join('\n');
}

function provenance(prompt: string, blocks: string[], stack: string): string {
  const rows = blocks.map((id) => {
    const b = CORPUS.blocks[id];
    return '  ' + id.padEnd(26) + ' ' + b.provenance.origin.padEnd(10) + ' ' +
      b.provenance.license.padEnd(5) + ' ' + b.provenance.author.padEnd(6) +
      ' sha256:' + b.hash;
  }).join('\n');

  return [
    'PROVENANCE',
    '==========',
    'Generated by : Prompt to Website ' + EMDASH + ' No AI  v' + CORPUS.version,
    'Method       : deterministic template composition',
    'Model used   : NONE',
    'Network      : NONE (no request was made at any point)',
    'Stack        : ' + stack,
    '',
    'This site was assembled from a fixed corpus of human-authored blocks.',
    'No generative AI produced any markup, style, script or asset in this output.',
    '',
    'Corpus hash  : sha256:' + CORPUS.corpusHash,
    'Input prompt : ' + JSON.stringify(prompt),
    'Prompt hash  : sha256:' + sha256(prompt),
    'Reproduce    : same version + same prompt = byte-identical output',
    '',
    'BLOCKS USED',
    rows,
    '',
    'THIRD-PARTY ASSETS',
    stack === 'bootstrap'
      ? '  Bootstrap 5.3        MIT       see assets/bootstrap/LICENSE'
      : '  (none)',
    '',
    'SCOPE OF THIS ATTESTATION',
    '  Covers the generated output and the corpus it was composed from.',
    '  It does not attest to how the extension source itself was written.',
    ''
  ].join('\n');
}

/**
 * Vendored third-party files, copied verbatim at generate time.
 * Not bundled into the extension: D19 keeps activation off the disk, but a
 * generate is already an I/O operation, so 307 KB stays out of the JS bundle.
 */
export function vendorFiles(stack: string, vendorRoot: string): GeneratedFile[] {
  if (stack !== 'bootstrap') return [];
  const join = (a: string, b: string) => a.replace(/[\/]+$/, '') + '/' + b;
  return [
    { path: 'assets/bootstrap/bootstrap.min.css', content: '', copyFrom: join(vendorRoot, 'bootstrap/bootstrap.min.css') },
    { path: 'assets/bootstrap/bootstrap.bundle.min.js', content: '', copyFrom: join(vendorRoot, 'bootstrap/bootstrap.bundle.min.js') },
    { path: 'assets/bootstrap/LICENSE', content: '', copyFrom: join(vendorRoot, 'bootstrap/LICENSE') }
  ];
}

/**
 * Stack 2 only. Progressive enhancement: the page is fully usable before this
 * runs, so stack 1 simply omits it. Nothing here is required for content.
 */
function progressiveJs(): string {
  return [
    '(function () {',
    '  "use strict";',
    '  // Reflect the nav panel state for assistive tech when the checkbox toggles.',
    '  var toggle = document.getElementById("pw-nav-toggle");',
    '  var burger = document.querySelector(".pw-nav__burger");',
    '  if (toggle && burger) {',
    '    var sync = function () { burger.setAttribute("aria-expanded", String(toggle.checked)); };',
    '    burger.setAttribute("role", "button");',
    '    burger.setAttribute("tabindex", "0");',
    '    sync();',
    '    toggle.addEventListener("change", sync);',
    '  }',
    '})();',
    ''
  ].join(String.fromCharCode(10));
}
