/**
 * Accessibility gate. Runs axe-core against generated output in BOTH themes.
 *
 * The theme is baked into the HTML before load rather than toggled afterwards:
 * setting data-bs-theme at runtime and immediately calling axe.run races style
 * recalculation and produced 8 / 2 / 0 violations on identical pages during
 * Phase 1. Never trust a post-load theme flip in an audit.
 *
 * Coverage note (H7): axe fully automates ~29.5% of WCAG 2.2 criteria.
 * target-size is enabled explicitly; focus-not-obscured and dragging
 * movements are not in the engine and live on the manual checklist.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const siteDir = resolve(process.argv[2] || join(root, '.tmp', 'audit-site'));
const axeSrc = readFileSync(join(root, 'node_modules', 'axe-core', 'axe.min.js'), 'utf8');

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function auditFile(page, file, theme) {
  const html = readFileSync(file, 'utf8');
  // Bake the theme in before the document is parsed.
  const themed = theme === 'dark'
    ? html.replace('<html lang="en" dir="ltr">', '<html lang="en" dir="ltr" data-bs-theme="dark">')
    : html;
  const tmp = file.replace(/\.html$/, `.__audit_${theme}.html`);
  writeFileSync(tmp, themed, 'utf8');
  await page.goto('file://' + tmp.replace(/\\/g, '/'), { waitUntil: 'load' });
  await page.addScriptTag({ content: axeSrc });
  const result = await page.evaluate(async (tags) => {
    const r = await window.axe.run(document, {
      runOnly: { type: 'tag', values: tags },
      rules: { 'target-size': { enabled: true } }
    });
    return {
      violations: r.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.slice(0, 3).map((n) => ({
          target: n.target.join(' '),
          data: n.any[0] && n.any[0].data
        }))
      })),
      passes: r.passes.length
    };
  }, TAGS);
  return { file, theme, ...result };
}

const { readdirSync } = await import('node:fs');
const pages = existsSync(siteDir)
  ? readdirSync(siteDir)
      .filter((f) => f.endsWith('.html') && !f.includes('__audit_'))
      .map((f) => join(siteDir, f))
  : [];

if (!pages.length) {
  console.error(`No HTML found in ${siteDir}. Generate a site there first.`);
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage();
let failed = 0;

for (const file of pages) {
  for (const theme of ['light', 'dark']) {
    const r = await auditFile(page, file, theme);
    const name = file.split(/[\\/]/).pop();
    if (r.violations.length) {
      failed += r.violations.length;
      console.error(`FAIL ${name} [${theme}]  ${r.passes} passes`);
      for (const v of r.violations) {
        console.error(`  ${v.id} (${v.impact}) x${v.nodes.length}`);
        for (const n of v.nodes) {
          const d = n.data || {};
          const detail = d.contrastRatio
            ? `${d.fgColor} on ${d.bgColor} = ${d.contrastRatio}:1 (needs ${d.expectedContrastRatio})`
            : JSON.stringify(d).slice(0, 90);
          console.error(`    ${n.target}  ${detail}`);
        }
      }
    } else {
      console.log(`ok   ${name} [${theme}]  ${r.passes} passes, 0 violations`);
    }
  }
}

await browser.close();

if (failed) {
  console.error(`\nAccessibility gate FAILED: ${failed} violation group(s).`);
  process.exit(1);
}
console.log('\nAccessibility gate passed (automated portion). Manual checklist still required.');
