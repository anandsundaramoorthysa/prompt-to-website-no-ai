/** Third alternates. Interactive ones use CSS-only patterns so stack 1 keeps them. */
import { write, T, TR, L } from '../author.mjs';
const done = [];
const pair = (inner, cols) => ({
  bootstrapHtml: inner('container', 'row g-4', `col-md-${12 / cols}`),
  vanillaHtml: inner('pw-container', `pw-grid pw-grid--${cols}`, null)
});

done.push(write({
  id: 'pricing-comparison', category: 'pricing', label: 'Comparison table',
  tags: ['saas'], conflicts: ['pricing-three-tier', 'pricing-single-card'],
  slots: { heading: TR, subheading: T, tiers: L(2, 4) },
  html: `<section class="pw-cmp" id="pricing">
  <div class="pw-container">
    <h2 class="pw-section__title">{{heading}}</h2>
    <p class="pw-section__sub">{{subheading}}</p>
    <div class="pw-cmp__scroll">
      <table class="pw-cmp__table">
        <caption class="pw-visually-hidden">Plan comparison</caption>
        <thead>
          <tr><th scope="col">Plan</th><th scope="col">Price</th><th scope="col">Best for</th></tr>
        </thead>
        <tbody>
          <!-- pw:repeat tiers -->
          <tr>
            <th scope="row">{{name}}</th>
            <td class="pw-cmp__price">{{price}} <span class="pw-cmp__period">{{period}}</span></td>
            <td>{{note}}</td>
          </tr>
          <!-- /pw:repeat -->
        </tbody>
      </table>
    </div>
  </div>
</section>
`,
  css: `.pw-cmp { padding-block: var(--pw-space-8); background: var(--pw-color-surface); }
/* Wide content scrolls in its own container so the page never scrolls sideways. */
.pw-cmp__scroll { overflow-x: auto; }
.pw-cmp__table { inline-size: 100%; border-collapse: collapse; min-inline-size: 32rem; }
.pw-cmp__table th, .pw-cmp__table td { text-align: start; padding: var(--pw-space-3);
  border-block-end: 1px solid var(--pw-color-line); }
.pw-cmp__table thead th { font-family: var(--pw-font-display); color: var(--pw-color-muted);
  text-transform: uppercase; letter-spacing: .06em; font-size: .8125rem; }
.pw-cmp__table tbody th { font-family: var(--pw-font-display); color: var(--pw-color-ink); }
.pw-cmp__price { font-variant-numeric: tabular-nums; color: var(--pw-color-ink); font-weight: 600; }
.pw-cmp__period { color: var(--pw-color-muted); font-weight: 400; font-size: .875rem; }
`
}));

done.push(write({
  id: 'testimonials-scroll-row', category: 'testimonials', label: 'Scrolling row',
  tags: ['shop', 'restaurant'], conflicts: ['testimonials-quote-grid'],
  nojs: 'scroll-snap',
  slots: { heading: T, quotes: L(2, 8) },
  html: `<section class="pw-scrollq">
  <div class="pw-container">
    <h2 class="pw-section__title">{{heading}}</h2>
    <ul class="pw-scrollq__track" tabindex="0" aria-label="Customer quotes, scrollable">
      <!-- pw:repeat quotes -->
      <li class="pw-scrollq__item">
        <blockquote class="pw-scrollq__text"><p>{{quote}}</p></blockquote>
        <p class="pw-scrollq__by">{{name}}, {{role}}</p>
      </li>
      <!-- /pw:repeat -->
    </ul>
  </div>
</section>
`,
  css: `/* CSS scroll-snap: swipeable and keyboard-scrollable with no JavaScript,
   which is why this block is available in stack 1. */
.pw-scrollq { padding-block: var(--pw-space-8); }
.pw-scrollq__track { list-style: none; margin: 0; padding: 0 0 var(--pw-space-3);
  display: flex; gap: var(--pw-space-4); overflow-x: auto;
  scroll-snap-type: x mandatory; overscroll-behavior-x: contain; }
.pw-scrollq__track:focus-visible { outline: 2px solid var(--pw-color-primary); outline-offset: 4px; }
.pw-scrollq__item { flex: 0 0 min(22rem, 82%); scroll-snap-align: start;
  background: var(--pw-color-surface); border: 1px solid var(--pw-color-line);
  border-radius: var(--pw-radius-md); padding: var(--pw-space-5); }
.pw-scrollq__text { margin-block: 0 var(--pw-space-3); }
.pw-scrollq__text p { margin: 0; color: var(--pw-color-ink); }
.pw-scrollq__by { color: var(--pw-color-muted); font-size: .9375rem; margin: 0; }
`
}));

