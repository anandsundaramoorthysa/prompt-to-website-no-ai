/**
 * Block scaffolder (G9). Contributions do not happen unless contributing is
 * one command. Creates both variants and a manifest pre-filled with the gates
 * CI will check, so nothing is discovered at review time.
 *
 *   npm run new-block -- <category> <slug> "Human label"
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [category, slug, label] = process.argv.slice(2);

if (!category || !slug) {
  console.error('usage: npm run new-block -- <category> <slug> "Human label"');
  console.error('example: npm run new-block -- hero hero-centered-minimal "Centered minimal"');
  process.exit(1);
}

const dir = join(root, 'corpus', 'blocks', category, slug);
if (existsSync(dir)) {
  console.error('Already exists: ' + dir);
  process.exit(1);
}
mkdirSync(dir, { recursive: true });

const today = new Date().toISOString().slice(0, 10);
const cls = 'pw-' + category.replace(/[^a-z0-9]+/g, '');

const html = (container, grid) => `<section class="${cls}" id="${category}">
  <div class="${container}">
    <h2 class="pw-section__title">{{heading}}</h2>
    <p class="pw-section__sub">{{subheading}}</p>
    <div class="${grid}">
      <!-- pw:repeat items -->
      <article class="pw-card">
        <h3 class="pw-card__title">{{title}}</h3>
        <p class="pw-card__body">{{body}}</p>
      </article>
      <!-- /pw:repeat -->
    </div>
  </div>
</section>
`;

const css = `/* ${slug}
   Rules the CI gates enforce:
   - tokens only, no raw hex or px  (check:tokens)
   - logical properties only        (margin-inline, padding-block, inset-inline)
   - no opacity on text             (it silently destroys contrast)
   - interactive targets >= var(--pw-target-min)   WCAG 2.2 / 2.5.8
   - sticky elements need scroll-padding-block-start  WCAG 2.2 / 2.4.11 */
.${cls} {
  padding-block: var(--pw-space-8);
}
`;

const meta = {
  id: slug,
  category,
  label: label || slug,
  tags: [],
  weight: 10,
  slots: {
    heading: { type: 'text', required: true },
    subheading: { type: 'text' },
    items: { type: 'list', min: 2, max: 6 }
  },
  stacks: {
    bootstrap: { available: true },
    vanilla: { available: true }
  },
  assets: [],
  insertable: true,
  conflicts: [],
  a11y: {
    automated: { tool: 'axe-core', targetSizeRule: true, violations: 0, date: today },
    manual: {
      focusNotObscured: 'TODO: tab through with a sticky header present',
      dragging: 'TODO: n/a, or describe the no-drag alternative',
      reflow: 'TODO: describe behaviour at 320px',
      date: today,
      by: 'TODO: your name'
    }
  },
  provenance: { origin: 'authored', license: 'MIT', author: 'human', attribution: null }
};

writeFileSync(join(dir, 'bootstrap.html'), html('container', 'row g-4'), 'utf8');
writeFileSync(join(dir, 'vanilla.html'), html('pw-container', 'pw-grid pw-grid--3'), 'utf8');
writeFileSync(join(dir, 'bootstrap.css'), css, 'utf8');
writeFileSync(join(dir, 'vanilla.css'), css, 'utf8');
writeFileSync(join(dir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n', 'utf8');

console.log('Created corpus/blocks/' + category + '/' + slug);
console.log('');
console.log('Next:');
console.log('  1. Write the markup and CSS.');
console.log('  2. Add copy under "' + category + '.<slot>" in corpus/copy/<industry>.json');
console.log('  3. Replace every TODO in meta.json — CI rejects an undated manual review.');
console.log('  4. npm run verify');
console.log('  5. npm run audit:a11y -- .tmp/your-test-site');
