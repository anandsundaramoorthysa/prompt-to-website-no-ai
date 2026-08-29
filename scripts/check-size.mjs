/**
 * Package size budget (H1). The Marketplace caps the .vsix at 40 MB, and size
 * regressions are silent until the day publishing breaks. Fail well below it.
 *
 * Also guards the surprise line item: importing prettier's default build pulls
 * parsers for languages this extension never emits.
 */
import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BUDGET_MB = 12;          // hard fail
const WARN_MB = 8;             // shout early

const IGNORE = new Set(['node_modules', '.git', '.tmp', 'out', 'test', 'scripts', '.vscode-test']);
const IGNORE_FILES = [/\.map$/, /^\.vscodeignore$/, /^package-lock\.json$/];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    if (IGNORE.has(name)) return [];
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = walk(root).filter((f) => {
  const rel = relative(root, f);
  return !IGNORE_FILES.some((re) => re.test(rel));
});

const byTop = new Map();
let total = 0;
for (const f of files) {
  const size = statSync(f).size;
  total += size;
  const top = relative(root, f).split(/[\\/]/)[0];
  byTop.set(top, (byTop.get(top) || 0) + size);
}

const mb = (n) => (n / 1024 / 1024).toFixed(2) + ' MB';
console.log('Packaged size estimate: ' + mb(total) + '  (budget ' + BUDGET_MB + ' MB, cap 40 MB)');
for (const [name, size] of [...byTop.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)) {
  console.log('  ' + name.padEnd(20) + mb(size));
}

const problems = [];
if (total / 1024 / 1024 > BUDGET_MB) {
  problems.push('Total ' + mb(total) + ' exceeds the ' + BUDGET_MB + ' MB budget.');
}

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const runtimeDeps = Object.keys(pkg.dependencies || {});
if (runtimeDeps.includes('prettier')) {
  problems.push('prettier is a runtime dependency: import only the html/css/babel parsers (D19).');
}
if (!existsSync(join(root, 'corpus', 'vendor', 'bootstrap', 'LICENSE'))) {
  problems.push('Vendored Bootstrap is missing its LICENSE file.');
}

const rasters = files.filter((f) => /\.(png|jpe?g|gif)$/i.test(f));
if (rasters.length > 4) {
  problems.push(rasters.length + ' raster images shipped — thumbnails must be generated, not bundled (D19).');
}

if (problems.length) {
  console.error('\nSize gate FAILED:\n  ' + problems.join('\n  '));
  process.exit(1);
}
if (total / 1024 / 1024 > WARN_MB) {
  console.warn('\nWarning: over ' + WARN_MB + ' MB. Check what grew before it becomes a problem.');
}
console.log('\nSize gate passed.');
