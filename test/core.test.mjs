import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';

const require = createRequire(import.meta.url);
const core = require('../dist/core.cjs');
const {
  parse, compose, resolveSession, newSession, addStep, toggleStep, migrate,
  applyAxes, parseMutation, normalise, CORPUS, SESSION_SCHEMA_VERSION, DEFAULT_AXES
} = core;

const build = (prompt, stack = 'bootstrap', steps = []) => {
  let s = newSession(prompt, stack);
  for (const t of steps) s = addStep(s, t);
  const { plan, model } = resolveSession(s);
  return { session: s, plan, model, ...compose(plan) };
};
const hashFiles = (files) => {
  const h = createHash('sha256');
  for (const f of [...files].sort((a, b) => a.path.localeCompare(b.path))) {
    h.update(f.path); h.update(f.content);
  }
  return h.digest('hex');
};

/* ---------------- parser ---------------- */

test('classifies each site type from a natural prompt', () => {
  const cases = [
    ['a landing page for a project management saas', 'saas-landing'],
    ['a 4 page site for a bakery called Sunrise', 'restaurant'],
    ['a portfolio for a photographer called Rhea', 'portfolio'],
    ['a site for a design agency called Fernway', 'agency']
  ];
  for (const [prompt, expected] of cases) {
    assert.equal(parse(prompt).siteType, expected, prompt);
  }
});

test('negative terms stop a bakery being read as saas', () => {
  const i = parse('a bakery website, no software or dashboards');
  assert.equal(i.siteType, 'restaurant');
});

test('reports unknown terms instead of guessing silently', () => {
  const i = parse('a saas landing page that is artisanal and scrollytelling');
  assert.ok(i.unknown.includes('artisanal'), 'artisanal should be reported');
  assert.ok(i.unknown.includes('scrollytelling'), 'scrollytelling should be reported');
});

test('flags low confidence rather than inventing a site type', () => {
  const i = parse('something nice for my cousin');
  assert.equal(i.ambiguous, true);
});

test('extracts brand and stack from the prompt', () => {
  const i = parse('a landing page for a saas called Northwind, html and css only');
  assert.equal(i.brand, 'Northwind');
  assert.equal(i.stack, 'html-css');
});

/* ---------------- determinism ---------------- */

test('same prompt yields byte-identical output', () => {
  const a = build('a landing page for a project management saas called Northwind');
  const b = build('a landing page for a project management saas called Northwind');
  assert.equal(hashFiles(a.files), hashFiles(b.files));
});

test('different prompts yield different output', () => {
  const a = build('a landing page for a project management saas called Northwind');
  const b = build('a landing page for an analytics saas called Kestrel');
  assert.notEqual(hashFiles(a.files), hashFiles(b.files));
});

/* ---------------- stacks ---------------- */

test('stack 1 ships no JavaScript at all', () => {
  const { files } = build('a landing page for a saas called Northwind', 'html-css');
  const html = files.filter((f) => f.path.endsWith('.html'));
  assert.ok(html.length > 0);
  for (const f of html) {
    assert.ok(!/<script/i.test(f.content), f.path + ' must contain no script tag');
    assert.ok(!/\son[a-z]+\s*=/i.test(f.content), f.path + ' must contain no inline handlers');
  }
  assert.ok(!files.some((f) => f.path === 'js/main.js'));
});

test('stack 2 ships progressive enhancement, stack 3 ships bootstrap', () => {
  const two = build('a landing page for a saas called Northwind', 'html-css-js');
  assert.ok(two.files.some((f) => f.path === 'js/main.js'));
  const three = build('a landing page for a saas called Northwind', 'bootstrap');
  assert.ok(three.files.find((f) => f.path === 'index.html').content.includes('bootstrap.bundle.min.js'));
});

test('stack parity: same sections and page count across all three stacks', () => {
  const p = 'a site for a design agency called Fernway';
  const shape = (stack) => {
    const { plan } = build(p, stack);
    return plan.pages.map((x) => x.slug + ':' + x.sections.join('|')).join(' / ');
  };
  assert.equal(shape('bootstrap'), shape('html-css-js'));
  assert.equal(shape('html-css-js'), shape('html-css'));
});

/* ---------------- output integrity ---------------- */

