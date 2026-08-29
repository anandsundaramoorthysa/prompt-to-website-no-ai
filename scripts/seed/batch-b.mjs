/** Alternates for features, pricing, cta, faq, testimonials. */
import { write, T, TR, L } from '../author.mjs';
const done = [];

const grid = (inner, cols) => ({
  bootstrapHtml: inner('container', 'row g-4', `col-md-${12 / cols}`),
  vanillaHtml: inner('pw-container', `pw-grid pw-grid--${cols}`, null)
});

/* features: alternating rows */
done.push(write({
  id: 'features-alternating', category: 'features', label: 'Alternating rows',
  tags: ['saas'], conflicts: ['features-three-column'],
  slots: { heading: TR, subheading: T, items: L(2, 5) },
  html: `<section class="pw-alt" id="features">
  <div class="pw-container">
    <h2 class="pw-section__title">{{heading}}</h2>
    <p class="pw-section__sub">{{subheading}}</p>
    <div class="pw-alt__list">
      <!-- pw:repeat items -->
      <article class="pw-alt__row">
        <h3 class="pw-alt__title">{{title}}</h3>
        <p class="pw-alt__body">{{body}}</p>
      </article>
      <!-- /pw:repeat -->
    </div>
  </div>
</section>
`,
  css: `.pw-alt { padding-block: var(--pw-space-8); }
.pw-alt__list { display: grid; gap: var(--pw-space-5); max-inline-size: 56rem; margin-inline: auto; }
.pw-alt__row { border-block-start: 1px solid var(--pw-color-line); padding-block-start: var(--pw-space-4); }
.pw-alt__row:first-child { border-block-start: 0; padding-block-start: 0; }
.pw-alt__title { font-family: var(--pw-font-display); font-size: 1.25rem;
  color: var(--pw-color-ink); margin-block: 0 var(--pw-space-2); }
.pw-alt__body { color: var(--pw-color-muted); margin: 0; max-inline-size: 62ch; }
`
}));

/* features: icon grid (monogram tiles, no icon font, no network) */
done.push(write({
  id: 'features-icon-grid', category: 'features', label: 'Icon grid',
  tags: ['saas', 'agency'], conflicts: ['features-three-column'],
  slots: { heading: TR, subheading: T, items: L(3, 6) },
  ...grid((container, gridCls, col) => `<section class="pw-icons" id="features">
  <div class="${container}">
    <h2 class="pw-section__title">{{heading}}</h2>
    <p class="pw-section__sub">{{subheading}}</p>
    <div class="${gridCls}">
      <!-- pw:repeat items -->
      ${col ? `<div class="${col}">` : ''}
      <article class="pw-icon">
        <span class="pw-icon__mark" aria-hidden="true">{{mark}}</span>
        <h3 class="pw-icon__title">{{title}}</h3>
        <p class="pw-icon__body">{{body}}</p>
      </article>
      ${col ? '</div>' : ''}
      <!-- /pw:repeat -->
    </div>
  </div>
</section>
`, 3),
  css: `.pw-icons { padding-block: var(--pw-space-8); }
.pw-icon { block-size: 100%; }
.pw-icon__mark {
  display: flex; align-items: center; justify-content: center;
  inline-size: 40px; block-size: 40px; border-radius: var(--pw-radius-md);
  background: var(--pw-color-hero-bg); color: var(--pw-color-primary);
  font-family: var(--pw-font-display); font-weight: 700;
  margin-block-end: var(--pw-space-3);
}
.pw-icon__title { font-family: var(--pw-font-display); font-size: 1.0625rem;
  color: var(--pw-color-ink); margin-block: 0 var(--pw-space-2); }
.pw-icon__body { color: var(--pw-color-muted); margin: 0; }
`
}));

/* pricing: single card */
done.push(write({
  id: 'pricing-single-card', category: 'pricing', label: 'Single card',
  tags: ['saas'], conflicts: ['pricing-three-tier'],
  slots: { heading: TR, subheading: T, tiers: L(1, 1) },
  html: `<section class="pw-price1" id="pricing">
  <div class="pw-container">
    <h2 class="pw-section__title">{{heading}}</h2>
    <p class="pw-section__sub">{{subheading}}</p>
    <!-- pw:repeat tiers -->
    <article class="pw-price1__card">
      <h3 class="pw-price1__name">{{name}}</h3>
      <p class="pw-price1__amount">{{price}} <span class="pw-price1__period">{{period}}</span></p>
      <p class="pw-price1__note">{{note}}</p>
      <a class="pw-btn pw-btn--primary" href="#cta">{{cta_label}}</a>
    </article>
    <!-- /pw:repeat -->
  </div>
</section>
`,
  css: `.pw-price1 { padding-block: var(--pw-space-8); background: var(--pw-color-surface); }
.pw-price1__card { max-inline-size: 26rem; margin-inline: auto; text-align: center;
  border: 1px solid var(--pw-color-line); border-radius: var(--pw-radius-lg);
  padding: var(--pw-space-6); background: var(--pw-color-bg); }
.pw-price1__name { font-family: var(--pw-font-display); color: var(--pw-color-muted);
  text-transform: uppercase; letter-spacing: .06em; font-size: .9375rem;
  margin-block: 0 var(--pw-space-3); }
.pw-price1__amount { font-family: var(--pw-font-display); font-size: 2.75rem;
  color: var(--pw-color-ink); margin-block: 0 var(--pw-space-3);
  font-variant-numeric: tabular-nums; }
.pw-price1__period { font-size: 1rem; color: var(--pw-color-muted); }
.pw-price1__note { color: var(--pw-color-muted); margin-block: 0 var(--pw-space-5); }
`
}));

