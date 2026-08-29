import type { TokenPreset, Stack } from '../types.js';

/** One preset -> two projections: our own --pw-* layer, and Bootstrap's --bs-*. */
export function renderTokens(t: TokenPreset, stack: Stack): string {
  const vars = (c: Record<string, string>) => [
    ...Object.entries(c).map(([k, v]) => `  --pw-color-${k}: ${v};`),
    ...Object.entries(t.font).map(([k, v]) => `  --pw-font-${k}: ${v};`),
    ...Object.entries(t.radius).map(([k, v]) => `  --pw-radius-${k}: ${v};`),
    ...Object.entries(t.space).map(([k, v]) => `  --pw-space-${k}: ${v};`),
    ...Object.entries(t.shadow).map(([k, v]) => `  --pw-shadow-${k}: ${v};`),
    `  --pw-target-min: ${t.target.min};`
  ].join('\n');

  const bs = (c: Record<string, string>) => stack !== 'bootstrap' ? '' : [
    `  --bs-primary: ${c.primary};`,
    `  --bs-body-bg: ${c.bg};`,
    `  --bs-body-color: ${c.ink};`,
    `  --bs-border-color: ${c.line};`,
    `  --bs-secondary-color: ${c.muted};`,
    `  --bs-body-font-family: ${t.font.body};`,
    `  --bs-border-radius: ${t.radius.md};`
  ].join('\n');

  return [
    `:root {`, vars(t.color), bs(t.color), `}`,
    ``,
    `/* Dark mode: same tokens, redefined. Bootstrap components follow --bs-* for free. */`,
    `@media (prefers-color-scheme: dark) {`,
    `  :root:not([data-bs-theme="light"]) {`,
    vars(t.colorDark).replace(/^/gm, '  '),
    bs(t.colorDark).replace(/^/gm, '  '),
    `  }`,
    `}`,
    `[data-bs-theme="dark"] {`, vars(t.colorDark), bs(t.colorDark), `}`
  ].filter(Boolean).join('\n');
}
