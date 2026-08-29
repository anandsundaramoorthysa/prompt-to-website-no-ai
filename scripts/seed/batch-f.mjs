/** New categories. Each unlocks prompts the corpus previously could not serve. */
import { write, T, TR, L } from '../author.mjs';
const done = [];
const pair = (inner, cols) => ({
  bootstrapHtml: inner('container', 'row g-4', `col-md-${12 / cols}`),
  vanillaHtml: inner('pw-container', `pw-grid pw-grid--${cols}`, null)
});

done.push(write({
  id: 'hours-table', category: 'hours', label: 'Opening hours',
  tags: ['restaurant', 'shop'], slots: { heading: TR, subheading: T, days: L(2, 7) },
  html: `<section class="pw-hours" id="hours">
  <div class="pw-container">
    <h2 class="pw-section__title">{{heading}}</h2>
    <p class="pw-section__sub">{{subheading}}</p>
    <dl class="pw-hours__list">
      <!-- pw:repeat days -->
      <div class="pw-hours__row">
        <dt class="pw-hours__day">{{day}}</dt>
        <dd class="pw-hours__time">{{time}}</dd>
      </div>
      <!-- /pw:repeat -->
    </dl>
  </div>
</section>
`,
  css: `.pw-hours { padding-block: var(--pw-space-8); }
.pw-hours__list { margin: 0; max-inline-size: 30rem; margin-inline: auto; }
.pw-hours__row { display: flex; justify-content: space-between; gap: var(--pw-space-4);
  padding-block: var(--pw-space-2); border-block-end: 1px solid var(--pw-color-line); }
.pw-hours__day { color: var(--pw-color-ink); font-weight: 600; }
.pw-hours__time { margin: 0; color: var(--pw-color-muted); font-variant-numeric: tabular-nums; }
`
}));

done.push(write({
  id: 'location-details', category: 'location', label: 'Address and travel',
  tags: ['restaurant', 'event', 'shop'],
  slots: { heading: TR, address: TR, travel: T, links_out: L(1, 3) },
  html: `<section class="pw-loc" id="location">
  <div class="pw-container pw-loc__inner">
    <div>
      <h2 class="pw-loc__title">{{heading}}</h2>
      <address class="pw-loc__address">{{address}}</address>
      <p class="pw-loc__travel">{{travel}}</p>
    </div>
    <ul class="pw-loc__links">
      <!-- pw:repeat links_out -->
      <li><a class="pw-loc__link" href="{{href}}">{{label}}</a></li>
      <!-- /pw:repeat -->
    </ul>
  </div>
</section>
`,
  css: `.pw-loc { padding-block: var(--pw-space-8); background: var(--pw-color-surface); }
.pw-loc__inner { display: grid; gap: var(--pw-space-5); }
@media (min-width: 768px) { .pw-loc__inner { grid-template-columns: 2fr 1fr; align-items: start; } }
.pw-loc__title { font-family: var(--pw-font-display); color: var(--pw-color-ink);
  font-size: clamp(1.375rem, 2.8vw, 1.875rem); margin-block: 0 var(--pw-space-3); }
.pw-loc__address { font-style: normal; color: var(--pw-color-ink);
  white-space: pre-line; margin-block-end: var(--pw-space-3); }
.pw-loc__travel { color: var(--pw-color-muted); margin: 0; max-inline-size: 48ch; }
.pw-loc__links { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--pw-space-2); }
.pw-loc__link { color: var(--pw-color-primary); min-block-size: var(--pw-target-min);
  display: inline-flex; align-items: center; }
`
}));