test('generated sites make zero external requests', () => {
  const { files } = build('a site for a design agency called Fernway');
  for (const f of files.filter((x) => x.path.endsWith('.html') || x.path.endsWith('.css'))) {
    const external = f.content.match(/(?:src|href)\s*=\s*"(https?:)?\/\//gi);
    assert.equal(external, null, f.path + ' must not reference a remote origin');
  }
});

test('every page has one h1, a main landmark and a skip link', () => {
  const { files } = build('a 4 page site for a bakery called Sunrise with a menu page');
  const pages = files.filter((f) => f.path.endsWith('.html'));
  assert.ok(pages.length >= 2, 'expected a multi-page site');
  for (const f of pages) {
    assert.equal((f.content.match(/<h1[\s>]/g) || []).length, 1, f.path + ' needs exactly one h1');
    assert.ok(f.content.includes('<main id="main">'), f.path + ' needs a main landmark');
    assert.ok(f.content.includes('Skip to content'), f.path + ' needs a skip link');
    assert.ok(f.content.includes('lang="en"') && f.content.includes('dir="ltr"'), f.path + ' needs lang and dir');
  }
});

test('writer normalises to LF with no BOM', () => {
  assert.equal(normalise('﻿a\r\nb\rc'), 'a\nb\nc');
});

test('provenance names the corpus, the prompt and the claim scope', () => {
  const { files } = build('a landing page for a saas called Northwind');
  const prov = files.find((f) => f.path === 'PROVENANCE.txt').content;
  assert.ok(prov.includes('Model used   : NONE'));
  assert.ok(prov.includes(CORPUS.corpusHash));
  assert.ok(prov.includes('Northwind'));
  assert.ok(prov.includes('does not attest to how the extension source itself was written'));
});

/* ---------------- corpus gates ---------------- */

test('every block is MIT, human-authored and manually reviewed', () => {
  for (const b of Object.values(CORPUS.blocks)) {
    assert.equal(b.provenance.license, 'MIT', b.id);
    assert.equal(b.provenance.author, 'human', b.id);
    assert.ok(b.a11y.manual && b.a11y.manual.date, b.id + ' needs a dated manual review');
  }
});

test('block CSS uses logical properties, not physical ones', () => {
  const physical = /(?:^|[;{\s])(margin|padding)-(left|right|top|bottom)\s*:/;
  for (const b of Object.values(CORPUS.blocks)) {
    for (const [variant, v] of Object.entries(b.variants)) {
      assert.ok(!physical.test(v.css), b.id + '/' + variant + ' uses a physical property');
    }
  }
});

test('block CSS contains no raw hex colours', () => {
  for (const b of Object.values(CORPUS.blocks)) {
    for (const [variant, v] of Object.entries(b.variants)) {
      assert.equal(v.css.match(/#[0-9a-fA-F]{3,8}\b/), null, b.id + '/' + variant + ' has a raw hex');
    }
  }
});

/* ---------------- refinement ---------------- */

test('a refinement adds a page the recipe never had', () => {
  const before = build('a site for a design agency called Fernway');
  const after = build('a site for a design agency called Fernway', 'bootstrap', ['add a blog page']);
  assert.ok(!before.plan.pages.some((p) => p.slug === 'blog'));
  assert.ok(after.plan.pages.some((p) => p.slug === 'blog'));
});

test('toggling a step off and on returns the exact original bytes', () => {
  let s = newSession('a site for a design agency called Fernway', 'bootstrap');
  s = addStep(s, 'add a blog page');
  s = addStep(s, 'make it roomier');
  const original = hashFiles(compose(resolveSession(s).plan).files);

  const id = s.steps[2].id;
  s = toggleStep(s, id);
  const off = hashFiles(compose(resolveSession(s).plan).files);
  s = toggleStep(s, id);
  const back = hashFiles(compose(resolveSession(s).plan).files);

  assert.notEqual(original, off, 'the step must actually change something');
  assert.equal(original, back, 'toggling must be reversible');
});

test('a six step chain replays identically', () => {
  const steps = ['add a blog page', 'make it roomier', 'add testimonials',
                 'sharp corners', 'remove the work page'];
  const a = hashFiles(build('a site for a design agency called Fernway', 'bootstrap', steps).files);
  const b = hashFiles(build('a site for a design agency called Fernway', 'bootstrap', steps).files);
  assert.equal(a, b);
});

test('edit grammar parses verbs, axes and scope', () => {
  const m = parseMutation('add testimonials on the about page');
  assert.equal(m.verb, 'add');
  assert.ok(m.sections.includes('testimonials'));
  assert.equal(m.scopePage, 'about');

  const r = parseMutation('make it roomier with sharp corners');
  assert.equal(r.axes.density, 'roomy');
  assert.equal(r.axes.radius, 'sharp');
});

test('switching stack mid-chain never strands an unavailable block', () => {
  const { plan, model } = build('a site for a design agency called Fernway', 'bootstrap',
                                ['no javascript']);
  assert.equal(model.stack, 'html-css');
  for (const page of plan.pages) {
    for (const cat of page.sections) {
      const block = CORPUS.blocks[page.variants[cat]];
      assert.ok(block.stacks.vanilla && block.stacks.vanilla.available,
        block.id + ' is not available in the vanilla variant');
    }
  }
});

/* ---------------- customization axes ---------------- */

test('axes change structural tokens without touching contrast', () => {
  const base = CORPUS.tokens['clean-corporate'];
  const roomy = applyAxes(base, { ...DEFAULT_AXES, density: 'roomy', radius: 'sharp' });
  assert.equal(roomy.radius.md, '0px');
  assert.ok(parseFloat(roomy.space['5']) > parseFloat(base.space['5']));
  assert.deepEqual(roomy.color, base.color, 'structural axes must not alter colours');
});

test('a custom primary always gets a readable foreground', () => {
  const lum = (hex) => {
    const n = hex.replace('#', '');
    const c = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255)
      .map((x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  for (const primary of ['#FFEE00', '#101010', '#1F5C94', '#C2317A', '#7FE3D0']) {
    const t = applyAxes(CORPUS.tokens['clean-corporate'], { ...DEFAULT_AXES, primary });
    const [a, b] = [lum(t.color.primary), lum(t.color['primary-ink'])].sort((x, y) => y - x);
    const ratio = (a + 0.05) / (b + 0.05);
    assert.ok(ratio >= 4.5, primary + ' produced only ' + ratio.toFixed(2) + ':1');
  }
});

/* ---------------- session schema ---------------- */

test('a pre-schema session migrates instead of failing', () => {
  const legacy = { steps: ['a landing page for a saas'], stack: 'bootstrap' };
  const s = migrate(legacy);
  assert.equal(s.schemaVersion, SESSION_SCHEMA_VERSION);
  assert.equal(s.steps[0].text, 'a landing page for a saas');
  assert.equal(s.steps[0].enabled, true);
  assert.ok(resolveSession(s).plan.pages.length >= 1);
});

test('sessions pin the corpus version they were built against', () => {
  const s = newSession('a landing page for a saas', 'bootstrap');
  assert.equal(s.corpus, CORPUS.corpusHash);
});
