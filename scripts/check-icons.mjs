/** Every icon named by a copy bank must exist. A typo would silently render a letter. */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const set = JSON.parse(readFileSync(join(root, 'corpus', 'icons.json'), 'utf8'));
const known = new Set(Object.keys(set.icons));
const bad = [];
let used = 0;

const walk = (node, bank, path) => {
  if (Array.isArray(node)) return node.forEach((n, i) => walk(n, bank, path + '[' + i + ']'));
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === 'icon' && typeof v === 'string') {
        used++;
        if (!known.has(v)) bad.push(bank + ' ' + path + '.icon = "' + v + '"');
      } else walk(v, bank, path + '.' + k);
    }
  }
};

for (const f of readdirSync(join(root, 'corpus', 'copy'))) {
  if (!f.endsWith('.json')) continue;
  walk(JSON.parse(readFileSync(join(root, 'corpus', 'copy', f), 'utf8')), f.replace('.json', ''), '');
}

if (bad.length) {
  console.error('Icon gate FAILED — unknown icon name(s):\n  ' + bad.join('\n  '));
  console.error('\nAvailable: ' + [...known].sort().join(', '));
  process.exit(1);
}
console.log('Icon gate passed: ' + used + ' icon reference(s), all defined in corpus/icons.json.');
