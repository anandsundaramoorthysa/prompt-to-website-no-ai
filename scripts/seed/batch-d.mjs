/** Second alternates across shared categories. */
import { write, T, TR, L } from '../author.mjs';
const done = [];
const pair = (inner, cols) => ({
  bootstrapHtml: inner('container', 'row g-4', `col-md-${12 / cols}`),
  vanillaHtml: inner('pw-container', `pw-grid pw-grid--${cols}`, null)
});

done.push(write({
  id: 'nav-split-cta', category: 'nav', label: 'Split with call to action',
  tags: ['saas', 'shop'], conflicts: ['nav-sticky-simple'],
  nojs: 'checkbox-toggle', bsJs: 'bootstrap.Collapse',
  slots: { brand: TR, links: L(2, 6), cta_label: T },
  html: `<header class="pw-navs">
  <nav class="pw-container pw-navs__inner" aria-label="Main">
    <a class="pw-navs__brand" href="index.html">{{brand}}</a>
    <input class="pw-navs__checkbox pw-visually-hidden" type="checkbox" id="pw-navs-toggle" aria-label="Menu">
    <label class="pw-navs__burger" for="pw-navs-toggle"><span aria-hidden="true">Menu</span></label>
    <div class="pw-navs__panel">
      <ul class="pw-navs__links">
        <!-- pw:repeat links -->
        <li><a class="pw-navs__link" href="{{href}}">{{label}}</a></li>
        <!-- /pw:repeat -->
      </ul>
    </div>
    <a class="pw-btn pw-btn--primary pw-navs__cta" href="#cta">{{cta_label}}</a>
  </nav>
</header>
`,
  css: `html { scroll-padding-block-start: var(--pw-nav-height, 72px); }
.pw-navs { position: sticky; inset-block-start: 0; z-index: 100;
  background: var(--pw-color-surface); border-block-end: 1px solid var(--pw-color-line); }
.pw-navs__inner { display: flex; align-items: center; gap: var(--pw-space-4);
  padding-block: var(--pw-space-3); flex-wrap: wrap; }
.pw-navs__brand { font-family: var(--pw-font-display); font-weight: 600;
  color: var(--pw-color-primary); text-decoration: none;
  min-block-size: var(--pw-target-min); display: inline-flex; align-items: center; }
.pw-navs__panel { margin-inline: auto; }
.pw-navs__links { list-style: none; margin: 0; padding: 0; display: flex; gap: var(--pw-space-2); }
.pw-navs__link { color: var(--pw-color-muted); text-decoration: none;
  min-block-size: var(--pw-target-min); display: inline-flex; align-items: center;
  padding-inline: var(--pw-space-3); }
.pw-navs__link:hover, .pw-navs__link:focus-visible { color: var(--pw-color-ink); }
.pw-navs__burger { display: none; }
@media (max-width: 767px) {
  .pw-navs__burger { display: inline-flex; align-items: center; justify-content: center;
    margin-inline-start: auto; cursor: pointer; min-block-size: 44px; padding-inline: var(--pw-space-3);
    border: 1px solid var(--pw-color-line); border-radius: var(--pw-radius-sm); color: var(--pw-color-ink); }
  .pw-navs__checkbox:focus-visible + .pw-navs__burger {
    outline: 2px solid var(--pw-color-primary); outline-offset: 2px; }
  .pw-navs__panel { flex-basis: 100%; margin-inline: 0; display: none; }
  .pw-navs__checkbox:checked ~ .pw-navs__panel { display: block; }
  .pw-navs__links { flex-direction: column; }
  .pw-navs__cta { flex-basis: 100%; margin-block-start: var(--pw-space-3); }
}
`
}));

done.push(write({
  id: 'about-strip-text-centered', category: 'about-strip', label: 'Centered text',
  tags: ['shared'], conflicts: ['about-strip-image-text'],
  slots: { heading: TR, body: TR },
  html: `<section class="pw-aboutc">
  <div class="pw-container pw-aboutc__inner">
    <h2 class="pw-aboutc__title">{{heading}}</h2>
    <p class="pw-aboutc__body">{{body}}</p>
  </div>
</section>
`,
  css: `.pw-aboutc { padding-block: var(--pw-space-8); }
.pw-aboutc__inner { max-inline-size: 56ch; margin-inline: auto; text-align: center; }
.pw-aboutc__title { font-family: var(--pw-font-display); color: var(--pw-color-ink);
  font-size: clamp(1.5rem, 3vw, 2rem); margin-block: 0 var(--pw-space-3); text-wrap: balance; }
.pw-aboutc__body { color: var(--pw-color-muted); margin: 0; font-size: 1.0625rem; }
`
}));

