/** Final alternates, taking every high-traffic category to three or more options. */
import { write, T, TR, L } from '../author.mjs';
const done = [];
const pair = (inner, cols) => ({
  bootstrapHtml: inner('container', 'row g-4', `col-md-${12 / cols}`),
  vanillaHtml: inner('pw-container', `pw-grid pw-grid--${cols}`, null)
});

done.push(write({
  id: 'hero-with-form', category: 'hero', label: 'With signup form',
  tags: ['saas', 'shop'], conflicts: ['hero-split-image'],
  slots: { heading: TR, subheading: TR, action: T, submit_label: T, footnote: T },
  html: `<section class="pw-herow" id="top">
  <div class="pw-container pw-herow__inner">
    <h1 class="pw-herow__title">{{heading}}</h1>
    <p class="pw-herow__sub">{{subheading}}</p>
    <form class="pw-herow__form" method="post" action="{{action}}">
      <label class="pw-visually-hidden" for="pw-hero-email">Email address</label>
      <input class="pw-input pw-herow__input" id="pw-hero-email" name="email" type="email"
             autocomplete="email" required placeholder="you@example.com">
      <button class="pw-btn pw-btn--primary" type="submit">{{submit_label}}</button>
    </form>
    <p class="pw-herow__note">{{footnote}}</p>
  </div>
</section>
`,
  css: `.pw-herow { background: var(--pw-color-hero-bg); padding-block: var(--pw-space-8); }
.pw-herow__inner { text-align: center; max-inline-size: 46rem; margin-inline: auto; }
.pw-herow__title { font-family: var(--pw-font-display); color: var(--pw-color-ink);
  font-size: clamp(2rem, 4.5vw, 3rem); line-height: 1.1;
  margin-block: 0 var(--pw-space-4); text-wrap: balance; }
.pw-herow__sub { color: var(--pw-color-muted); font-size: 1.125rem;
  margin-block: 0 var(--pw-space-5); }
.pw-herow__form { display: flex; flex-wrap: wrap; gap: var(--pw-space-2); justify-content: center; }
.pw-herow__input { min-inline-size: 18rem; }
.pw-herow__note { color: var(--pw-color-muted); font-size: .875rem;
  margin-block: var(--pw-space-3) 0; }
`
}));

done.push(write({
  id: 'nav-minimal', category: 'nav', label: 'Minimal',
  tags: ['portfolio'], conflicts: ['nav-sticky-simple'],
  slots: { brand: TR, links: L(2, 5), cta_label: T },
  focus: 'not sticky — no obscuring surface',
  html: `<header class="pw-navm">
  <nav class="pw-container pw-navm__inner" aria-label="Main">
    <a class="pw-navm__brand" href="index.html">{{brand}}</a>
    <ul class="pw-navm__links">
      <!-- pw:repeat links -->
      <li><a class="pw-navm__link" href="{{href}}">{{label}}</a></li>
      <!-- /pw:repeat -->
    </ul>
  </nav>
</header>
`,
  css: `/* No sticky positioning and no toggle: the link count is capped at five,
   so it wraps rather than collapsing, and needs no JavaScript in any stack. */
.pw-navm { padding-block: var(--pw-space-5); }
.pw-navm__inner { display: flex; flex-wrap: wrap; gap: var(--pw-space-4);
  align-items: baseline; justify-content: space-between; }
.pw-navm__brand { font-family: var(--pw-font-display); font-weight: 600; font-size: 1.125rem;
  color: var(--pw-color-ink); text-decoration: none;
  min-block-size: var(--pw-target-min); display: inline-flex; align-items: center; }
.pw-navm__links { list-style: none; margin: 0; padding: 0; display: flex;
  flex-wrap: wrap; gap: var(--pw-space-3); }
.pw-navm__link { color: var(--pw-color-muted); text-decoration: none;
  min-block-size: var(--pw-target-min); display: inline-flex; align-items: center; }
.pw-navm__link:hover, .pw-navm__link:focus-visible {
  color: var(--pw-color-ink); text-decoration: underline; }
`
}));

