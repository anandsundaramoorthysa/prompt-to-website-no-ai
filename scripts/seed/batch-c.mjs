/** Blocks for two new site types (event, shop) plus shared content blocks. */
import { write, T, TR, L } from '../author.mjs';
const done = [];

const pair = (inner, cols) => ({
  bootstrapHtml: inner('container', 'row g-4', `col-md-${12 / cols}`),
  vanillaHtml: inner('pw-container', `pw-grid pw-grid--${cols}`, null)
});

/* ---- event: schedule ---- */
done.push(write({
  id: 'schedule-single-list', category: 'schedule', label: 'Single day list',
  tags: ['event'], slots: { heading: TR, subheading: T, slots_list: L(2, 12) },
  html: `<section class="pw-sched" id="schedule">
  <div class="pw-container">
    <h2 class="pw-section__title">{{heading}}</h2>
    <p class="pw-section__sub">{{subheading}}</p>
    <ol class="pw-sched__list">
      <!-- pw:repeat slots_list -->
      <li class="pw-sched__row">
        <p class="pw-sched__time"><time>{{time}}</time></p>
        <div>
          <h3 class="pw-sched__title">{{title}}</h3>
          <p class="pw-sched__who">{{who}}</p>
        </div>
      </li>
      <!-- /pw:repeat -->
    </ol>
  </div>
</section>
`,
  css: `.pw-sched { padding-block: var(--pw-space-8); }
.pw-sched__list { list-style: none; margin: 0; padding: 0;
  max-inline-size: 48rem; margin-inline: auto; }
.pw-sched__row { display: grid; gap: var(--pw-space-2); padding-block: var(--pw-space-4);
  border-block-end: 1px solid var(--pw-color-line); }
@media (min-width: 640px) { .pw-sched__row { grid-template-columns: 7rem 1fr; gap: var(--pw-space-5); } }
.pw-sched__time { color: var(--pw-color-primary); font-family: var(--pw-font-display);
  font-weight: 600; font-variant-numeric: tabular-nums; margin: 0; }
.pw-sched__title { font-family: var(--pw-font-display); font-size: 1.0625rem;
  color: var(--pw-color-ink); margin-block: 0 var(--pw-space-1); }
.pw-sched__who { color: var(--pw-color-muted); margin: 0; font-size: .9375rem; }
`
}));

/* ---- event: speakers ---- */
done.push(write({
  id: 'speakers-card-grid', category: 'speakers', label: 'Speaker cards',
  tags: ['event'], slots: { heading: TR, people: L(2, 9) },
  ...pair((container, gridCls, col) => `<section class="pw-speakers" id="speakers">
  <div class="${container}">
    <h2 class="pw-section__title">{{heading}}</h2>
    <ul class="pw-speakers__list ${gridCls}">
      <!-- pw:repeat people -->
      <li class="${col ? col + ' ' : ''}pw-speaker">
        <p class="pw-speaker__monogram" aria-hidden="true">{{initial}}</p>
        <h3 class="pw-speaker__name">{{name}}</h3>
        <p class="pw-speaker__role">{{role}}</p>
        <p class="pw-speaker__topic">{{topic}}</p>
      </li>
      <!-- /pw:repeat -->
    </ul>
  </div>
</section>
`, 3),
  css: `.pw-speakers { padding-block: var(--pw-space-8); background: var(--pw-color-surface); }
.pw-speakers__list { list-style: none; margin: 0; padding: 0; text-align: center; }
.pw-speaker__monogram { inline-size: 56px; block-size: 56px; border-radius: 50%;
  background: var(--pw-color-primary); color: var(--pw-color-primary-ink);
  font-family: var(--pw-font-display); font-size: 1.375rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto var(--pw-space-3); }
.pw-speaker__name { font-family: var(--pw-font-display); font-size: 1.0625rem;
  color: var(--pw-color-ink); margin-block: 0 var(--pw-space-1); }
.pw-speaker__role { color: var(--pw-color-muted); font-size: .9375rem; margin-block: 0 var(--pw-space-2); }
.pw-speaker__topic { color: var(--pw-color-ink); margin: 0; }
`
}));