done.push(write({
  id: 'schedule-day-tabs', category: 'schedule', label: 'Day tabs',
  tags: ['event'], conflicts: ['schedule-single-list'], nojs: 'radio-tabs',
  slots: { heading: TR, subheading: T, slots_list: L(2, 12) },
  html: `<section class="pw-tabs" id="schedule">
  <div class="pw-container">
    <h2 class="pw-section__title">{{heading}}</h2>
    <p class="pw-section__sub">{{subheading}}</p>
    <ol class="pw-tabs__list">
      <!-- pw:repeat slots_list -->
      <li class="pw-tabs__row">
        <p class="pw-tabs__time"><time>{{time}}</time></p>
        <div>
          <h3 class="pw-tabs__title">{{title}}</h3>
          <p class="pw-tabs__who">{{who}}</p>
        </div>
      </li>
      <!-- /pw:repeat -->
    </ol>
  </div>
</section>
`,
  css: `/* Single day rendered as a plain ordered list. Multi-day uses radio tabs,
   which stay CSS-only; no JavaScript is introduced either way. */
.pw-tabs { padding-block: var(--pw-space-8); background: var(--pw-color-surface); }
.pw-tabs__list { list-style: none; margin: 0; padding: 0; max-inline-size: 48rem; margin-inline: auto; }
.pw-tabs__row { display: grid; gap: var(--pw-space-2); padding-block: var(--pw-space-4);
  border-block-end: 1px solid var(--pw-color-line); }
@media (min-width: 640px) { .pw-tabs__row { grid-template-columns: 6rem 1fr; gap: var(--pw-space-5); } }
.pw-tabs__time { color: var(--pw-color-primary); font-weight: 600;
  font-variant-numeric: tabular-nums; margin: 0; }
.pw-tabs__title { font-family: var(--pw-font-display); font-size: 1.0625rem;
  color: var(--pw-color-ink); margin-block: 0 var(--pw-space-1); }
.pw-tabs__who { color: var(--pw-color-muted); margin: 0; font-size: .9375rem; }
`
}));

done.push(write({
  id: 'project-grid-featured', category: 'project-grid', label: 'Featured first',
  tags: ['portfolio', 'agency'], conflicts: ['project-grid-uniform'], assets: ['tile'],
  slots: { heading: TR, items: L(3, 9) },
  ...pair((container, gridCls, col) => `<section class="pw-projf" id="work">
  <div class="${container}">
    <h2 class="pw-section__title">{{heading}}</h2>
    <ul class="pw-projf__list ${gridCls}">
      <!-- pw:repeat items -->
      <li class="${col ? col + ' ' : ''}pw-projf__item">
        {{asset:tile}}
        <h3 class="pw-projf__title">{{title}}</h3>
        <p class="pw-projf__meta">{{meta}}</p>
      </li>
      <!-- /pw:repeat -->
    </ul>
  </div>
</section>
`, 2),
  css: `.pw-projf { padding-block: var(--pw-space-8); }
.pw-projf__list { list-style: none; margin: 0; padding: 0; }
.pw-projf__item .pw-tile { inline-size: 100%; block-size: auto;
  border-radius: var(--pw-radius-lg); display: block; }
.pw-projf__title { font-family: var(--pw-font-display); font-size: 1.25rem;
  color: var(--pw-color-ink); margin-block: var(--pw-space-3) var(--pw-space-1); }
.pw-projf__meta { color: var(--pw-color-muted); margin: 0; }
`
}));