done.push(write({
  id: 'features-checklist', category: 'features', label: 'Checklist',
  tags: ['saas', 'shop'], conflicts: ['features-three-column'],
  slots: { heading: TR, subheading: T, items: L(3, 10) },
  html: `<section class="pw-check" id="features">
  <div class="pw-container">
    <h2 class="pw-section__title">{{heading}}</h2>
    <p class="pw-section__sub">{{subheading}}</p>
    <ul class="pw-check__list">
      <!-- pw:repeat items -->
      <li class="pw-check__item">
        <span class="pw-check__mark" aria-hidden="true">&#10003;</span>
        <span>{{title}}</span>
      </li>
      <!-- /pw:repeat -->
    </ul>
  </div>
</section>
`,
  css: `.pw-check { padding-block: var(--pw-space-8); }
.pw-check__list { list-style: none; margin: 0; padding: 0; display: grid;
  gap: var(--pw-space-3); max-inline-size: 44rem; margin-inline: auto; }
@media (min-width: 768px) { .pw-check__list { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.pw-check__item { display: flex; gap: var(--pw-space-3); align-items: flex-start;
  color: var(--pw-color-ink); }
.pw-check__mark { color: var(--pw-color-primary); font-weight: 700; flex: none; }
`
}));

done.push(write({
  id: 'pricing-two-tier', category: 'pricing', label: 'Two tier',
  tags: ['saas'], conflicts: ['pricing-three-tier'],
  slots: { heading: TR, subheading: T, tiers: L(2, 2) },
  ...pair((container, gridCls, col) => `<section class="pw-price2" id="pricing">
  <div class="${container}">
    <h2 class="pw-section__title">{{heading}}</h2>
    <p class="pw-section__sub">{{subheading}}</p>
    <div class="${gridCls}">
      <!-- pw:repeat tiers -->
      ${col ? `<div class="${col}">` : ''}
      <article class="pw-price2__card">
        <h3 class="pw-price2__name">{{name}}</h3>
        <p class="pw-price2__amount">{{price}} <span class="pw-price2__period">{{period}}</span></p>
        <p class="pw-price2__note">{{note}}</p>
        <a class="pw-btn pw-btn--primary" href="#cta">{{cta_label}}</a>
      </article>
      ${col ? '</div>' : ''}
      <!-- /pw:repeat -->
    </div>
  </div>
</section>
`, 2),
  css: `.pw-price2 { padding-block: var(--pw-space-8); background: var(--pw-color-surface); }
.pw-price2__card { border: 1px solid var(--pw-color-line); border-radius: var(--pw-radius-lg);
  padding: var(--pw-space-6); block-size: 100%; display: flex; flex-direction: column;
  background: var(--pw-color-bg); }
.pw-price2__name { font-family: var(--pw-font-display); color: var(--pw-color-muted);
  text-transform: uppercase; letter-spacing: .06em; font-size: .9375rem;
  margin-block: 0 var(--pw-space-3); }
.pw-price2__amount { font-family: var(--pw-font-display); font-size: 2.5rem;
  color: var(--pw-color-ink); margin-block: 0 var(--pw-space-3);
  font-variant-numeric: tabular-nums; }
.pw-price2__period { font-size: 1rem; color: var(--pw-color-muted); }
.pw-price2__note { color: var(--pw-color-muted); flex: 1; margin-block: 0 var(--pw-space-4); }
`
}));

