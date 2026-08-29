/** Alternate variants for the core marketing categories. */
import { write, T, TR, L } from '../author.mjs';

const done = [];

/* ---------------- hero: centered minimal ---------------- */
done.push(write({
  id: 'hero-centered-minimal', category: 'hero', label: 'Centered minimal',
  tags: ['portfolio', 'agency'], conflicts: ['hero-split-image'],
  slots: { heading: TR, subheading: TR, cta_primary: T, cta_secondary: T },
  bootstrapHtml: `<section class="pw-heroc" id="top">
  <div class="container">
    <h1 class="pw-heroc__title">{{heading}}</h1>
    <p class="pw-heroc__sub">{{subheading}}</p>
    <div class="pw-heroc__actions">
      <a class="btn pw-btn pw-btn--primary" href="#cta">{{cta_primary}}</a>
      <a class="btn pw-btn pw-btn--ghost" href="#features">{{cta_secondary}}</a>
    </div>
  </div>
</section>
`,
  vanillaHtml: `<section class="pw-heroc" id="top">
  <div class="pw-container">
    <h1 class="pw-heroc__title">{{heading}}</h1>
    <p class="pw-heroc__sub">{{subheading}}</p>
    <div class="pw-heroc__actions">
      <a class="pw-btn pw-btn--primary" href="#cta">{{cta_primary}}</a>
      <a class="pw-btn pw-btn--ghost" href="#features">{{cta_secondary}}</a>
    </div>
  </div>
</section>
`,
  css: `.pw-heroc { background: var(--pw-color-hero-bg); padding-block: var(--pw-space-8); text-align: center; }
.pw-heroc__title { font-family: var(--pw-font-display); color: var(--pw-color-ink);
  font-size: clamp(2.125rem, 5.5vw, 3.5rem); line-height: 1.08;
  margin-block: 0 var(--pw-space-4); text-wrap: balance; max-inline-size: 18ch; margin-inline: auto; }
.pw-heroc__sub { color: var(--pw-color-muted); font-size: 1.125rem;
  max-inline-size: 52ch; margin-inline: auto; margin-block: 0 var(--pw-space-6); }
.pw-heroc__actions { display: flex; flex-wrap: wrap; gap: var(--pw-space-3); justify-content: center; }
`
}));

/* ---------------- hero: full bleed ---------------- */
done.push(write({
  id: 'hero-full-bleed', category: 'hero', label: 'Full bleed',
  tags: ['restaurant', 'event'], conflicts: ['hero-split-image'], assets: ['hero-gradient'],
  slots: { heading: TR, subheading: TR, cta_primary: T, cta_secondary: T },
  html: `<section class="pw-herof" id="top">
  <div class="pw-herof__media" aria-hidden="true">{{asset:hero-gradient}}</div>
  <div class="pw-herof__inner">
    <h1 class="pw-herof__title">{{heading}}</h1>
    <p class="pw-herof__sub">{{subheading}}</p>
    <a class="pw-btn pw-btn--invert" href="#cta">{{cta_primary}}</a>
  </div>
</section>
`,
  css: `.pw-herof { position: relative; isolation: isolate; display: grid; }
.pw-herof__media { grid-area: 1 / 1; overflow: hidden; }
.pw-herof__media .pw-hero__media { inline-size: 100%; block-size: 100%; object-fit: cover; border-radius: 0; }
.pw-herof__inner {
  grid-area: 1 / 1; z-index: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: var(--pw-space-8) var(--pw-space-4);
  background: var(--pw-color-ink);
}
.pw-herof__title { font-family: var(--pw-font-display); color: var(--pw-color-bg);
  font-size: clamp(2rem, 5vw, 3.25rem); line-height: 1.08;
  margin-block: 0 var(--pw-space-3); text-wrap: balance; max-inline-size: 20ch; }
.pw-herof__sub { color: var(--pw-color-bg); max-inline-size: 46ch;
  margin-block: 0 var(--pw-space-5); }
`
}));

