# Prompt to Website — No AI

**Production front-end sites from a prompt. No model, no API key, no network.**

Type what you want. Get a complete, accessible, dependency-free static site in
under 100 ms — composed from a corpus of human-authored, human-audited blocks.
Same prompt, same site, forever.

```
a 4 page site for a bakery called Sunrise with a menu page
```

## Why this exists

AI code generators are measurably worse than the alternative on the axes that
matter for a website you have to maintain:

| Metric, AI-generated vs human-written code | Multiple |
|---|---|
| Total issues introduced | **1.7×** |
| Logic and correctness errors | **1.75×** |
| Security findings | **1.57×** |
| Technical debt growth within 6 months of adoption | **30–41%** |

Accessibility is the thing they skip most consistently — and since **28 June 2025**
the European Accessibility Act has made it a legal requirement for anyone selling
to EU consumers, wherever they are based.

> **AI generates code that looks right. This generates code that is known-good.**

Every block was audited once, by a person. Those properties are then guaranteed
in the output rather than probable.

## Two compliance wedges

- **Where AI codegen is banned** — Flathub bans AI-generated submissions outright;
  Codeberg members voted 358–144 to prohibit primarily-AI-written repositories;
  GCC excludes LLM-derived contributions. Every site ships a `PROVENANCE.txt`
  attesting that no model was involved, with corpus and block hashes.
- **Where accessibility is law** — every block ships WCAG 2.2 AA-audited, which
  removes the part of the job that is hardest to retrofit.

Read [CLAIMS.md](CLAIMS.md) for exactly what is and is not claimed. The boundaries
matter more than the claims.

## Three output stacks

| Stack | Ships | Best for |
|---|---|---|
| `html-css` | Semantic markup + token CSS. **Zero JavaScript.** | Lightest output, locked-down environments, learning fundamentals |
| `html-css-js` | Same markup + vanilla progressive enhancement | Lean and interactive, no frameworks |
| `bootstrap` ⭐ | Bootstrap 5.3 (vendored, MIT) + theme override | Default. Familiar to clients, deepest component set |

All three produce the **same sections in the same order** — only the implementation
differs. No build step in any of them: open `index.html` and it works.

## Commands

| Command | What it does |
|---|---|
| `Prompt to Website: Generate` | Prompt → complete multi-page site |
| `Prompt to Website: Refine` | Keep prompting an existing site |
| `Prompt to Website: Open Studio panel` | The prompt stack, live |
| `Prompt to Website: Preview in browser` | Serves on `127.0.0.1` and opens your real browser |
| `Prompt to Website: Insert block` | Add a section to **any** HTML file, matching its tokens |
| `Prompt to Website: Re-theme` | Swap the palette across a generated site |
| `Prompt to Website: Copy diagnostic report` | Redacted report for an issue. Nothing is sent |

## The prompt stack

A site is not one prompt — it is an ordered, editable stack of statements:

```
[x] 1  a site for a design agency called Fernway
[x] 2  add a blog page
[x] 3  make it roomier, sharp corners
[ ] 4  add testimonials            <- toggled off
```

A chat transcript is not reproducible. **A stack of declarative statements is a
build script.** Toggle any step off and watch the site change; toggle it back and
you get the exact original bytes. The stack lives in `.promptsite/session.json`
with the corpus version pinned, so a replay works months later.

No AI tool can offer that, because it has no addressable intermediate state.

## Preview

Preview runs a small static server on `127.0.0.1` and opens your own browser —
real DevTools, real responsive mode, real Lighthouse. It binds to loopback only,
refuses traversal above the site root, is off until asked, and injects its reload
snippet **into the response only**, never into the files on disk.

## Honest limits

- **It cannot write copy.** Copy banks make placeholders industry-appropriate
  rather than lorem, but they are finite. Every site needs a human copy pass.
- **Bounded variety.** Output diversity is capped by corpus size. Customization
  axes (palette × radius × density × elevation) multiply it; they do not cure it.
- **No novelty.** Anything outside the lexicon is reported, not guessed.
- **Generated imagery is abstract.** Gradients and monograms, not photographs.
- **Accessibility is audited at block level, not certified at site level.**

## Development

```bash
npm install
npm run vendor          # copy Bootstrap into the corpus (MIT)
npm run build           # compile corpus + bundle
npm run verify          # build + contrast + size + tests
npm run audit:a11y -- .tmp/site   # axe-core, both themes
npm run new-block -- hero hero-centered-minimal "Centered minimal"
```

The CLI is the same core as the extension:

```bash
node dist/cli.cjs "a landing page for a saas called Northwind" --out ./site
node dist/cli.cjs --refine "add a blog page" --out ./site
node dist/cli.cjs --stack-list --out ./site
```

## Licence

MIT — extension, corpus and CLI. **Sites you generate are yours**: no attribution
required, no obligations inherited, no restrictions on commercial use. The MIT
notices under `assets/` cover only the third-party files bundled alongside.

No paid tier, no license keys, no telemetry. Ever.