done.push(write({
  id: 'testimonials-with-monogram', category: 'testimonials', label: 'With monograms',
  tags: ['agency', 'saas'], conflicts: ['testimonials-quote-grid'],
  slots: { heading: TR, quotes: L(2, 6) },
  ...pair((container, gridCls, col) => `<section class="pw-quotem">
  <div class="${container}">
    <h2 class="pw-section__title">{{heading}}</h2>
    <div class="${gridCls}">
      <!-- pw:repeat quotes -->
      ${col ? `<div class="${col}">` : ''}
      <figure class="pw-quotem__fig">
        <blockquote class="pw-quotem__text"><p>{{quote}}</p></blockquote>
        <figcaption class="pw-quotem__by">
          <span class="pw-quotem__mark" aria-hidden="true">{{initial}}</span>
          <span>{{name}}, {{role}}</span>
        </figcaption>
      </figure>
      ${col ? '</div>' : ''}
      <!-- /pw:repeat -->
    </div>
  </div>
</section>
`, 2),
  css: `.pw-quotem { padding-block: var(--pw-space-8); }
.pw-quotem__fig { margin: 0; background: var(--pw-color-surface);
  border: 1px solid var(--pw-color-line); border-radius: var(--pw-radius-md);
  padding: var(--pw-space-5); block-size: 100%; }
.pw-quotem__text { margin: 0 0 var(--pw-space-4); }
.pw-quotem__text p { margin: 0; color: var(--pw-color-ink); font-size: 1.0625rem; }
.pw-quotem__by { display: flex; align-items: center; gap: var(--pw-space-3);
  color: var(--pw-color-muted); font-size: .9375rem; }
.pw-quotem__mark { inline-size: 36px; block-size: 36px; border-radius: 50%; flex: none;
  background: var(--pw-color-hero-bg); color: var(--pw-color-primary);
  font-family: var(--pw-font-display); font-weight: 700;
  display: flex; align-items: center; justify-content: center; }
`
}));

done.push(write({
  id: 'team-grid-large', category: 'team', label: 'Large grid',
  tags: ['agency'], conflicts: ['team-card-grid'],
  slots: { heading: TR, subheading: T, people: L(3, 12) },
  ...pair((container, gridCls, col) => `<section class="pw-teaml" id="team">
  <div class="${container}">
    <h2 class="pw-section__title">{{heading}}</h2>
    <p class="pw-section__sub">{{subheading}}</p>
    <ul class="pw-teaml__list ${gridCls}">
      <!-- pw:repeat people -->
      <li class="${col ? col + ' ' : ''}pw-teaml__person">
        <p class="pw-teaml__mark" aria-hidden="true">{{initial}}</p>
        <h3 class="pw-teaml__name">{{name}}</h3>
        <p class="pw-teaml__role">{{role}}</p>
      </li>
      <!-- /pw:repeat -->
    </ul>
  </div>
</section>
`, 4),
  css: `.pw-teaml { padding-block: var(--pw-space-8); }
.pw-teaml__list { list-style: none; margin: 0; padding: 0; text-align: center; }
.pw-teaml__mark { inline-size: 72px; block-size: 72px; border-radius: var(--pw-radius-md);
  background: var(--pw-color-hero-bg); color: var(--pw-color-primary);
  font-family: var(--pw-font-display); font-size: 1.75rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto var(--pw-space-3); }
.pw-teaml__name { font-family: var(--pw-font-display); font-size: 1rem;
  color: var(--pw-color-ink); margin-block: 0 var(--pw-space-1); }
.pw-teaml__role { color: var(--pw-color-muted); font-size: .875rem; margin: 0; }
`
}));

done.push(write({
  id: 'contact-inline', category: 'contact', label: 'Inline details',
  tags: ['portfolio'], conflicts: ['contact-form-simple'],
  slots: { heading: TR, subheading: T, details: L(1, 4) },
  html: `<section class="pw-contacti" id="contact">
  <div class="pw-container pw-contacti__inner">
    <h2 class="pw-contacti__title">{{heading}}</h2>
    <p class="pw-contacti__sub">{{subheading}}</p>
    <ul class="pw-contacti__list">
      <!-- pw:repeat details -->
      <li class="pw-contacti__item">
        <span class="pw-contacti__key">{{key}}</span>
        <a class="pw-contacti__val" href="{{href}}">{{value}}</a>
      </li>
      <!-- /pw:repeat -->
    </ul>
  </div>
</section>
`,
  css: `.pw-contacti { padding-block: var(--pw-space-8); }
.pw-contacti__inner { text-align: center; max-inline-size: 44rem; margin-inline: auto; }
.pw-contacti__title { font-family: var(--pw-font-display); color: var(--pw-color-ink);
  font-size: clamp(1.5rem, 3vw, 2rem); margin-block: 0 var(--pw-space-3); }
.pw-contacti__sub { color: var(--pw-color-muted); margin-block: 0 var(--pw-space-5); }
.pw-contacti__list { list-style: none; margin: 0; padding: 0; display: flex;
  flex-wrap: wrap; justify-content: center; gap: var(--pw-space-6); }
.pw-contacti__key { display: block; color: var(--pw-color-muted); font-size: .8125rem;
  text-transform: uppercase; letter-spacing: .06em; }
.pw-contacti__val { color: var(--pw-color-primary); font-weight: 600;
  min-block-size: var(--pw-target-min); display: inline-flex; align-items: center; }
`
}));

