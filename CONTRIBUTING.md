# Contributing

The corpus is the product. Most of the value here is blocks, and blocks are the
easiest thing to contribute.

## The one rule that matters

**Every block must be MIT-origin or original work, authored by a human.**

CI enforces this and the build fails on anything else:

- `provenance.license` must be `MIT`
- `provenance.origin` must be `authored`, `bootstrap-examples` or `start-bootstrap`
- `provenance.author` must be `human`
- `a11y.manual.date` must be filled in

Do **not** paste from BootstrapMade (attribution required, free tier forbids
client work), Preline (its Fair Use terms exclude reusable tools like this one),
Tailwind Plus (commercial, redistribution forbidden), or anything with no stated
licence. No stated licence means no rights.

## Adding a block

```bash
npm run new-block -- hero hero-centered-minimal "Centered minimal"
```

That scaffolds both variants and a manifest. Then:

1. Write the markup and CSS.
2. Add copy under `"<category>.<slot>"` in `corpus/copy/<industry>.json`.
3. Replace every `TODO` in `meta.json`, including the manual review.
4. `npm run verify`
5. Generate a test site and run `npm run audit:a11y -- .tmp/your-site`

## Authoring rules

These are settled decisions, not preferences. See `PREFLIGHT.md` for why.

| Rule | Gate |
|---|---|
| Tokens only — no raw hex, no raw px in spacing | `check:tokens` |
| Logical properties (`margin-inline`, `padding-block`, `inset-inline`) | `check:tokens` |
| No `opacity` on text — it silently destroys contrast | `check:tokens` |
| Interactive targets at least `var(--pw-target-min)` — WCAG 2.5.8 | `audit:a11y` |
| Sticky elements set `scroll-padding-block-start` — WCAG 2.4.11 | manual review |
| Nothing drag-only — WCAG 2.5.7 | manual review |
| Both variants, or `vanilla.available: false` with a reason | `build:corpus` |
| LF, UTF-8, no BOM | writer + tests |

## On the manual review

axe-core fully automates about **29.5%** of WCAG 2.2 criteria. The dated manual
entry in `meta.json` is not paperwork — it is the majority of the standard.
Actually tab through the block with a sticky header present before you sign it.

## Copy

Six variants per slot where you can manage it, selected by `hash(prompt) % n`.
Write copy a real business would ship. If it reads like filler it is filler,
and the block is not finished.