done.push(write({
  id: 'process-numbered-steps', category: 'process', label: 'Numbered steps',
  tags: ['agency', 'saas'], slots: { heading: TR, subheading: T, steps: L(2, 5) },
  html: `<section class="pw-proc" id="process">
  <div class="pw-container">
    <h2 class="pw-section__title">{{heading}}</h2>
    <p class="pw-section__sub">{{subheading}}</p>
    <ol class="pw-proc__list">
      <!-- pw:repeat steps -->
      <li class="pw-proc__step">
        <h3 class="pw-proc__title">{{title}}</h3>
        <p class="pw-proc__body">{{body}}</p>
      </li>
      <!-- /pw:repeat -->
    </ol>
  </div>
</section>
`,
  css: `/* An ordered list, because the order genuinely carries meaning here.
   The counters come from the list itself, so screen readers announce them. */
.pw-proc { padding-block: var(--pw-space-8); }
.pw-proc__list { counter-reset: pwstep; list-style: none; margin: 0; padding: 0;
  display: grid; gap: var(--pw-space-5); max-inline-size: 52rem; margin-inline: auto; }
.pw-proc__step { counter-increment: pwstep; padding-inline-start: var(--pw-space-8); position: relative; }
.pw-proc__step::before { content: counter(pwstep); position: absolute;
  inset-inline-start: 0; inset-block-start: 0;
  inline-size: 36px; block-size: 36px; border-radius: 50%;
  background: var(--pw-color-hero-bg); color: var(--pw-color-primary);
  font-family: var(--pw-font-display); font-weight: 700;
  display: flex; align-items: center; justify-content: center; }
.pw-proc__title { font-family: var(--pw-font-display); font-size: 1.125rem;
  color: var(--pw-color-ink); margin-block: 0 var(--pw-space-2); }
.pw-proc__body { color: var(--pw-color-muted); margin: 0; }
`
}));

done.push(write({
  id: 'timeline-vertical', category: 'timeline', label: 'Vertical timeline',
  tags: ['agency', 'portfolio'], slots: { heading: TR, entries: L(2, 8) },
  html: `<section class="pw-time" id="timeline">
  <div class="pw-container">
    <h2 class="pw-section__title">{{heading}}</h2>
    <ol class="pw-time__list">
      <!-- pw:repeat entries -->
      <li class="pw-time__entry">
        <p class="pw-time__year"><time>{{year}}</time></p>
        <h3 class="pw-time__title">{{title}}</h3>
        <p class="pw-time__body">{{body}}</p>
      </li>
      <!-- /pw:repeat -->
    </ol>
  </div>
</section>
`,
  css: `.pw-time { padding-block: var(--pw-space-8); }
.pw-time__list { list-style: none; margin: 0; padding: 0;
  max-inline-size: 44rem; margin-inline: auto;
  border-inline-start: 2px solid var(--pw-color-line); }
.pw-time__entry { padding-inline-start: var(--pw-space-5); padding-block-end: var(--pw-space-6); }
.pw-time__year { color: var(--pw-color-primary); font-family: var(--pw-font-display);
  font-weight: 700; margin-block: 0 var(--pw-space-1); font-variant-numeric: tabular-nums; }
.pw-time__title { font-family: var(--pw-font-display); font-size: 1.0625rem;
  color: var(--pw-color-ink); margin-block: 0 var(--pw-space-1); }
.pw-time__body { color: var(--pw-color-muted); margin: 0; }
`
}));

done.push(write({
  id: 'banner-announcement', category: 'banner', label: 'Announcement bar',
  tags: ['shared'], slots: { message: TR, cta_label: T },
  html: `<aside class="pw-banner" aria-label="Announcement">
  <div class="pw-container pw-banner__inner">
    <p class="pw-banner__msg">{{message}}</p>
    <a class="pw-banner__link" href="#cta">{{cta_label}}</a>
  </div>
</aside>
`,
  css: `/* Not dismissible: a dismiss button needs JavaScript and state, and stack 1
   has neither. A quiet permanent strip is honest instead. */
.pw-banner { background: var(--pw-color-ink); }
.pw-banner__inner { display: flex; flex-wrap: wrap; gap: var(--pw-space-3);
  align-items: center; justify-content: center; padding-block: var(--pw-space-2); }
.pw-banner__msg { color: var(--pw-color-bg); margin: 0; font-size: .9375rem; }
.pw-banner__link { color: var(--pw-color-bg); font-weight: 600; font-size: .9375rem;
  min-block-size: var(--pw-target-min); display: inline-flex; align-items: center;
  padding-inline: var(--pw-space-2); }
`
}));

