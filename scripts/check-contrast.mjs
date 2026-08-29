/**
 * Contrast gate. Verifies every token pair a block can legally produce, in
 * both light and dark, against WCAG 2.2 AA. Runs before any block is shipped.
 *
 * Also fails on `opacity` in block CSS: fading a token silently destroys its
 * contrast ratio and axe only catches it once rendered. This is exactly how
 * the logo strip shipped at 3.33:1 in the first Phase 1 build.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const corpus = join(root, 'corpus');

const srgb = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
function luminance(hex) {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
}
function ratio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// Foreground/background pairs the corpus actually renders.
const PAIRS = [
  ['ink', 'bg', 4.5], ['ink', 'surface', 4.5],
  ['muted', 'bg', 4.5], ['muted', 'surface', 4.5], ['muted', 'hero-bg', 4.5],
  ['ink', 'hero-bg', 4.5],
  ['primary', 'bg', 3.0], ['primary', 'surface', 3.0],
  ['primary-ink', 'primary', 4.5]
];

const failures = [];

for (const f of readdirSync(join(corpus, 'tokens')).filter((x) => x.endsWith('.json'))) {
  const preset = JSON.parse(readFileSync(join(corpus, 'tokens', f), 'utf8'));
  for (const [mode, colors] of [['light', preset.color], ['dark', preset.colorDark]]) {
    for (const [fg, bg, min] of PAIRS) {
      if (!colors[fg] || !colors[bg]) continue;
      const r = ratio(colors[fg], colors[bg]);
      if (r < min) {
        failures.push(`${preset.id}/${mode}: ${fg} on ${bg} = ${r.toFixed(2)}:1 (needs ${min}:1)`);
      }
    }
  }
}

// opacity on text is a contrast trapdoor
const walk = (d) => readdirSync(d).flatMap((e) => {
  const p = join(d, e);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
if (existsSync(join(corpus, 'blocks'))) {
  for (const file of walk(join(corpus, 'blocks')).filter((p) => p.endsWith('.css'))) {
    const css = readFileSync(file, 'utf8');
    css.split('\n').forEach((line, i) => {
      if (/^\s*opacity\s*:/.test(line)) {
        failures.push(`${file.replace(root, '.')}:${i + 1}: opacity on a styled element hides contrast failures`);
      }
    });
  }
}

if (failures.length) {
  console.error('Contrast gate FAILED:\n  ' + failures.join('\n  '));
  process.exit(1);
}
console.log('Contrast gate passed: all token pairs meet WCAG 2.2 AA in light and dark.');