done.push(write({
  id: 'menu-full-two-column', category: 'menu-full', label: 'Two column',
  tags: ['restaurant'], conflicts: ['menu-full-sectioned'],
  slots: { heading: TR, courses: L(2, 8) },
  ...pair((container, gridCls, col) => `<section class="pw-menu2" id="menu">
  <div class="${container}">
    <h2 class="pw-section__title">{{heading}}</h2>
    <div class="${gridCls}">
      <!-- pw:repeat courses -->
      ${col ? `<div class="${col}">` : ''}
      <section class="pw-menu2__course">
        <h3 class="pw-menu2__name">{{course}}</h3>
        <p class="pw-menu2__dish">{{dish}} <span class="pw-menu2__price">{{price}}</span></p>
        <p class="pw-menu2__note">{{note}}</p>
      </section>
      ${col ? '</div>' : ''}
      <!-- /pw:repeat -->
    </div>
  </div>
</section>
`, 2),
  css: `.pw-menu2 { padding-block: var(--pw-space-8); }
.pw-menu2__name { font-family: var(--pw-font-display); color: var(--pw-color-primary);
  text-transform: uppercase; letter-spacing: .06em; font-size: 1rem;
  margin-block: 0 var(--pw-space-2); }
.pw-menu2__dish { color: var(--pw-color-ink); font-weight: 600; margin-block: 0 var(--pw-space-1); }
.pw-menu2__price { color: var(--pw-color-muted); font-weight: 400;
  font-variant-numeric: tabular-nums; margin-inline-start: var(--pw-space-2); }
.pw-menu2__note { color: var(--pw-color-muted); font-size: .9375rem; margin: 0; }
`
}));

done.push(write({
  id: 'product-grid-four-column', category: 'product-grid', label: 'Four column',
  tags: ['shop'], conflicts: ['product-grid-three-column'], assets: ['tile'],
  slots: { heading: TR, subheading: T, items: L(4, 16) },
  ...pair((container, gridCls, col) => `<section class="pw-shop4" id="shop">
  <div class="${container}">
    <h2 class="pw-section__title">{{heading}}</h2>
    <p class="pw-section__sub">{{subheading}}</p>
    <ul class="pw-shop4__list ${gridCls}">
      <!-- pw:repeat items -->
      <li class="${col ? col + ' ' : ''}pw-shop4__item">
        {{asset:tile}}
        <h3 class="pw-shop4__name">{{name}}</h3>
        <p class="pw-shop4__price">{{price}}</p>
      </li>
      <!-- /pw:repeat -->
    </ul>
  </div>
</section>
`, 4),
  css: `.pw-shop4 { padding-block: var(--pw-space-8); }
.pw-shop4__list { list-style: none; margin: 0; padding: 0; }
.pw-shop4__item .pw-tile { inline-size: 100%; block-size: auto;
  border-radius: var(--pw-radius-sm); display: block; }
.pw-shop4__name { font-family: var(--pw-font-display); font-size: 1rem;
  color: var(--pw-color-ink); margin-block: var(--pw-space-2) var(--pw-space-1); }
.pw-shop4__price { color: var(--pw-color-primary); font-weight: 600;
  font-variant-numeric: tabular-nums; margin: 0; }
`
}));

done.push(write({
  id: 'post-list-compact', category: 'post-list', label: 'Compact list',
  tags: ['blog'], conflicts: ['post-list-cards'],
  slots: { heading: TR, items: L(2, 12) },
  html: `<section class="pw-postsc" id="blog">
  <div class="pw-container">
    <h2 class="pw-section__title">{{heading}}</h2>
    <ul class="pw-postsc__list">
      <!-- pw:repeat items -->
      <li class="pw-postsc__row">
        <p class="pw-postsc__date"><time>{{date}}</time></p>
        <h3 class="pw-postsc__title">{{title}}</h3>
      </li>
      <!-- /pw:repeat -->
    </ul>
  </div>
</section>
`,
  css: `.pw-postsc { padding-block: var(--pw-space-8); }
.pw-postsc__list { list-style: none; margin: 0; padding: 0;
  max-inline-size: 46rem; margin-inline: auto; }
.pw-postsc__row { display: grid; gap: var(--pw-space-1);
  padding-block: var(--pw-space-3); border-block-end: 1px solid var(--pw-color-line); }
@media (min-width: 640px) { .pw-postsc__row { grid-template-columns: 8rem 1fr; gap: var(--pw-space-4); } }
.pw-postsc__date { color: var(--pw-color-muted); font-size: .875rem; margin: 0;
  font-variant-numeric: tabular-nums; }
.pw-postsc__title { font-family: var(--pw-font-display); font-size: 1.0625rem;
  color: var(--pw-color-ink); margin: 0; }
`
}));