done.push(write({
  id: 'booking-form', category: 'booking', label: 'Reservation form',
  tags: ['restaurant', 'event'],
  slots: { heading: TR, subheading: T, action: T, submit_label: T },
  html: `<section class="pw-book" id="booking">
  <div class="pw-container">
    <h2 class="pw-section__title">{{heading}}</h2>
    <p class="pw-section__sub">{{subheading}}</p>
    <form class="pw-form pw-book__form" method="post" action="{{action}}">
      <div class="pw-book__row">
        <div class="pw-field">
          <label class="pw-label" for="pw-bk-date">Date</label>
          <input class="pw-input" type="date" id="pw-bk-date" name="date" required>
        </div>
        <div class="pw-field">
          <label class="pw-label" for="pw-bk-time">Time</label>
          <input class="pw-input" type="time" id="pw-bk-time" name="time" required>
        </div>
        <div class="pw-field">
          <label class="pw-label" for="pw-bk-people">People</label>
          <input class="pw-input" type="number" id="pw-bk-people" name="people" min="1" max="12" value="2" required>
        </div>
      </div>
      <div class="pw-field">
        <label class="pw-label" for="pw-bk-name">Name</label>
        <input class="pw-input" type="text" id="pw-bk-name" name="name" autocomplete="name" required>
      </div>
      <div class="pw-field">
        <label class="pw-label" for="pw-bk-notes">Anything we should know?</label>
        <textarea class="pw-input" id="pw-bk-notes" name="notes" rows="3"></textarea>
      </div>
      <button class="pw-btn pw-btn--primary" type="submit">{{submit_label}}</button>
    </form>
  </div>
</section>
`,
  css: `/* Native date, time and number inputs: validation and pickers come from the
   browser, so no JavaScript is needed and stack 1 keeps the block. */
.pw-book { padding-block: var(--pw-space-8); background: var(--pw-color-surface); }
.pw-book__form { max-inline-size: 40rem; }
.pw-book__row { display: grid; gap: var(--pw-space-4); }
@media (min-width: 640px) { .pw-book__row { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
`
}));

done.push(write({
  id: 'tickets-tiers', category: 'tickets', label: 'Ticket tiers',
  tags: ['event'], slots: { heading: TR, subheading: T, tiers: L(2, 4) },
  ...pair((container, gridCls, col) => `<section class="pw-tick" id="tickets">
  <div class="${container}">
    <h2 class="pw-section__title">{{heading}}</h2>
    <p class="pw-section__sub">{{subheading}}</p>
    <div class="${gridCls}">
      <!-- pw:repeat tiers -->
      ${col ? `<div class="${col}">` : ''}
      <article class="pw-tick__card">
        <h3 class="pw-tick__name">{{name}}</h3>
        <p class="pw-tick__price">{{price}}</p>
        <p class="pw-tick__note">{{note}}</p>
        <a class="pw-btn pw-btn--primary" href="#cta">{{cta_label}}</a>
      </article>
      ${col ? '</div>' : ''}
      <!-- /pw:repeat -->
    </div>
  </div>
</section>
`, 3),
  css: `.pw-tick { padding-block: var(--pw-space-8); }
.pw-tick__card { border: 1px solid var(--pw-color-line); border-radius: var(--pw-radius-md);
  padding: var(--pw-space-5); block-size: 100%; display: flex; flex-direction: column;
  text-align: center; background: var(--pw-color-surface); }
.pw-tick__name { font-family: var(--pw-font-display); color: var(--pw-color-muted);
  text-transform: uppercase; letter-spacing: .06em; font-size: .875rem;
  margin-block: 0 var(--pw-space-2); }
.pw-tick__price { font-family: var(--pw-font-display); font-size: 2rem;
  color: var(--pw-color-ink); margin-block: 0 var(--pw-space-2);
  font-variant-numeric: tabular-nums; }
.pw-tick__note { color: var(--pw-color-muted); flex: 1; margin-block: 0 var(--pw-space-4); }
`
}));