done.push(write({
  id: 'team-row-portraits', category: 'team', label: 'Row of portraits',
  tags: ['shared'], conflicts: ['team-card-grid'],
  slots: { heading: TR, people: L(2, 8) },
  html: `<section class="pw-teamr" id="team">
  <div class="pw-container">
    <h2 class="pw-section__title">{{heading}}</h2>
    <ul class="pw-teamr__list">
      <!-- pw:repeat people -->
      <li class="pw-teamr__person">
        <p class="pw-teamr__monogram" aria-hidden="true">{{initial}}</p>
        <div>
          <h3 class="pw-teamr__name">{{name}}</h3>
          <p class="pw-teamr__role">{{role}}</p>
        </div>
      </li>
      <!-- /pw:repeat -->
    </ul>
  </div>
</section>
`,
  css: `.pw-teamr { padding-block: var(--pw-space-8); }
.pw-teamr__list { list-style: none; margin: 0; padding: 0; display: flex;
  flex-wrap: wrap; gap: var(--pw-space-6); justify-content: center; }
.pw-teamr__person { display: flex; align-items: center; gap: var(--pw-space-3); }
.pw-teamr__monogram { inline-size: 44px; block-size: 44px; border-radius: 50%; flex: none;
  background: var(--pw-color-hero-bg); color: var(--pw-color-primary);
  font-family: var(--pw-font-display); font-weight: 700;
  display: flex; align-items: center; justify-content: center; margin: 0; }
.pw-teamr__name { font-family: var(--pw-font-display); font-size: 1rem;
  color: var(--pw-color-ink); margin: 0; }
.pw-teamr__role { color: var(--pw-color-muted); font-size: .875rem; margin: 0; }
`
}));

done.push(write({
  id: 'menu-preview-three-column', category: 'menu-preview', label: 'Three highlights',
  tags: ['restaurant'], slots: { heading: TR, subheading: T, items: L(2, 4) },
  ...pair((container, gridCls, col) => `<section class="pw-menup">
  <div class="${container}">
    <h2 class="pw-section__title">{{heading}}</h2>
    <p class="pw-section__sub">{{subheading}}</p>
    <div class="${gridCls}">
      <!-- pw:repeat items -->
      ${col ? `<div class="${col}">` : ''}
      <article class="pw-menup__item">
        <h3 class="pw-menup__dish">{{dish}}</h3>
        <p class="pw-menup__price">{{price}}</p>
        <p class="pw-menup__note">{{note}}</p>
      </article>
      ${col ? '</div>' : ''}
      <!-- /pw:repeat -->
    </div>
  </div>
</section>
`, 3),
  css: `.pw-menup { padding-block: var(--pw-space-8); }
.pw-menup__item { text-align: center; }
.pw-menup__dish { font-family: var(--pw-font-display); font-size: 1.125rem;
  color: var(--pw-color-ink); margin-block: 0 var(--pw-space-1); }
.pw-menup__price { color: var(--pw-color-primary); font-weight: 600;
  font-variant-numeric: tabular-nums; margin-block: 0 var(--pw-space-2); }
.pw-menup__note { color: var(--pw-color-muted); margin: 0; font-size: .9375rem; }
`
}));

done.push(write({
  id: 'services-list-detailed', category: 'services', label: 'Detailed list',
  tags: ['agency'], conflicts: ['services-three-column'],
  slots: { heading: TR, subheading: T, items: L(2, 6) },
  html: `<section class="pw-servl" id="services">
  <div class="pw-container">
    <h2 class="pw-section__title">{{heading}}</h2>
    <p class="pw-section__sub">{{subheading}}</p>
    <dl class="pw-servl__list">
      <!-- pw:repeat items -->
      <div class="pw-servl__row">
        <dt class="pw-servl__title">{{title}}</dt>
        <dd class="pw-servl__body">{{body}}</dd>
      </div>
      <!-- /pw:repeat -->
    </dl>
  </div>
</section>
`,
  css: `.pw-servl { padding-block: var(--pw-space-8); }
.pw-servl__list { margin: 0; max-inline-size: 54rem; margin-inline: auto; }
.pw-servl__row { display: grid; gap: var(--pw-space-2);
  padding-block: var(--pw-space-4); border-block-end: 1px solid var(--pw-color-line); }
@media (min-width: 768px) { .pw-servl__row { grid-template-columns: 14rem 1fr; gap: var(--pw-space-5); } }
.pw-servl__title { font-family: var(--pw-font-display); font-size: 1.125rem; color: var(--pw-color-ink); }
.pw-servl__body { color: var(--pw-color-muted); margin: 0; }
`
}));

