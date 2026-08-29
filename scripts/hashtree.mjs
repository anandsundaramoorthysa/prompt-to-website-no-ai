import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';
const root = process.argv[2];
const walk = (d) => readdirSync(d).flatMap((e) => {
  const p = join(d, e);
  if (e === '.promptsite') return [];
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const h = createHash('sha256');
for (const f of walk(root).map((f) => relative(root, f).split(sep).join('/')).sort()) {
  h.update(f); h.update(readFileSync(join(root, f)));
}
console.log(h.digest('hex').slice(0, 32));