/* ---- shop: product grid ---- */
done.push(write({
  id: 'product-grid-three-column', category: 'product-grid', label: 'Product grid',
  tags: ['shop'], assets: ['tile'], slots: { heading: TR, subheading: T, items: L(3, 12) },
  ...pair((container, gridCls, col) => `<section class="pw-shop" id="shop">
  <div class="${container}">
    <h2 class="pw-section__title">{{heading}}</h2>
    <p class="pw-section__sub">{{subheading}}</p>
    <ul class="pw-shop__list ${gridCls}">
      <!-- pw:repeat items -->
      <li class="${col ? col + ' ' : ''}pw-product">
        {{asset:tile}}
        <h3 class="pw-product__name">{{name}}</h3>
        <p class="pw-product__price">{{price}}</p>
        <p class="pw-product__note">{{note}}</p>
      </li>
      <!-- /pw:repeat -->
    </ul>
  </div>
</section>
`, 3),
  css: `.pw-shop { padding-block: var(--pw-space-8); }
.pw-shop__list { list-style: none; margin: 0; padding: 0; }
.pw-product .pw-tile { inline-size: 100%; block-size: auto;
  border-radius: var(--pw-radius-md); display: block; }
.pw-product__name { font-family: var(--pw-font-display); font-size: 1.0625rem;
  color: var(--pw-color-ink); margin-block: var(--pw-space-3) var(--pw-space-1); }
.pw-product__price { color: var(--pw-color-primary); font-weight: 600;
  font-variant-numeric: tabular-nums; margin-block: 0 var(--pw-space-1); }
.pw-product__note { color: var(--pw-color-muted); font-size: .9375rem; margin: 0; }
`
}));

/* ---- shared: newsletter ---- */
done.push(write({
  id: 'newsletter-inline-bar', category: 'newsletter', label: 'Inline bar',
  tags: ['shop', 'blog'], slots: { heading: TR, subheading: T, action: T, submit_label: T },
  html: `<section class="pw-news">
  <div class="pw-container pw-news__inner">
    <div>
      <h2 class="pw-news__title">{{heading}}</h2>
      <p class="pw-news__sub">{{subheading}}</p>
    </div>
    <form class="pw-news__form" method="post" action="{{action}}">
      <label class="pw-visually-hidden" for="pw-news-email">Email address</label>
      <input class="pw-input pw-news__input" id="pw-news-email" name="email"
             type="email" autocomplete="email" required placeholder="you@example.com">
      <button class="pw-btn pw-btn--primary" type="submit">{{submit_label}}</button>
    </form>
  </div>
</section>
`,
  css: `/* Native validation only — no script, so it works in stack 1 unchanged. */
.pw-news { padding-block: var(--pw-space-7); background: var(--pw-color-surface);
  border-block: 1px solid var(--pw-color-line); }
.pw-news__inner { display: flex; flex-wrap: wrap; gap: var(--pw-space-5);
  align-items: center; justify-content: space-between; }
.pw-news__title { font-family: var(--pw-font-display); font-size: 1.25rem;
  color: var(--pw-color-ink); margin-block: 0 var(--pw-space-1); }
.pw-news__sub { color: var(--pw-color-muted); margin: 0; }
.pw-news__form { display: flex; flex-wrap: wrap; gap: var(--pw-space-2); }
.pw-news__input { min-inline-size: 16rem; }
`
}));

/* ---- shared: gallery ---- */
done.push(write({
  id: 'gallery-grid-uniform', category: 'gallery', label: 'Uniform grid',
  tags: ['portfolio', 'restaurant'], assets: ['tile'],
  slots: { heading: TR, items: L(3, 12) },
  ...pair((container, gridCls, col) => `<section class="pw-gallery" id="gallery">
  <div class="${container}">
    <h2 class="pw-section__title">{{heading}}</h2>
    <ul class="pw-gallery__list ${gridCls}">
      <!-- pw:repeat items -->
      <li class="${col ? col + ' ' : ''}pw-gallery__item">
        {{asset:tile}}
        <p class="pw-gallery__caption">{{caption}}</p>
      </li>
      <!-- /pw:repeat -->
    </ul>
  </div>
</section>
`, 3),
  css: `.pw-gallery { padding-block: var(--pw-space-8); }
.pw-gallery__list { list-style: none; margin: 0; padding: 0; }
.pw-gallery__item .pw-tile { inline-size: 100%; block-size: auto;
  border-radius: var(--pw-radius-md); display: block; }
.pw-gallery__caption { color: var(--pw-color-muted); font-size: .9375rem;
  margin-block: var(--pw-space-2) 0; }
`
}));

