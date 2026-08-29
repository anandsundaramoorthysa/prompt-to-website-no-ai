/**
 * Vendor Bootstrap into the corpus. Runs at build time only.
 * The extension never fetches anything at runtime — this is why D1 says
 * "no CSS framework compilation, ever": the distributed .min.css IS the artifact.
 */
import { mkdirSync, copyFileSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules', 'bootstrap');
const dest = join(root, 'corpus', 'vendor', 'bootstrap');

mkdirSync(dest, { recursive: true });

const version = JSON.parse(readFileSync(join(src, 'package.json'), 'utf8')).version;
const files = [
  ['dist/css/bootstrap.min.css', 'bootstrap.min.css'],
  ['dist/js/bootstrap.bundle.min.js', 'bootstrap.bundle.min.js'],
  ['LICENSE', 'LICENSE']
];

let total = 0;
for (const [from, to] of files) {
  const s = join(src, from);
  const d = join(dest, to);
  copyFileSync(s, d);
  total += statSync(d).size;
}

writeFileSync(join(dest, 'VERSION'), version + '\n', 'utf8');
console.log(`vendored bootstrap ${version} -> corpus/vendor/bootstrap (${(total / 1024).toFixed(0)} KB)`);