done.push(write({
  id: 'shipping-strip', category: 'shipping', label: 'Shipping promises',
  tags: ['shop'], slots: { items: L(2, 4) },
  html: `<section class="pw-ship" aria-label="Shipping and returns">
  <div class="pw-container">
    <ul class="pw-ship__list">
      <!-- pw:repeat items -->
      <li class="pw-ship__item">
        <p class="pw-ship__title">{{title}}</p>
        <p class="pw-ship__body">{{body}}</p>
      </li>
      <!-- /pw:repeat -->
    </ul>
  </div>
</section>
`,
  css: `.pw-ship { padding-block: var(--pw-space-6); background: var(--pw-color-hero-bg); }
.pw-ship__list { list-style: none; margin: 0; padding: 0; display: flex;
  flex-wrap: wrap; justify-content: center; gap: var(--pw-space-6); text-align: center; }
.pw-ship__title { font-family: var(--pw-font-display); color: var(--pw-color-ink);
  font-weight: 600; margin-block: 0 var(--pw-space-1); }
.pw-ship__body { color: var(--pw-color-muted); margin: 0; font-size: .9375rem; }
`
}));

done.push(write({
  id: 'awards-list', category: 'awards', label: 'Awards and recognition',
  tags: ['agency', 'portfolio'], slots: { heading: TR, items: L(2, 8) },
  html: `<section class="pw-awards">
  <div class="pw-container">
    <h2 class="pw-section__title">{{heading}}</h2>
    <ul class="pw-awards__list">
      <!-- pw:repeat items -->
      <li class="pw-awards__item">
        <p class="pw-awards__name">{{name}}</p>
        <p class="pw-awards__meta">{{meta}}</p>
      </li>
      <!-- /pw:repeat -->
    </ul>
  </div>
</section>
`,
  css: `.pw-awards { padding-block: var(--pw-space-8); }
.pw-awards__list { list-style: none; margin: 0; padding: 0;
  max-inline-size: 44rem; margin-inline: auto; }
.pw-awards__item { display: flex; flex-wrap: wrap; gap: var(--pw-space-3);
  justify-content: space-between; padding-block: var(--pw-space-3);
  border-block-end: 1px solid var(--pw-color-line); }
.pw-awards__name { color: var(--pw-color-ink); font-weight: 600; margin: 0; }
.pw-awards__meta { color: var(--pw-color-muted); margin: 0; }
`
}));

done.push(write({
  id: 'press-quotes', category: 'press', label: 'Press mentions',
  tags: ['shop', 'agency'], slots: { heading: T, items: L(2, 6) },
  html: `<section class="pw-press">
  <div class="pw-container">
    <h2 class="pw-section__title">{{heading}}</h2>
    <ul class="pw-press__list">
      <!-- pw:repeat items -->
      <li class="pw-press__item">
        <blockquote class="pw-press__quote"><p>{{quote}}</p></blockquote>
        <p class="pw-press__src">{{source}}</p>
      </li>
      <!-- /pw:repeat -->
    </ul>
  </div>
</section>
`,
  css: `.pw-press { padding-block: var(--pw-space-7); background: var(--pw-color-surface); }
.pw-press__list { list-style: none; margin: 0; padding: 0; display: grid;
  gap: var(--pw-space-5); }
@media (min-width: 768px) { .pw-press__list { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.pw-press__quote { margin: 0 0 var(--pw-space-2); }
.pw-press__quote p { margin: 0; color: var(--pw-color-ink);
  font-family: var(--pw-font-display); font-size: 1.0625rem; }
.pw-press__src { color: var(--pw-color-muted); font-size: .875rem;
  text-transform: uppercase; letter-spacing: .06em; margin: 0; }
`
}));

done.push(write({
  id: 'availability-note', category: 'availability', label: 'Availability note',
  tags: ['portfolio'], slots: { status: TR, detail: T, cta_label: T },
  html: `<section class="pw-avail">
  <div class="pw-container pw-avail__inner">
    <p class="pw-avail__status">{{status}}</p>
    <p class="pw-avail__detail">{{detail}}</p>
    <a class="pw-btn pw-btn--ghost" href="#contact">{{cta_label}}</a>
  </div>
</section>
`,
  css: `.pw-avail { padding-block: var(--pw-space-6); border-block: 1px solid var(--pw-color-line); }
.pw-avail__inner { display: flex; flex-wrap: wrap; gap: var(--pw-space-4);
  align-items: center; justify-content: center; text-align: center; }
.pw-avail__status { font-family: var(--pw-font-display); color: var(--pw-color-primary);
  font-weight: 700; margin: 0; }
.pw-avail__detail { color: var(--pw-color-muted); margin: 0; }
`
}));