/* cta: split panel */
done.push(write({
  id: 'cta-split-panel', category: 'cta', label: 'Split panel',
  tags: ['agency', 'saas'], conflicts: ['cta-banner-centered'],
  slots: { heading: TR, subheading: T, cta_label: T },
  html: `<section class="pw-ctas" id="cta">
  <div class="pw-container pw-ctas__inner">
    <div>
      <h2 class="pw-ctas__title">{{heading}}</h2>
      <p class="pw-ctas__sub">{{subheading}}</p>
    </div>
    <a class="pw-btn pw-btn--primary pw-ctas__btn" href="#top">{{cta_label}}</a>
  </div>
</section>
`,
  css: `.pw-ctas { padding-block: var(--pw-space-7); background: var(--pw-color-hero-bg); }
.pw-ctas__inner { display: flex; flex-wrap: wrap; align-items: center;
  gap: var(--pw-space-5); justify-content: space-between; }
.pw-ctas__title { font-family: var(--pw-font-display); color: var(--pw-color-ink);
  font-size: clamp(1.375rem, 2.6vw, 1.875rem); margin-block: 0 var(--pw-space-2);
  text-wrap: balance; }
.pw-ctas__sub { color: var(--pw-color-muted); margin: 0; max-inline-size: 48ch; }
.pw-ctas__btn { flex: none; }
`
}));

/* faq: two column */
done.push(write({
  id: 'faq-two-column', category: 'faq', label: 'Two column',
  tags: ['saas', 'agency'], conflicts: ['faq-accordion'], nojs: 'static-list',
  slots: { heading: TR, questions: L(2, 8) },
  ...grid((container, gridCls, col) => `<section class="pw-faq2" id="faq">
  <div class="${container}">
    <h2 class="pw-section__title">{{heading}}</h2>
    <div class="${gridCls}">
      <!-- pw:repeat questions -->
      ${col ? `<div class="${col}">` : ''}
      <div class="pw-faq2__item">
        <h3 class="pw-faq2__q">{{q}}</h3>
        <p class="pw-faq2__a">{{a}}</p>
      </div>
      ${col ? '</div>' : ''}
      <!-- /pw:repeat -->
    </div>
  </div>
</section>
`, 2),
  css: `/* Static list, so it needs no disclosure widget and no JavaScript at all. */
.pw-faq2 { padding-block: var(--pw-space-8); }
.pw-faq2__q { font-family: var(--pw-font-display); font-size: 1.0625rem;
  color: var(--pw-color-ink); margin-block: 0 var(--pw-space-2); }
.pw-faq2__a { color: var(--pw-color-muted); margin: 0; }
`
}));

/* testimonials: single large */
done.push(write({
  id: 'testimonials-single-large', category: 'testimonials', label: 'Single large quote',
  tags: ['portfolio', 'restaurant'], conflicts: ['testimonials-quote-grid'],
  slots: { heading: T, quotes: L(1, 1) },
  html: `<section class="pw-quote1">
  <div class="pw-container">
    <!-- pw:repeat quotes -->
    <figure class="pw-quote1__fig">
      <blockquote class="pw-quote1__text"><p>{{quote}}</p></blockquote>
      <figcaption class="pw-quote1__by">{{name}} &mdash; {{role}}</figcaption>
    </figure>
    <!-- /pw:repeat -->
  </div>
</section>
`,
  css: `.pw-quote1 { padding-block: var(--pw-space-8); background: var(--pw-color-hero-bg); }
.pw-quote1__fig { margin: 0; max-inline-size: 44rem; margin-inline: auto; text-align: center; }
.pw-quote1__text { margin-block: 0 var(--pw-space-4); }
.pw-quote1__text p { margin: 0; font-family: var(--pw-font-display);
  font-size: clamp(1.25rem, 2.6vw, 1.75rem); line-height: 1.35;
  color: var(--pw-color-ink); text-wrap: balance; }
.pw-quote1__by { color: var(--pw-color-muted); font-size: .9375rem; }
`
}));

console.log('batch B: ' + done.join(', '));