done.push(write({
  id: 'page-header-with-image', category: 'page-header', label: 'With image',
  tags: ['shared'], conflicts: ['page-header-simple'], assets: ['hero-gradient'],
  slots: { heading: TR, subheading: T },
  html: `<section class="pw-pagehi">
  <div class="pw-pagehi__media" aria-hidden="true">{{asset:hero-gradient}}</div>
  <div class="pw-pagehi__inner">
    <h1 class="pw-pagehi__title">{{heading}}</h1>
    <p class="pw-pagehi__sub">{{subheading}}</p>
  </div>
</section>
`,
  css: `.pw-pagehi { display: grid; isolation: isolate; }
.pw-pagehi__media { grid-area: 1 / 1; overflow: hidden; }
.pw-pagehi__media .pw-hero__media { inline-size: 100%; block-size: 100%;
  object-fit: cover; border-radius: 0; }
.pw-pagehi__inner { grid-area: 1 / 1; z-index: 1; background: var(--pw-color-ink);
  padding: var(--pw-space-7) var(--pw-space-4); text-align: center; }
.pw-pagehi__title { font-family: var(--pw-font-display); color: var(--pw-color-bg);
  font-size: clamp(1.75rem, 3.5vw, 2.5rem); margin-block: 0 var(--pw-space-2); text-wrap: balance; }
.pw-pagehi__sub { color: var(--pw-color-bg); margin: 0; }
`
}));

done.push(write({
  id: 'footer-minimal', category: 'footer', label: 'Minimal',
  tags: ['portfolio'], conflicts: ['footer-simple-centered', 'footer-four-column'],
  slots: { brand: TR, links: L(2, 6), legal: T },
  html: `<footer class="pw-footm">
  <div class="pw-container pw-footm__inner">
    <p class="pw-footm__legal">{{legal}}</p>
    <ul class="pw-footm__links">
      <!-- pw:repeat links -->
      <li><a class="pw-footm__link" href="{{href}}">{{label}}</a></li>
      <!-- /pw:repeat -->
    </ul>
  </div>
</footer>
`,
  css: `.pw-footm { padding-block: var(--pw-space-6); border-block-start: 1px solid var(--pw-color-line); }
.pw-footm__inner { display: flex; flex-wrap: wrap; gap: var(--pw-space-4);
  align-items: center; justify-content: space-between; }
.pw-footm__legal { color: var(--pw-color-muted); font-size: .875rem; margin: 0; }
.pw-footm__links { list-style: none; margin: 0; padding: 0; display: flex;
  flex-wrap: wrap; gap: var(--pw-space-2); }
.pw-footm__link { color: var(--pw-color-muted); text-decoration: none; font-size: .875rem;
  min-block-size: var(--pw-target-min); display: inline-flex; align-items: center;
  padding-inline: var(--pw-space-2); }
.pw-footm__link:hover, .pw-footm__link:focus-visible {
  color: var(--pw-color-ink); text-decoration: underline; }
`
}));

done.push(write({
  id: 'contact-form-map', category: 'contact', label: 'Form with details',
  tags: ['restaurant', 'shop'], conflicts: ['contact-form-simple'],
  slots: { heading: TR, subheading: T, action: T, submit_label: T, details: L(2, 5) },
  html: `<section class="pw-contactd" id="contact">
  <div class="pw-container pw-contactd__grid">
    <div>
      <h2 class="pw-contactd__title">{{heading}}</h2>
      <p class="pw-contactd__sub">{{subheading}}</p>
      <dl class="pw-contactd__details">
        <!-- pw:repeat details -->
        <div class="pw-contactd__row">
          <dt class="pw-contactd__key">{{key}}</dt>
          <dd class="pw-contactd__val">{{value}}</dd>
        </div>
        <!-- /pw:repeat -->
      </dl>
    </div>
    <form class="pw-form" method="post" action="{{action}}">
      <div class="pw-field">
        <label class="pw-label" for="pw-cd-name">Your name</label>
        <input class="pw-input" type="text" id="pw-cd-name" name="name" autocomplete="name" required>
      </div>
      <div class="pw-field">
        <label class="pw-label" for="pw-cd-email">Email</label>
        <input class="pw-input" type="email" id="pw-cd-email" name="email" autocomplete="email" required>
      </div>
      <div class="pw-field">
        <label class="pw-label" for="pw-cd-msg">Message</label>
        <textarea class="pw-input" id="pw-cd-msg" name="message" rows="4" required></textarea>
      </div>
      <button class="pw-btn pw-btn--primary" type="submit">{{submit_label}}</button>
    </form>
  </div>
</section>
`,
  css: `.pw-contactd { padding-block: var(--pw-space-8); }
.pw-contactd__grid { display: grid; gap: var(--pw-space-7); }
@media (min-width: 768px) { .pw-contactd__grid { grid-template-columns: 1fr 1.2fr; } }
.pw-contactd__title { font-family: var(--pw-font-display); color: var(--pw-color-ink);
  font-size: clamp(1.5rem, 3vw, 2rem); margin-block: 0 var(--pw-space-3); }
.pw-contactd__sub { color: var(--pw-color-muted); margin-block: 0 var(--pw-space-5); }
.pw-contactd__details { margin: 0; }
.pw-contactd__row { display: flex; gap: var(--pw-space-3);
  padding-block: var(--pw-space-2); border-block-end: 1px solid var(--pw-color-line); }
.pw-contactd__key { color: var(--pw-color-muted); min-inline-size: 6rem; }
.pw-contactd__val { margin: 0; color: var(--pw-color-ink); }
`
}));

console.log('batch D: ' + done.join(', '));
