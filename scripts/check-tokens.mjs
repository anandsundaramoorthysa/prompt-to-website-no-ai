/** Token discipline gate: block CSS may reference tokens, never raw values. */
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const blocks = join(root, 'corpus', 'blocks');
const walk = (d) => readdirSync(d).flatMap((e) => {
  const p = join(d, e);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

/**
 * Raw px is only a smell in *spacing*, where a token exists and consistency
 * matters. Breakpoints, WCAG minimum target sizes and hairline borders have no
 * token and should stay literal — flagging them would train people to ignore
 * this gate, which is worse than not having it.
 */
const SPACING = /(?:^|[;{\s])(margin|padding|gap|row-gap|column-gap)[a-z-]*\s*:[^;]*?\b(\d+)px/;

const failures = [];

for (const file of walk(blocks).filter((f) => f.endsWith('.css'))) {
  const rel = relative(root, file);
  const lines = readFileSync(file, 'utf8').split('\n');

  lines.forEach((line, i) => {
    const at = rel + ':' + (i + 1);
    const trimmed = line.trim();
    if (trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

    if (/#[0-9a-fA-F]{3,8}\b/.test(line)) {
      failures.push(at + '  raw hex colour (use a --pw-color token)');
    }

    const m = SPACING.exec(line);
    if (m && Number(m[2]) > 3) {
      failures.push(at + '  raw ' + m[2] + 'px in ' + m[1] + ' (use a --pw-space token)');
    }

    if (/(?:^|[;{\s])(margin|padding)-(left|right|top|bottom)\s*:/.test(line)) {
      failures.push(at + '  physical property (use logical: margin-inline / padding-block)');
    }

    if (/^\s*opacity\s*:/.test(line)) {
      failures.push(at + '  opacity on a styled element hides contrast failures');
    }
  });
}

if (failures.length) {
  console.error('Token gate FAILED:\n  ' + failures.join('\n  '));
  process.exit(1);
}
console.log('Token gate passed: block CSS references tokens for colour and spacing.');