done.push(write({
  id: 'prose-with-lead', category: 'prose', label: 'With lead paragraph',
  tags: ['shared'], conflicts: ['prose-single-column'],
  slots: { heading: T, lead: TR, body: TR },
  html: `<section class="pw-prosel">
  <div class="pw-container pw-prosel__inner">
    <h2 class="pw-prosel__title">{{heading}}</h2>
    <p class="pw-prosel__lead">{{lead}}</p>
    <p class="pw-prosel__body">{{body}}</p>
  </div>
</section>
`,
  css: `.pw-prosel { padding-block: var(--pw-space-8); }
.pw-prosel__inner { max-inline-size: 62ch; margin-inline: auto; }
.pw-prosel__title { font-family: var(--pw-font-display); color: var(--pw-color-ink);
  font-size: 1.5rem; margin-block: 0 var(--pw-space-4); }
.pw-prosel__lead { font-size: 1.1875rem; color: var(--pw-color-ink);
  margin-block: 0 var(--pw-space-4); }
.pw-prosel__body { color: var(--pw-color-muted); margin: 0; }
`
}));

done.push(write({
  id: 'speakers-list-compact', category: 'speakers', label: 'Compact list',
  tags: ['event'], conflicts: ['speakers-card-grid'],
  slots: { heading: TR, people: L(2, 12) },
  html: `<section class="pw-speakl" id="speakers">
  <div class="pw-container">
    <h2 class="pw-section__title">{{heading}}</h2>
    <ul class="pw-speakl__list">
      <!-- pw:repeat people -->
      <li class="pw-speakl__row">
        <p class="pw-speakl__mark" aria-hidden="true">{{initial}}</p>
        <div>
          <h3 class="pw-speakl__name">{{name}} <span class="pw-speakl__role">{{role}}</span></h3>
          <p class="pw-speakl__topic">{{topic}}</p>
        </div>
      </li>
      <!-- /pw:repeat -->
    </ul>
  </div>
</section>
`,
  css: `.pw-speakl { padding-block: var(--pw-space-8); }
.pw-speakl__list { list-style: none; margin: 0; padding: 0;
  max-inline-size: 46rem; margin-inline: auto; }
.pw-speakl__row { display: flex; gap: var(--pw-space-4); align-items: flex-start;
  padding-block: var(--pw-space-4); border-block-end: 1px solid var(--pw-color-line); }
.pw-speakl__mark { inline-size: 40px; block-size: 40px; border-radius: 50%; flex: none;
  background: var(--pw-color-primary); color: var(--pw-color-primary-ink);
  font-family: var(--pw-font-display); font-weight: 700;
  display: flex; align-items: center; justify-content: center; margin: 0; }
.pw-speakl__name { font-family: var(--pw-font-display); font-size: 1.0625rem;
  color: var(--pw-color-ink); margin-block: 0 var(--pw-space-1); }
.pw-speakl__role { color: var(--pw-color-muted); font-weight: 400; font-size: .9375rem; }
.pw-speakl__topic { color: var(--pw-color-muted); margin: 0; }
`
}));