/* ---- shared: prose (privacy, terms, generic pages) ---- */
done.push(write({
  id: 'prose-single-column', category: 'prose', label: 'Single column prose',
  tags: ['shared'], slots: { heading: T, body: TR },
  html: `<section class="pw-prose">
  <div class="pw-container pw-prose__inner">
    <h2 class="pw-prose__title">{{heading}}</h2>
    <p>{{body}}</p>
  </div>
</section>
`,
  css: `.pw-prose { padding-block: var(--pw-space-8); }
.pw-prose__inner { max-inline-size: 62ch; margin-inline: auto; }
.pw-prose__title { font-family: var(--pw-font-display); color: var(--pw-color-ink);
  font-size: 1.5rem; margin-block: 0 var(--pw-space-4); }
.pw-prose p { color: var(--pw-color-muted); }
`
}));

/* ---- shared: blog post list ---- */
done.push(write({
  id: 'post-list-cards', category: 'post-list', label: 'Post cards',
  tags: ['blog'], slots: { heading: TR, items: L(2, 9) },
  ...pair((container, gridCls, col) => `<section class="pw-posts" id="blog">
  <div class="${container}">
    <h2 class="pw-section__title">{{heading}}</h2>
    <ul class="pw-posts__list ${gridCls}">
      <!-- pw:repeat items -->
      <li class="${col ? col + ' ' : ''}pw-post">
        <p class="pw-post__date"><time>{{date}}</time></p>
        <h3 class="pw-post__title">{{title}}</h3>
        <p class="pw-post__excerpt">{{excerpt}}</p>
      </li>
      <!-- /pw:repeat -->
    </ul>
  </div>
</section>
`, 3),
  css: `.pw-posts { padding-block: var(--pw-space-8); }
.pw-posts__list { list-style: none; margin: 0; padding: 0; }
.pw-post { border-block-start: 2px solid var(--pw-color-line); padding-block-start: var(--pw-space-3); }
.pw-post__date { color: var(--pw-color-muted); font-size: .875rem; margin-block: 0 var(--pw-space-2); }
.pw-post__title { font-family: var(--pw-font-display); font-size: 1.125rem;
  color: var(--pw-color-ink); margin-block: 0 var(--pw-space-2); }
.pw-post__excerpt { color: var(--pw-color-muted); margin: 0; }
`
}));

/* ---- shared: stats row ---- */
done.push(write({
  id: 'social-proof-stat-row', category: 'social-proof', label: 'Stat row',
  tags: ['saas', 'agency'], conflicts: ['social-proof-logo-strip'],
  slots: { heading: T, stats: L(2, 4) },
  html: `<section class="pw-stats" aria-label="{{heading}}">
  <div class="pw-container">
    <ul class="pw-stats__list">
      <!-- pw:repeat stats -->
      <li class="pw-stat">
        <p class="pw-stat__value">{{value}}</p>
        <p class="pw-stat__label">{{label}}</p>
      </li>
      <!-- /pw:repeat -->
    </ul>
  </div>
</section>
`,
  css: `.pw-stats { padding-block: var(--pw-space-7); background: var(--pw-color-surface); }
.pw-stats__list { list-style: none; margin: 0; padding: 0; display: flex;
  flex-wrap: wrap; justify-content: center; gap: var(--pw-space-7); text-align: center; }
.pw-stat__value { font-family: var(--pw-font-display); font-size: 2.25rem;
  color: var(--pw-color-primary); margin-block: 0 var(--pw-space-1);
  font-variant-numeric: tabular-nums; }
.pw-stat__label { color: var(--pw-color-muted); margin: 0; font-size: .9375rem; }
`
}));

console.log('batch C: ' + done.join(', '));
