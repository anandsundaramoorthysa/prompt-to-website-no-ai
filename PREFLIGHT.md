# Pre-flight decisions

Settled before block #1. Every item here is free to adopt now and a rewrite across
80 blocks x 2 variants later. Referenced from PLAN.md section 8.0.

| # | Decision | Choice | Rationale |
|---|---|---|---|
| 1 | Fonts | **System stacks only** in v1.0; `--fonts embed` flag deferred | Zero bytes, zero external requests, no OFL licence file to ship. Bundled woff2 stays possible because every block reads `--pw-font-*`, never a family name |
| 2 | RTL | **Logical properties everywhere** — `margin-inline`, `padding-block`, `inset-inline`, `text-align: start` | Resolves ~80% of RTL issues at zero cost. Physical properties are a lint error |
| 3 | No-JS fallback | `nojs_fallback` declared on **every** interactive block as authored | Stack 1 is a capability filter, not a third corpus |
| 4 | Line endings | **LF + UTF-8, no BOM**, enforced in the writer and asserted in CI | Byte-identical determinism fails silently between Windows and CI otherwise, taking D7 and D12 with it |
| 5 | Copy banks | 6 variants per slot per industry, selected by `hash(prompt) % n`; CI asserts no headline repeats across 200 prompts | Prevents "lorem with extra steps" and cross-client collisions |
| 6 | Corpus pinning | `session.json` records `corpus` version; replay uses the pinned version | Without it, D12 replay and independent corpus versioning contradict each other |
| 7 | Licence | MIT for extension + corpus + CLI. Output grant stated in generated README | D17 |
| 8 | WCAG 2.2 AA | `scroll-padding-top` on every sticky nav (2.4.11); 24x24 minimum target (2.5.8); no drag-only interactions (2.5.7) | Sticky nav is the canonical 2.4.11 failure and is in this very skeleton |
| 9 | Activation | `onCommand:*` + `onStartupFinished`. Never `*` | Startup delay gets extensions uninstalled regardless of quality |
| 10 | Session schema | `schemaVersion` from v1.0 with a migration switch | Old sites must open after the schema changes |
| 11 | i18n of our UI | All user-facing strings via `vscode.l10n.t()` from day one | Translating later is a feature; extracting later is a refactor |

## Token contract

Every block references tokens only. Raw hex or px in block CSS is a CI failure.

```
--pw-color-primary      --pw-space-1 .. --pw-space-8
--pw-color-surface      --pw-radius-sm|md|lg
--pw-color-bg           --pw-font-display|body
--pw-color-ink          --pw-shadow-sm|md
--pw-color-muted        --pw-target-min   (>= 24px, WCAG 2.5.8)
--pw-color-line
```

For the Bootstrap variant these are additionally projected onto `--bs-*` so Bootstrap
components inherit the same palette, and `data-bs-theme` drives dark mode.