done.push(write({
  id: 'product-list-rows', category: 'product-grid', label: 'List rows',
  tags: ['shop'], conflicts: ['product-grid-three-column'],
  slots: { heading: TR, subheading: T, items: L(2, 12) },
  html: `<section class="pw-plist" id="shop">
  <div class="pw-container">
    <h2 class="pw-section__title">{{heading}}</h2>
    <p class="pw-section__sub">{{subheading}}</p>
    <ul class="pw-plist__list">
      <!-- pw:repeat items -->
      <li class="pw-plist__row">
        <div>
          <h3 class="pw-plist__name">{{name}}</h3>
          <p class="pw-plist__note">{{note}}</p>
        </div>
        <p class="pw-plist__price">{{price}}</p>
      </li>
      <!-- /pw:repeat -->
    </ul>
  </div>
</section>
`,
  css: `.pw-plist { padding-block: var(--pw-space-8); }
.pw-plist__list { list-style: none; margin: 0; padding: 0;
  max-inline-size: 46rem; margin-inline: auto; }
.pw-plist__row { display: flex; gap: var(--pw-space-4); align-items: baseline;
  justify-content: space-between; padding-block: var(--pw-space-4);
  border-block-end: 1px solid var(--pw-color-line); }
.pw-plist__name { font-family: var(--pw-font-display); font-size: 1.0625rem;
  color: var(--pw-color-ink); margin-block: 0 var(--pw-space-1); }
.pw-plist__note { color: var(--pw-color-muted); margin: 0; font-size: .9375rem; }
.pw-plist__price { color: var(--pw-color-primary); font-weight: 600; margin: 0;
  font-variant-numeric: tabular-nums; flex: none; }
`
}));

done.push(write({
  id: 'services-cards-marked', category: 'services', label: 'Marked cards',
  tags: ['agency'], conflicts: ['services-three-column'],
  slots: { heading: TR, subheading: T, items: L(2, 6) },
  ...pair((container, gridCls, col) => `<section class="pw-servm" id="services">
  <div class="${container}">
    <h2 class="pw-section__title">{{heading}}</h2>
    <p class="pw-section__sub">{{subheading}}</p>
    <div class="${gridCls}">
      <!-- pw:repeat items -->
      ${col ? `<div class="${col}">` : ''}
      <article class="pw-servm__card">
        <span class="pw-servm__mark" aria-hidden="true">{{mark}}</span>
        <h3 class="pw-servm__title">{{title}}</h3>
        <p class="pw-servm__body">{{body}}</p>
      </article>
      ${col ? '</div>' : ''}
      <!-- /pw:repeat -->
    </div>
  </div>
</section>
`, 3),
  css: `.pw-servm { padding-block: var(--pw-space-8); background: var(--pw-color-surface); }
.pw-servm__card { background: var(--pw-color-bg); border: 1px solid var(--pw-color-line);
  border-radius: var(--pw-radius-md); padding: var(--pw-space-5); block-size: 100%; }
.pw-servm__mark { display: inline-flex; align-items: center; justify-content: center;
  inline-size: 36px; block-size: 36px; border-radius: var(--pw-radius-sm);
  background: var(--pw-color-primary); color: var(--pw-color-primary-ink);
  font-family: var(--pw-font-display); font-weight: 700;
  margin-block-end: var(--pw-space-3); }
.pw-servm__title { font-family: var(--pw-font-display); font-size: 1.0625rem;
  color: var(--pw-color-ink); margin-block: 0 var(--pw-space-2); }
.pw-servm__body { color: var(--pw-color-muted); margin: 0; }
`
}));

done.push(write({
  id: 'about-strip-with-stats', category: 'about-strip', label: 'With figures',
  tags: ['agency', 'shop'], conflicts: ['about-strip-image-text'],
  slots: { heading: TR, body: TR, stats: L(2, 4) },
  html: `<section class="pw-abouts">
  <div class="pw-container pw-abouts__inner">
    <div>
      <h2 class="pw-abouts__title">{{heading}}</h2>
      <p class="pw-abouts__body">{{body}}</p>
    </div>
    <ul class="pw-abouts__stats">
      <!-- pw:repeat stats -->
      <li class="pw-abouts__stat">
        <p class="pw-abouts__value">{{value}}</p>
        <p class="pw-abouts__label">{{label}}</p>
      </li>
      <!-- /pw:repeat -->
    </ul>
  </div>
</section>
`,
  css: `.pw-abouts { padding-block: var(--pw-space-8); }
.pw-abouts__inner { display: grid; gap: var(--pw-space-7); }
@media (min-width: 768px) { .pw-abouts__inner { grid-template-columns: 3fr 2fr; align-items: center; } }
.pw-abouts__title { font-family: var(--pw-font-display); color: var(--pw-color-ink);
  font-size: clamp(1.5rem, 3vw, 2rem); margin-block: 0 var(--pw-space-3); text-wrap: balance; }
.pw-abouts__body { color: var(--pw-color-muted); margin: 0; max-inline-size: 52ch; }
.pw-abouts__stats { list-style: none; margin: 0; padding: 0; display: grid;
  gap: var(--pw-space-4); grid-template-columns: repeat(2, minmax(0, 1fr)); }
.pw-abouts__value { font-family: var(--pw-font-display); font-size: 1.875rem;
  color: var(--pw-color-primary); margin-block: 0 var(--pw-space-1);
  font-variant-numeric: tabular-nums; }
.pw-abouts__label { color: var(--pw-color-muted); font-size: .875rem; margin: 0; }
`
}));

