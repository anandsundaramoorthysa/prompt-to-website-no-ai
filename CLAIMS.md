# Claim register

"No AI" is in the product name, which makes it a **substantiable representation**,
not a slogan. The FTC's *Operation AI Comply* is active and the standard is that
every claim — explicit and implied — must be truthful and backed by competent,
reliable evidence. Counsel commentary is consistent that this applies
symmetrically to claims about the *absence* of AI.

This document states exactly what is and is not claimed, and points each claim
at the test or artifact that supports it. If you find a claim here that the
evidence does not support, open an issue — that is a bug of the most serious kind.

## What we claim

| Claim | Evidence |
|---|---|
| No generative model produces any part of the **generated output** | Deterministic composition; `PROVENANCE.txt` in every site; `test/core.test.mjs` → *same prompt yields byte-identical output* |
| Every corpus block is **human-authored and human-reviewed** | `provenance.author === "human"` on every block, gated in `scripts/build-corpus.mjs`; `test/core.test.mjs` → *every block is MIT, human-authored and manually reviewed* |
| The extension makes **no network request** and contains **no model weights** | Public source; `dependencies: {}` in `package.json`; `test/core.test.mjs` → *generated sites make zero external requests* |
| Output accessibility is **automatically tested and manually reviewed** | `scripts/audit-a11y.mjs` (axe-core, both themes, `target-size` enabled) + dated `a11y.manual` entry per block |
| The same prompt stack reproduces the same site | `test/core.test.mjs` → *a six step chain replays identically*, *toggling a step off and on returns the exact original bytes* |
| Generated sites are yours to use commercially, without attribution | MIT; stated in every generated `README.md` |

## What we do **not** claim

| Not claimed | Why this is stated |
|---|---|
| That the extension's own TypeScript was written without AI assistance | This is the implied claim most likely to be challenged. The attestation in `PROVENANCE.txt` is scoped to the generated output and the corpus, and says so in the file itself. |
| That generated sites are **WCAG 2.2 AA conformant** | axe-core fully automates roughly **29.5%** of WCAG 2.2 success criteria. `target-size` (2.5.8) is the only new 2.2 rule it ships and it is off by default — we enable it explicitly. **Focus Not Obscured (2.4.11)** and **Dragging Movements (2.5.7)** are not in the engine at all and live on a manual checklist. |
| That generated sites are **EAA compliant** | The European Accessibility Act has been enforced across the EU since 28 June 2025. Blocks are audited; your copy, images, alt text and any markup you add are not. The correct sentence is: *every block ships WCAG 2.2 AA-audited; your content determines final conformance.* |
| That any platform will accept a site because of the manifest | The manifest attests. Acceptance is Flathub's, Codeberg's or your auditor's decision, not ours. |
| That the corpus is comprehensive | It is deliberately small and curated. Anything outside the lexicon is reported, never guessed. |

## The accessibility boundary, in one paragraph

Use this wording. Do not improve it.

> Every block ships WCAG 2.2 AA-audited — automated checks with `target-size`
> enabled, plus a dated manual review for the criteria automation cannot reach.
> **Your content determines final conformance.** Alt text, copy, and any markup
> you add are outside that audit.
