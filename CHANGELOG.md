# Changelog

All notable changes to **Prompt to Website — No AI** are documented here.

## 0.2.0

### 🎨 Icons
- **Inline SVG icon set** — 22 line icons held in `corpus/icons.json` and drawn into the
  page, so generated sites keep the zero-external-request guarantee. No icon font, no CDN.
- Icons inherit colour through `currentColor`, so they can never drift out of contrast
  and never need a palette entry of their own
- Copy banks name an icon per item (`"icon": "shield"`); `features-icon-grid` and
  `services-cards-marked` now show real icons instead of a placeholder letter
- **An unknown icon name falls back to a letter**, so a typo in a copy bank looks
  deliberate rather than broken
- New `check:icons` gate rejects any icon name a copy bank references but the set lacks

### 🧭 Activity Bar
- The extension now has a **sidebar icon and a Prompt stack view**, rather than living
  only in the command palette
- Each step is a row you can click to enable or disable; the site re-resolves immediately
- Generate, Refine, Preview and Studio are available from the view title bar
- Enabled and disabled steps differ by icon as well as colour

### 🏗 Site types
- **`pet-shop`** — 4-page recipe with an industry copy bank (products, testimonials,
  nutrition FAQ)
- **`business`** — generic 4-page recipe, now the fallback when no site type matches.
  Previously unmatched prompts fell through to `agency`, which was chosen only because
  it sorted first alphabetically
- Expanded stopwords so ordinary English words are no longer reported as unrecognised

### 🔍 Studio panel
- **Word map** — colour-coded tags showing which prompt words mapped to which site type,
  section, brand or stack, so the parser's decisions are visible rather than implied

### 🐛 Fixes
- **Shared blocks are identical on every page.** Recipes declare `nav` and `footer` as
  shared, but nothing read that field: variant selection was salted by section index, and
  the footer sits at a different index on each page, so a four-page site shipped three
  different footers. Now salted by category name, with regression tests covering both
  first generation and pages added later by refinement.
- `npm run typecheck` compiles the corpus first, so it works on a fresh clone rather than
  only after a full build. CI ordered typecheck before build and every error cascaded from
  one missing generated module.
- Form primitives (`.pw-form`, `.pw-input`, `.pw-label`) moved into the base layer. The
  booking block silently depended on CSS belonging to the contact block and rendered
  unstyled 21px inputs without it.

### 🧪 Tests
- 33 tests, up from 26: icon rendering and fallback, icon-name validation, shared-block
  consistency, and external-request integrity with icons present

### Thanks
- Pet-shop and business site types, the word map and the expanded vocabulary contributed
  by **Melvin Joshua** ([#1](https://github.com/anandsundaramoorthysa/prompt-to-website-no-ai/pull/1))

## 0.1.0

First release.

### 🧩 Deterministic generation
- **Hand-written parser** — weighted lexicon across 6 site types (SaaS, restaurant,
  portfolio, agency, conference, shop), longest-phrase-first matching, negative terms so
  *"a bakery site, no dashboards"* is not classified as software
- **Unknown terms are reported, never guessed.** Below the confidence floor the extension
  asks rather than picking
- **Byte-identical output** for the same prompt stack, enforced by test and by LF/UTF-8
  normalisation on every write

### 🗂 80-block corpus
- **80 blocks across 37 categories**, 23 with alternatives, two markup variants each
- 6 site types, 6 palettes, 6 industry copy banks
- Compiled into the extension at build time, so activation never reads from disk
- Every block MIT, human-authored, with a dated accessibility review — enforced in CI

### 🧱 Prompt stack
- A site is an ordered, toggleable list of statements rather than a single prompt
- Toggling a step off and back on returns the **exact original bytes**
- Persisted to `.promptsite/session.json` with the corpus version pinned, plus a schema
  version and migration path so old sites keep opening
- Edit grammar: `add`, `remove`, `use`, `make it`, `set`, `rename`, `move`

### 📦 Three output stacks
- `html-css` — zero JavaScript, using CSS-only patterns (`<details>` accordions, checkbox
  navigation, scroll-snap carousels)
- `html-css-js` — same markup plus vanilla progressive enhancement
- `bootstrap` — Bootstrap 5.3 vendored (MIT), themed through `--bs-*` custom properties
- All three emit the same sections in the same order; no build step in any of them

### 🎨 Customization axes
- Palette, corner radius, spacing density and shadow depth, all driven from the prompt
- A custom primary colour is given a foreground that passes contrast automatically

### 🌐 Preview
- Local static server on `127.0.0.1` opened in your own browser, so DevTools, responsive
  mode and Lighthouse all work
- Reload snippet injected **into the response only** — files on disk stay byte-identical
- Loopback-only bind, no traversal above the site root, off until asked, port scan 5510–5520

### 🖥 Commands
- Generate, Refine, Studio panel, Preview, Stop preview, Insert block, Re-theme,
  Copy diagnostic report
- `Insert block` works on any HTML file, including hand-written pages, inheriting whatever
  tokens the file already uses

### 🔒 Provenance
- `PROVENANCE.txt` per site: corpus hash, per-block hashes, prompt hash, third-party licences
- The attestation is explicitly **scoped to the generated output and the corpus**
- [CLAIMS.md](CLAIMS.md) states what is and is not claimed, each mapped to a test or artifact

### ♿ Accessibility
- WCAG **2.2** AA targeted, matching EN 301 549 v4.1.1
- axe-core with `target-size` (2.5.8) explicitly enabled, light **and** dark
- Browser-driven checks for focus-not-obscured (2.4.11), keyboard reach (2.1.1), dragging
  alternatives (2.5.7) and reflow at 320px (1.4.10)
- All **160 block pages** audited, plus every page of every site type

### 🧪 Quality gates
- 26 tests: determinism, stack parity, no-JS integrity, zero external requests, session
  migration, contrast safety across arbitrary custom colours
- Token gate — no raw colours, no raw spacing, no physical properties, no `opacity` on text
- Contrast gate — every token pair in both themes
- Package-size budget against the 40 MB Marketplace cap
- Licence and authorship allowlist on every block

### 🌍 Localisation
- All user-facing strings externalised via `vscode.l10n`
- German bundle included

### Notes
- Desktop VS Code only. The extension needs Node to write files and run the preview server,
  so `vscode.dev` is out of scope by architecture.
- MIT throughout. Generated sites carry no attribution requirement.
