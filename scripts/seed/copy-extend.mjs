/** Copy for the categories added in batches F and G. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const merge = (bank, add) => {
  const p = join(root, 'corpus', 'copy', bank + '.json');
  const d = JSON.parse(readFileSync(p, 'utf8'));
  Object.assign(d, add);
  writeFileSync(p, JSON.stringify(d, null, 2) + '\n', 'utf8');
  console.log(bank + ': ' + Object.keys(d).length + ' keys');
};

merge('restaurant', {
  'hours.heading': ['Opening hours', 'When we are open'],
  'hours.subheading': ['Kitchen closes half an hour before we do.', 'Closed Mondays, and the week after Christmas.'],
  'hours.days': [[
    { day: 'Tuesday to Thursday', time: '07:00 – 16:00' },
    { day: 'Friday', time: '07:00 – 22:00' },
    { day: 'Saturday', time: '08:00 – 22:00' },
    { day: 'Sunday', time: '09:00 – 15:00' },
    { day: 'Monday', time: 'Closed' }
  ]],
  'location.heading': ['Find us', 'Where we are'],
  'location.address': ['14 Print Hall Lane\nOld Quarter\nBristol BS1 4QT'],
  'location.travel': ['Five minutes from the station, on the left past the bridge. Two step-free entrances; the courtyard one is widest.'],
  'location.links_out': [[{ label: 'Get directions', href: '#' }, { label: 'Accessibility notes', href: '#' }]],
  'booking.heading': ['Book a table', 'Reserve'],
  'booking.subheading': ['Tables of two to six. For larger groups, email us instead.', 'We hold bookings for fifteen minutes.'],
  'booking.action': ['#'],
  'booking.submit_label': ['Request a table'],
  'gallery.heading': ['The room', 'A look inside'],
  'gallery.items': [[{ caption: 'The counter, first thing' }, { caption: 'Courtyard in summer' },
                     { caption: 'Saturday service' }, { caption: 'The oven' }]],
  'menu-preview.heading': ['From the menu', 'A few favourites'],
  'menu-preview.subheading': ['Changes with whatever arrives that morning.'],
  'menu-preview.items': [[
    { dish: 'Cardamom bun', price: '4.20', note: 'Baked twice, usually gone by two' },
    { dish: 'Soup of the day', price: '8.00', note: 'Served with bread from the day before' },
    { dish: 'Sourdough toast', price: '5.50', note: 'Cultured butter and honey' }
  ]],
  'quote-strip.quote': ['The cardamom buns are the reason I moved to this street.'],
  'quote-strip.source': ['Marta, regular since 2019']
});

merge('event', {
  'tickets.heading': ['Tickets', 'Book a place'],
  'tickets.subheading': ['Early tickets are cheaper and there are not many.', 'All tickets include lunch and coffee.'],
  'tickets.tiers': [[
    { name: 'Early', price: '£95', note: 'Limited to the first sixty', cta_label: 'Get early' },
    { name: 'Standard', price: '£140', note: 'Includes lunch and the recordings', cta_label: 'Get standard' },
    { name: 'Community', price: '£40', note: 'Students, non-profits, between jobs. No questions.', cta_label: 'Get community' }
  ]],
  'location.heading': ['Getting there', 'The venue'],
  'location.address': ['The Old Print Hall\n2 Foundry Street\nBristol BS1 6TR'],
  'location.travel': ['Ten minutes from Temple Meads. Step-free throughout, hearing loop in the main room, quiet room upstairs.'],
  'location.links_out': [[{ label: 'Accessibility notes', href: '#' }, { label: 'Get directions', href: '#' }]],
  'process.heading': ['How the day runs'],
  'process.subheading': ['Single track, so nobody has to choose.'],
  'process.steps': [[
    { title: 'Arrive', body: 'Doors and coffee from nine. Badges are on the table, find your own.' },
    { title: 'Listen', body: 'Four talks before lunch, three after. Twenty-five minutes each, questions after.' },
    { title: 'Argue', body: 'A long lunch and a closing panel, which is where the useful bits happen.' }
  ]]
});

merge('shop', {
  'shipping.items': [[
    { title: 'Free returns', body: 'Thirty days, no questions asked' },
    { title: 'Plastic-free', body: 'Paper, card and paper tape only' },
    { title: 'Repairs', body: 'Send it back and we will fix it' }
  ]],
  'press.heading': ['As seen in'],
  'press.items': [[
    { quote: 'The tote you buy once.', source: 'Harbour Press' },
    { quote: 'Quietly the best-made things we tested.', source: 'Fernway Review' },
    { quote: 'Repairable, which is now rare enough to be radical.', source: 'Still Water' }
  ]],
  'hours.heading': ['Workshop hours'],
  'hours.subheading': ['The shop is online, but you can visit the workshop.'],
  'hours.days': [[
    { day: 'Thursday', time: '10:00 – 17:00' },
    { day: 'Friday', time: '10:00 – 17:00' },
    { day: 'Saturday', time: '10:00 – 14:00' },
    { day: 'Sunday to Wednesday', time: 'Closed' }
  ]],
  'location.heading': ['Visit the workshop'],
  'location.address': ['Unit 4, Old Joinery\nFoundry Street\nBristol BS1 6TR'],
  'location.travel': ['Ring the bell on the blue door. Step-free access through the yard.'],
  'location.links_out': [[{ label: 'Get directions', href: '#' }]]
});

merge('agency', {
  'process.heading': ['How we work', 'Our process'],
  'process.subheading': ['Three phases, scoped in writing before anything starts.'],
  'process.steps': [[
    { title: 'Discovery', body: 'Two weeks working out what is actually being asked for, before anyone designs anything.' },
    { title: 'Design', body: 'Reviewed with you weekly rather than revealed at the end. No big unveilings.' },
    { title: 'Delivery', body: 'We stay through launch and hand over documented. No cliff.' }
  ]],
  'timeline.heading': ['A short history'],
  'timeline.entries': [[
    { year: '2016', title: 'Two people, one room', body: 'Started with a single client and a borrowed desk.' },
    { year: '2019', title: 'Six people', body: 'Stopped growing on purpose. Three projects at a time ever since.' },
    { year: '2023', title: 'Independent still', body: 'Turned down acquisition twice, and more work than we took.' }
  ]],
  'awards.heading': ['Recognition'],
  'awards.items': [[
    { name: 'Design Week Awards — Brand Identity', meta: 'Shortlisted, 2025' },
    { name: 'Accessibility in Practice', meta: 'Winner, 2024' },
    { name: 'Type Directors Club', meta: 'Certificate of excellence, 2023' }
  ]],
  'press.heading': ['Written about us'],
  'press.items': [[
    { quote: 'A studio that says no, which is why the yes is worth something.', source: 'Design Week' },
    { quote: 'Accessible by default, not by retrofit.', source: 'Harbour Press' },
    { quote: 'They document better than most in-house teams.', source: 'Kestrel' }
  ]]
});

merge('portfolio', {
  'availability.status': ['Available from September', 'Taking work for the second half of the year'],
  'availability.detail': ['Two project slots left this year.', 'Happy to talk about work starting later.'],
  'availability.cta_label': ['Get in touch'],
  'awards.heading': ['Recognition'],
  'awards.items': [[
    { name: 'D&AD Wood Pencil', meta: 'Editorial, 2025' },
    { name: 'Association of Photographers', meta: 'Shortlisted, 2024' }
  ]],
  'timeline.heading': ['A short history'],
  'timeline.entries': [[
    { year: '2014', title: 'First studio job', body: 'Four years learning the parts nobody photographs.' },
    { year: '2022', title: 'On my own', body: 'Fewer projects, longer spent on each one.' }
  ]],
  'contact.details': [[
    { key: 'Email', value: 'hello@example.com', href: '#' },
    { key: 'Instagram', value: '@example', href: '#' }
  ]],
  'quote-strip.quote': ['Asked better questions than anyone else we spoke to.'],
  'quote-strip.source': ['Ana, Harbour Press']
});

merge('saas', {
  'process.heading': ['How it works'],
  'process.subheading': ['Three steps, about five minutes.'],
  'process.steps': [[
    { title: 'Import a project', body: 'Bring a spreadsheet or start from a template. Nothing to configure.' },
    { title: 'Invite the team', body: 'They see the same timeline you do, immediately.' },
    { title: 'Stop reporting', body: 'Progress updates itself from real activity.' }
  ]],
  'help.heading': ['Need a hand?'],
  'help.items': [[
    { title: 'Getting started', body: 'Set up your first project in about five minutes.', link_label: 'Read the guide', href: '#' },
    { title: 'Importing data', body: 'Bring across spreadsheets, or pull from the usual tools.', link_label: 'Import guide', href: '#' },
    { title: 'Billing', body: 'Plans, invoices and how proration works.', link_label: 'Billing help', href: '#' }
  ]],
  'banner.message': ['Version 3 is out — timelines are now shareable read-only.'],
  'banner.cta_label': ['What changed'],
  'contact.details': [[
    { key: 'Email', value: 'hello@example.com', href: '#' },
    { key: 'Support', value: 'support@example.com', href: '#' }
  ]],
  'hero.footnote': ['Free for three people. No card required.', 'No credit card, no sales call.'],
  'hero.action': ['#'],
  'hero.submit_label': ['Start free']
});
