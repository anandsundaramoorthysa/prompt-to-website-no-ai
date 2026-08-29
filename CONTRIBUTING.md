# Contributing to Prompt to Website — No AI

Thanks for considering a contribution. The corpus **is** the product — most of the value in
this project is blocks, and blocks are the easiest thing to contribute.

Everything here is enforced by CI, so you will find out about a mistake in seconds rather
than at review.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [The One Rule That Matters](#the-one-rule-that-matters)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Adding a Block](#adding-a-block)
- [Authoring Rules](#authoring-rules)
- [Writing Copy](#writing-copy)
- [Accessibility Review](#accessibility-review)
- [Adding a Site Type](#adding-a-site-type)
- [Adding a Palette](#adding-a-palette)
- [Testing](#testing)
- [Pull Requests](#pull-requests)
- [Project Layout](#project-layout)

---

## Code of Conduct

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
Report unacceptable behaviour to [sanand03072005@gmail.com](mailto:sanand03072005@gmail.com).

---

## The One Rule That Matters

**Every block must be MIT-origin or original work, authored by a person.**

CI enforces all four of these and the build fails otherwise:

| Field | Must be |
| :--- | :--- |
| `provenance.license` | `MIT` |
| `provenance.origin` | `authored`, `bootstrap-examples` or `start-bootstrap` |
| `provenance.author` | `human` |
| `a11y.manual.date` | present |

**Do not paste from:**

- **BootstrapMade** — attribution required, and the free tier forbids client work
- **Preline** — its Fair Use terms exclude reusable tools, which is exactly what this is
- **Tailwind Plus** — commercial, redistribution forbidden
- **Anything with no stated licence** — no stated licence means no rights

This is not bureaucracy. The whole product rests on being able to say honestly where every
line came from — see [CLAIMS.md](CLAIMS.md).

---

## Getting Started

### Prerequisites

- **Node.js 18+**
- **VS Code 1.85+**
- **Git**

### One-Time Setup

```bash
# Fork the repository on GitHub first, then:
git clone https://github.com/<your-username>/prompt-to-website-no-ai.git
cd prompt-to-website-no-ai
npm install
npm run build
```

---

## Development Setup

### Quick Start

```bash
npm run build      # vendor Bootstrap, compile corpus, bundle
npm run verify     # gates + tests + full accessibility sweep
```

Press **F5** in VS Code to launch the Extension Development Host.

### Useful Commands

| Command | Purpose |
| :--- | :--- |
| `npm run build` | Vendor Bootstrap, compile the corpus, bundle with esbuild |
| `npm run watch` | Same, in watch mode |
| `npm run verify` | Everything below, in order — run this before opening a PR |
| `npm test` | 33 unit tests |
| `npm run check:tokens` | Raw colours, raw spacing, physical properties, `opacity` on text |
| `npm run check:contrast` | Every token pair, both themes |
| `npm run check:size` | Package-size budget against the 40 MB cap |
| `npm run audit:coverage` | Render all 160 block pages and audit every one |
| `npm run new-block` | Scaffold a block |

### The CLI Is Faster Than the Extension

The headless CLI shares the same core, so most work does not need the Extension
Development Host at all:

```bash
node dist/cli.cjs "a landing page for a saas called Northwind" --out .tmp/site
node dist/cli.cjs --refine "add a blog page" --out .tmp/site
node dist/cli.cjs "a bakery called Sunrise" --stack html-css --out .tmp/site --dry
```

---

## Adding a Block

```bash
npm run new-block -- hero hero-centred-minimal "Centred minimal"
```

That creates both variants and a manifest pre-filled with the gates CI will check.

Then:

1. **Write the markup and CSS.** Tokens only, logical properties only.
2. **Add copy** under `"<category>.<slot>"` in `corpus/copy/<industry>.json`.
3. **Replace every `TODO`** in `meta.json`, including the manual review.
4. **`npm run verify`**
5. **Generate a test site and audit it:**

```bash
node dist/cli.cjs "a site that uses your block" --out .tmp/mine
npm run audit:a11y -- .tmp/mine
npm run audit:manual -- .tmp/mine
```

### Both Variants

Each block has a `bootstrap` and a `vanilla` variant. If a block genuinely cannot work in
one of them, set `available: false` and say why — do not ship a broken variant.

If the block is interactive, give it a **CSS-only fallback** so the zero-JavaScript stack
keeps it. Patterns already in use:

| Pattern | Technique |
| :--- | :--- |
| Accordion | `<details>` / `<summary>` |
| Mobile navigation | checkbox + `:checked` sibling |
| Carousel | CSS scroll-snap |
| Form validation | native HTML5 constraints |

---

## Authoring Rules

Settled decisions, not preferences. See [PREFLIGHT.md](PREFLIGHT.md) for the reasoning.

| Rule | Enforced by |
| :--- | :--- |
| Tokens only — no raw hex, no raw px in spacing | `check:tokens` |
| Icons named in copy banks must exist | `check:icons` |
| Logical properties (`margin-inline`, `padding-block`, `inset-inline`) | `check:tokens` |
| No `opacity` on text — it silently destroys contrast | `check:tokens` |
| Interactive targets at least `var(--pw-target-min)` — WCAG 2.5.8 | `audit:manual` |
| Sticky elements set `scroll-padding-block-start` — WCAG 2.4.11 | `audit:manual` |
| Nothing drag-only — WCAG 2.5.7 | `audit:manual` |
| No horizontal scroll at 320px — WCAG 1.4.10 | `audit:manual` |
| LF, UTF-8, no BOM | writer + tests |

### The Token Contract

```
--pw-color-primary      --pw-space-1 .. --pw-space-8
--pw-color-surface      --pw-radius-sm|md|lg
--pw-color-bg           --pw-font-display|body
--pw-color-ink          --pw-shadow-sm|md
--pw-color-muted        --pw-target-min   (>= 24px)
--pw-color-line
--pw-color-hero-bg
```

Shared primitives — `.pw-btn`, `.pw-card`, `.pw-form`, `.pw-input`, `.pw-container`,
`.pw-grid` — live in `corpus/base.css`. **Put shared rules there, not in a block.** A block
that quietly depends on another block's CSS renders unstyled when that block is absent.
This has already happened once, to the booking form.

---

## Icons

Icons live in `corpus/icons.json` as bare SVG path data on a 24x24 grid. They are drawn
into the page rather than loaded, which is what keeps generated sites at zero external
requests.

To use one, name it in a copy bank item:

```jsonc
{ "title": "Shared timelines", "body": "...", "icon": "chart" }
```

To add one:

1. Draw it on the same 24x24 grid, single path, no fill
2. Add it to `corpus/icons.json`
3. `npm run check:icons`

Rules: **no fill, stroke only** (icons inherit colour through `currentColor`), keep the
stroke weight consistent with the rest of the set, and never encode meaning in the icon
alone — the heading beside it carries the meaning, which is why icons are `aria-hidden`.

An icon name that does not exist renders the first letter of the item title instead. That
is deliberate, so a typo degrades rather than breaking the page — but `check:icons` will
still fail the build, so it should never reach a user.

---

## Writing Copy

Copy banks are keyed `"<category>.<slot>"` and selected by `hash(prompt) % n`, so more
variants mean less repetition across users' sites.

- **Six variants per slot** where you can manage it
- Write copy a real business would actually ship
- If it reads like filler, it *is* filler, and the block is not finished
- Never put the brand name in a client-logo list — the composer filters it, but do not rely on that

Compare a good and a bad example:

```jsonc
// ✅ specific, plausible, has a point of view
"hero.subheading": [
  "Plan, track and deliver without the weekly status meeting.",
  "Know what is happening without asking anyone."
]

// ❌ lorem with extra steps
"hero.subheading": [
  "The best solution for your business needs.",
  "Empowering teams to achieve more."
]
```

---

## Accessibility Review

axe-core fully automates roughly **29.5%** of WCAG 2.2 success criteria. The dated
`a11y.manual` entry in `meta.json` is not paperwork — it covers the majority of the standard.

`npm run audit:manual` drives a real browser and checks target size, focus-not-obscured,
keyboard reach, dragging and reflow. **Run it, and actually tab through the block with a
sticky header present** before signing the review.

If the automated pass and your own eyes disagree, say so in the PR. Two of this project's
own checks turned out to be wrong and were fixed rather than worked around.

---

## Adding a Site Type

1. `corpus/recipes/<id>.json` — page list, sections per page, default palette, copy bank
2. `corpus/copy/<id>.json` — copy for every category the recipe uses
3. `corpus/lexicon/site-types.json` — weighted terms, plus negative terms for near neighbours
4. Check the classifier actually picks it:

```bash
node dist/cli.cjs "your prompt here" --dry
```

---

## Adding a Palette

`corpus/tokens/<id>.json` needs both `color` and `colorDark`. Then:

```bash
npm run check:contrast
```

The gate verifies every foreground/background pair the corpus can render, in both themes.
A palette that fails cannot ship — this is the guarantee that users cannot customise their
way into an inaccessible site.

---

## Testing

```bash
npm test                  # 33 unit tests
npm run audit:coverage    # all 160 block pages, both themes
npm run verify            # everything
```

Add a test when you change behaviour. The suite covers determinism, stack parity, icon rendering, shared-block consistency, no-JS
integrity, external-request count, session migration and contrast safety.

---

## Pull Requests

1. Branch from `main`
2. `npm run verify` passes
3. Describe **what** changed and **why** — screenshots help enormously for blocks
4. One logical change per PR

For a new block, please include a screenshot of both variants, light and dark.

---

## Project Layout

```
corpus/
  blocks/<category>/<slug>/    bootstrap.html, vanilla.html, *.css, meta.json
  recipes/                     site types: pages and sections
  tokens/                      palettes, light and dark
  copy/                        industry copy banks
  lexicon/                     site types, sections, pages, stacks, stopwords
  base.css                     shared primitives
src/
  parser/                      prompt → intent
  refine/                      prompt stack, edit grammar, session
  compose/                     intent → files
  preview/                     local server
  panel/                       Studio webview
scripts/                       build, gates, audits, scaffolder
test/                          unit tests
```

Generated and vendored paths — `dist/`, `src/generated/`, `corpus/vendor/` — are ignored;
`npm run build` recreates all three.