done.push(write({
  id: 'faq-search-free', category: 'help', label: 'Help pointers',
  tags: ['saas', 'shop'], slots: { heading: TR, items: L(2, 6) },
  ...pair((container, gridCls, col) => `<section class="pw-help">
  <div class="${container}">
    <h2 class="pw-section__title">{{heading}}</h2>
    <div class="${gridCls}">
      <!-- pw:repeat items -->
      ${col ? `<div class="${col}">` : ''}
      <article class="pw-help__item">
        <h3 class="pw-help__title">{{title}}</h3>
        <p class="pw-help__body">{{body}}</p>
        <a class="pw-help__link" href="{{href}}">{{link_label}}</a>
      </article>
      ${col ? '</div>' : ''}
      <!-- /pw:repeat -->
    </div>
  </div>
</section>
`, 3),
  css: `.pw-help { padding-block: var(--pw-space-8); }
.pw-help__title { font-family: var(--pw-font-display); font-size: 1.0625rem;
  color: var(--pw-color-ink); margin-block: 0 var(--pw-space-2); }
.pw-help__body { color: var(--pw-color-muted); margin-block: 0 var(--pw-space-2); }
.pw-help__link { color: var(--pw-color-primary); font-weight: 600;
  min-block-size: var(--pw-target-min); display: inline-flex; align-items: center; }
`
}));

done.push(write({
  id: 'quote-strip', category: 'quote-strip', label: 'Single line quote',
  tags: ['shared'], slots: { quote: TR, source: T },
  html: `<section class="pw-qstrip">
  <div class="pw-container">
    <figure class="pw-qstrip__fig">
      <blockquote class="pw-qstrip__text"><p>{{quote}}</p></blockquote>
      <figcaption class="pw-qstrip__src">{{source}}</figcaption>
    </figure>
  </div>
</section>
`,
  css: `.pw-qstrip { padding-block: var(--pw-space-7); background: var(--pw-color-hero-bg); }
.pw-qstrip__fig { margin: 0; text-align: center; max-inline-size: 48ch; margin-inline: auto; }
.pw-qstrip__text { margin: 0 0 var(--pw-space-2); }
.pw-qstrip__text p { margin: 0; font-family: var(--pw-font-display);
  font-size: clamp(1.125rem, 2.2vw, 1.5rem); color: var(--pw-color-ink); text-wrap: balance; }
.pw-qstrip__src { color: var(--pw-color-muted); font-size: .9375rem; }
`
}));

done.push(write({
  id: 'logos-grid', category: 'social-proof', label: 'Logo grid',
  tags: ['agency'], conflicts: ['social-proof-logo-strip', 'social-proof-stat-row'],
  slots: { heading: T, logos: L(4, 12) },
  html: `<section class="pw-lgrid" aria-label="{{heading}}">
  <div class="pw-container">
    <p class="pw-lgrid__label">{{heading}}</p>
    <ul class="pw-lgrid__list">
      <!-- pw:repeat logos -->
      <li class="pw-lgrid__item">{{name}}</li>
      <!-- /pw:repeat -->
    </ul>
  </div>
</section>
`,
  css: `.pw-lgrid { padding-block: var(--pw-space-7); }
.pw-lgrid__label { text-align: center; color: var(--pw-color-muted); font-size: .8125rem;
  letter-spacing: .08em; text-transform: uppercase; margin-block: 0 var(--pw-space-5); }
.pw-lgrid__list { list-style: none; margin: 0; padding: 0; display: grid;
  gap: var(--pw-space-4); grid-template-columns: repeat(2, minmax(0, 1fr)); }
@media (min-width: 640px) { .pw-lgrid__list { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.pw-lgrid__item { text-align: center; font-family: var(--pw-font-display); font-weight: 600;
  color: var(--pw-color-muted); border: 1px solid var(--pw-color-line);
  border-radius: var(--pw-radius-sm); padding-block: var(--pw-space-4); }
`
}));

console.log('batch F: ' + done.length + ' blocks — ' + done.join(', '));