/* ---------------- nav: centered links ---------------- */
done.push(write({
  id: 'nav-centered-links', category: 'nav', label: 'Centered links',
  tags: ['portfolio', 'restaurant'], conflicts: ['nav-sticky-simple'],
  nojs: 'checkbox-toggle', bsJs: 'bootstrap.Collapse',
  slots: { brand: TR, links: L(2, 6), cta_label: T },
  focus: 'not sticky — no obscuring surface',
  bootstrapHtml: `<header class="pw-navc">
  <nav class="container pw-navc__inner" aria-label="Main">
    <a class="pw-navc__brand" href="index.html">{{brand}}</a>
    <ul class="pw-navc__links">
      <!-- pw:repeat links -->
      <li><a class="pw-navc__link" href="{{href}}">{{label}}</a></li>
      <!-- /pw:repeat -->
    </ul>
  </nav>
</header>
`,
  vanillaHtml: `<header class="pw-navc">
  <nav class="pw-container pw-navc__inner" aria-label="Main">
    <a class="pw-navc__brand" href="index.html">{{brand}}</a>
    <ul class="pw-navc__links">
      <!-- pw:repeat links -->
      <li><a class="pw-navc__link" href="{{href}}">{{label}}</a></li>
      <!-- /pw:repeat -->
    </ul>
  </nav>
</header>
`,
  css: `/* Deliberately not sticky: this variant exists for sites where a persistent
   bar would crowd the page. That also removes the 2.4.11 obscuring risk. */
.pw-navc { background: var(--pw-color-surface); border-block-end: 1px solid var(--pw-color-line); }
.pw-navc__inner { display: flex; flex-direction: column; align-items: center;
  gap: var(--pw-space-3); padding-block: var(--pw-space-5); }
.pw-navc__brand { font-family: var(--pw-font-display); font-weight: 600; font-size: 1.25rem;
  color: var(--pw-color-primary); text-decoration: none;
  min-block-size: var(--pw-target-min); display: inline-flex; align-items: center; }
.pw-navc__links { list-style: none; margin: 0; padding: 0;
  display: flex; flex-wrap: wrap; justify-content: center; gap: var(--pw-space-2); }
.pw-navc__link { color: var(--pw-color-muted); text-decoration: none;
  min-block-size: var(--pw-target-min); display: inline-flex; align-items: center;
  padding-inline: var(--pw-space-3); }
.pw-navc__link:hover, .pw-navc__link:focus-visible { color: var(--pw-color-ink); }
`
}));

/* ---------------- footer: four column ---------------- */
done.push(write({
  id: 'footer-four-column', category: 'footer', label: 'Four column',
  tags: ['saas', 'agency'], conflicts: ['footer-simple-centered'],
  slots: { brand: TR, links: L(2, 8), legal: T },
  bootstrapHtml: `<footer class="pw-footer4">
  <div class="container pw-footer4__grid">
    <div class="pw-footer4__brandcol">
      <p class="pw-footer4__brand">{{brand}}</p>
      <p class="pw-footer4__legal">{{legal}}</p>
    </div>
    <nav class="pw-footer4__nav" aria-label="Footer">
      <ul class="pw-footer4__links">
        <!-- pw:repeat links -->
        <li><a class="pw-footer4__link" href="{{href}}">{{label}}</a></li>
        <!-- /pw:repeat -->
      </ul>
    </nav>
  </div>
</footer>
`,
  vanillaHtml: `<footer class="pw-footer4">
  <div class="pw-container pw-footer4__grid">
    <div class="pw-footer4__brandcol">
      <p class="pw-footer4__brand">{{brand}}</p>
      <p class="pw-footer4__legal">{{legal}}</p>
    </div>
    <nav class="pw-footer4__nav" aria-label="Footer">
      <ul class="pw-footer4__links">
        <!-- pw:repeat links -->
        <li><a class="pw-footer4__link" href="{{href}}">{{label}}</a></li>
        <!-- /pw:repeat -->
      </ul>
    </nav>
  </div>
</footer>
`,
  css: `.pw-footer4 { padding-block: var(--pw-space-7); background: var(--pw-color-surface);
  border-block-start: 1px solid var(--pw-color-line); }
.pw-footer4__grid { display: grid; gap: var(--pw-space-5); }
@media (min-width: 768px) { .pw-footer4__grid { grid-template-columns: 2fr 3fr; align-items: start; } }
.pw-footer4__brand { font-family: var(--pw-font-display); font-weight: 600;
  color: var(--pw-color-primary); margin-block: 0 var(--pw-space-2); }
.pw-footer4__legal { color: var(--pw-color-muted); font-size: .875rem; margin: 0; }
.pw-footer4__links { list-style: none; margin: 0; padding: 0;
  display: grid; gap: var(--pw-space-1); grid-template-columns: repeat(2, minmax(0, 1fr)); }
@media (min-width: 768px) { .pw-footer4__links { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.pw-footer4__link { color: var(--pw-color-muted); text-decoration: none;
  min-block-size: var(--pw-target-min); display: inline-flex; align-items: center; }
.pw-footer4__link:hover, .pw-footer4__link:focus-visible {
  color: var(--pw-color-ink); text-decoration: underline; }
`
}));

console.log('batch A: ' + done.join(', '));