done.push(write({
  id: 'gallery-scroll-strip', category: 'gallery', label: 'Scrolling strip',
  tags: ['restaurant', 'shop'], conflicts: ['gallery-grid-uniform'],
  nojs: 'scroll-snap', assets: ['tile'],
  slots: { heading: TR, items: L(3, 12) },
  html: `<section class="pw-gstrip" id="gallery">
  <div class="pw-container">
    <h2 class="pw-section__title">{{heading}}</h2>
    <ul class="pw-gstrip__track" tabindex="0" aria-label="Photographs, scrollable">
      <!-- pw:repeat items -->
      <li class="pw-gstrip__item">
        {{asset:tile}}
        <p class="pw-gstrip__caption">{{caption}}</p>
      </li>
      <!-- /pw:repeat -->
    </ul>
  </div>
</section>
`,
  css: `/* scroll-snap again: swipe and keyboard scrolling with no script. */
.pw-gstrip { padding-block: var(--pw-space-8); }
.pw-gstrip__track { list-style: none; margin: 0; padding: 0 0 var(--pw-space-3);
  display: flex; gap: var(--pw-space-4); overflow-x: auto;
  scroll-snap-type: x mandatory; overscroll-behavior-x: contain; }
.pw-gstrip__track:focus-visible { outline: 2px solid var(--pw-color-primary); outline-offset: 4px; }
.pw-gstrip__item { flex: 0 0 min(20rem, 78%); scroll-snap-align: start; }
.pw-gstrip__item .pw-tile { inline-size: 100%; block-size: auto;
  border-radius: var(--pw-radius-md); display: block; }
.pw-gstrip__caption { color: var(--pw-color-muted); font-size: .9375rem;
  margin-block: var(--pw-space-2) 0; }
`
}));

done.push(write({
  id: 'newsletter-boxed', category: 'newsletter', label: 'Boxed',
  tags: ['blog', 'saas'], conflicts: ['newsletter-inline-bar'],
  slots: { heading: TR, subheading: T, action: T, submit_label: T },
  html: `<section class="pw-newsb">
  <div class="pw-container">
    <div class="pw-newsb__box">
      <h2 class="pw-newsb__title">{{heading}}</h2>
      <p class="pw-newsb__sub">{{subheading}}</p>
      <form class="pw-newsb__form" method="post" action="{{action}}">
        <label class="pw-visually-hidden" for="pw-newsb-email">Email address</label>
        <input class="pw-input pw-newsb__input" id="pw-newsb-email" name="email" type="email"
               autocomplete="email" required placeholder="you@example.com">
        <button class="pw-btn pw-btn--primary" type="submit">{{submit_label}}</button>
      </form>
    </div>
  </div>
</section>
`,
  css: `.pw-newsb { padding-block: var(--pw-space-8); }
.pw-newsb__box { background: var(--pw-color-hero-bg); border-radius: var(--pw-radius-lg);
  padding: var(--pw-space-7) var(--pw-space-5); text-align: center;
  max-inline-size: 46rem; margin-inline: auto; }
.pw-newsb__title { font-family: var(--pw-font-display); color: var(--pw-color-ink);
  font-size: clamp(1.375rem, 2.8vw, 1.75rem); margin-block: 0 var(--pw-space-2); }
.pw-newsb__sub { color: var(--pw-color-muted); margin-block: 0 var(--pw-space-5); }
.pw-newsb__form { display: flex; flex-wrap: wrap; gap: var(--pw-space-2); justify-content: center; }
.pw-newsb__input { min-inline-size: 17rem; }
`
}));

console.log('batch G: ' + done.length + ' blocks — ' + done.join(', '));