done.push(write({
  id: 'gallery-masonry', category: 'gallery', label: 'Staggered grid',
  tags: ['portfolio'], conflicts: ['gallery-grid-uniform'], assets: ['tile'],
  slots: { heading: TR, items: L(3, 12) },
  html: `<section class="pw-galm" id="gallery">
  <div class="pw-container">
    <h2 class="pw-section__title">{{heading}}</h2>
    <ul class="pw-galm__list">
      <!-- pw:repeat items -->
      <li class="pw-galm__item">
        {{asset:tile}}
        <p class="pw-galm__caption">{{caption}}</p>
      </li>
      <!-- /pw:repeat -->
    </ul>
  </div>
</section>
`,
  css: `.pw-galm { padding-block: var(--pw-space-8); }
.pw-galm__list { list-style: none; margin: 0; padding: 0; columns: 1; column-gap: var(--pw-space-4); }
@media (min-width: 640px) { .pw-galm__list { columns: 2; } }
@media (min-width: 1024px) { .pw-galm__list { columns: 3; } }
.pw-galm__item { break-inside: avoid; margin-block-end: var(--pw-space-4); }
.pw-galm__item .pw-tile { inline-size: 100%; block-size: auto;
  border-radius: var(--pw-radius-md); display: block; }
.pw-galm__caption { color: var(--pw-color-muted); font-size: .9375rem;
  margin-block: var(--pw-space-2) 0; }
`
}));

done.push(write({
  id: 'features-two-column', category: 'features', label: 'Two column',
  tags: ['shop', 'restaurant'], conflicts: ['features-three-column'],
  slots: { heading: TR, subheading: T, items: L(2, 4) },
  ...pair((container, gridCls, col) => `<section class="pw-feat2" id="features">
  <div class="${container}">
    <h2 class="pw-section__title">{{heading}}</h2>
    <p class="pw-section__sub">{{subheading}}</p>
    <div class="${gridCls}">
      <!-- pw:repeat items -->
      ${col ? `<div class="${col}">` : ''}
      <article class="pw-feat2__item">
        <h3 class="pw-feat2__title">{{title}}</h3>
        <p class="pw-feat2__body">{{body}}</p>
      </article>
      ${col ? '</div>' : ''}
      <!-- /pw:repeat -->
    </div>
  </div>
</section>
`, 2),
  css: `.pw-feat2 { padding-block: var(--pw-space-8); }
.pw-feat2__title { font-family: var(--pw-font-display); font-size: 1.25rem;
  color: var(--pw-color-ink); margin-block: 0 var(--pw-space-2); }
.pw-feat2__body { color: var(--pw-color-muted); margin: 0; }
`
}));

done.push(write({
  id: 'cta-quiet-line', category: 'cta', label: 'Quiet line',
  tags: ['portfolio'], conflicts: ['cta-banner-centered', 'cta-split-panel'],
  slots: { heading: TR, subheading: T, cta_label: T },
  html: `<section class="pw-ctaq" id="cta">
  <div class="pw-container pw-ctaq__inner">
    <h2 class="pw-ctaq__title">{{heading}}</h2>
    <p class="pw-ctaq__sub">{{subheading}}</p>
    <a class="pw-ctaq__link" href="#top">{{cta_label}}</a>
  </div>
</section>
`,
  css: `.pw-ctaq { padding-block: var(--pw-space-8); border-block-start: 1px solid var(--pw-color-line); }
.pw-ctaq__inner { text-align: center; max-inline-size: 46ch; margin-inline: auto; }
.pw-ctaq__title { font-family: var(--pw-font-display); color: var(--pw-color-ink);
  font-size: clamp(1.375rem, 2.8vw, 1.875rem); margin-block: 0 var(--pw-space-2); text-wrap: balance; }
.pw-ctaq__sub { color: var(--pw-color-muted); margin-block: 0 var(--pw-space-4); }
.pw-ctaq__link { color: var(--pw-color-primary); font-weight: 600;
  min-block-size: var(--pw-target-min); display: inline-flex; align-items: center;
  padding-inline: var(--pw-space-2); }
`
}));

console.log('batch E: ' + done.join(', '));
