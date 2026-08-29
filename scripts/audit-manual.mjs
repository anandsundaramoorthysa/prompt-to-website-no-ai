/**
 * The criteria axe cannot reach (H7). axe automates ~29.5% of WCAG 2.2; these
 * are the ones that need a browser and a keyboard, driven here so the sign-off
 * in each meta.json is evidence rather than a promise.
 *
 *   2.4.11 Focus Not Obscured  — tab every focusable, assert it is not hidden
 *                                behind the sticky header
 *   2.5.8  Target Size         — measure every interactive box
 *   1.4.10 Reflow              — 320px with no horizontal scroll
 *   2.1.1  Keyboard            — every interactive element is reachable
 *   2.5.7  Dragging            — no drag-only handlers in generated output
 */
import { readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const siteDir = resolve(process.argv[2] || join(root, '.tmp', 'audit-site'));

if (!existsSync(siteDir)) {
  console.error('No site at ' + siteDir);
  process.exit(1);
}
const pages = readdirSync(siteDir)
  .filter((f) => f.endsWith('.html') && !f.includes('__audit_'))
  .map((f) => join(siteDir, f));

const browser = await chromium.launch();
const failures = [];

for (const file of pages) {
  const name = file.split(/[\\/]/).pop();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });

  /* --- 2.5.8 Target Size (Minimum) --- */
  const small = await page.evaluate(() => {
    // WCAG 2.5.8 exempts targets constrained by the line-height of text.
    // A label is text; the control it points at is the real target.
    const sel = 'a, button, input, select, textarea, summary';
    const out = [];
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || r.width === 0) continue;
      if (el.closest('.pw-visually-hidden')) continue;
      // Inline links in prose are exempt under 2.5.8.
      const inProse = el.tagName === 'A' && ['P', 'LI', 'DD', 'SPAN'].includes(el.parentElement?.tagName || '');
      if (inProse) continue;
      if (r.width < 24 || r.height < 24) {
        out.push(el.tagName.toLowerCase() + '.' + (el.className || '').split(' ')[0] +
                 ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
      }
    }
    return out;
  });
  for (const s of small) failures.push(`${name} 2.5.8 target too small: ${s}`);

  /* --- 2.4.11 Focus Not Obscured ---
     Must measure the element while it actually holds focus: skip links and
     other roving-visibility controls change box entirely on :focus. */
  const obscured = await page.evaluate(() => {
    const sticky = [...document.querySelectorAll('*')].find((el) => {
      const p = getComputedStyle(el).position;
      return p === 'sticky' || p === 'fixed';
    });
    if (!sticky) return [];
    const out = [];
    for (const el of document.querySelectorAll('a[href], button, input, select, textarea, summary')) {
      if (sticky.contains(el)) continue;
      el.focus();
      if (document.activeElement !== el) continue;
      const bar = sticky.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      if (r.height === 0 || r.width === 0) continue;
      // Overlapping rectangles are not occlusion: a skip link with a higher
      // z-index paints above the header. Ask what is actually on top.
      const midX = Math.min(Math.max(r.left + r.width / 2, 1), window.innerWidth - 1);
      const midY = Math.min(Math.max(r.top + r.height / 2, 1), window.innerHeight - 1);
      const topMost = document.elementFromPoint(midX, midY);
      const covered = topMost && !el.contains(topMost) && topMost !== el && sticky.contains(topMost);
      if (covered) out.push((el.textContent || el.tagName).trim().slice(0, 30));
    }
    return out;
  });
  for (const o of obscured) failures.push(`${name} 2.4.11 focus hidden behind sticky header: "${o}"`);

  /* --- 2.1.1 Keyboard: everything interactive is reachable --- */
  const unreachable = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('a[href], button, input, select, textarea, summary')) {
      if (el.closest('[inert]')) continue;
      if (Number(el.getAttribute('tabindex')) < 0) out.push(el.tagName.toLowerCase());
    }
    return out;
  });
  for (const u of unreachable) failures.push(`${name} 2.1.1 not keyboard reachable: ${u}`);

  /* --- 2.5.7 Dragging Movements --- */
  const drag = await page.evaluate(() =>
    [...document.querySelectorAll('[draggable="true"], [onmousedown], [ondragstart]')].length);
  if (drag) failures.push(`${name} 2.5.7 drag-only interaction present (${drag})`);

  /* --- 1.4.10 Reflow at 320px --- */
  await page.setViewportSize({ width: 320, height: 640 });
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) failures.push(`${name} 1.4.10 horizontal scroll at 320px (+${overflow}px)`);

  await page.close();
  if (!small.length && !obscured.length && !unreachable.length && !drag && overflow <= 1) {
    console.log(`ok   ${name}  target-size, focus-not-obscured, keyboard, dragging, reflow`);
  }
}

await browser.close();

if (failures.length) {
  console.error('\nManual-criteria gate FAILED:\n  ' + failures.join('\n  '));
  process.exit(1);
}
console.log('\nManual-criteria gate passed. These results back the a11y.manual entries in meta.json.');
