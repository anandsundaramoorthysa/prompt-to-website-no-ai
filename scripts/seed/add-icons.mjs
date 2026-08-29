/**
 * Give every copy-bank list that feeds an icon block a named icon.
 * Icon names are validated against corpus/icons.json by check-icons.mjs.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Which icon suits which item, chosen per industry rather than at random. */
const ICONS = {
  saas: {
    'features.items': [
      ['chart', 'check', 'clock'],
      ['bolt', 'shield', 'globe']
    ],
    'process.steps': ['box', 'users', 'check']
  },
  agency: {
    'services.items': [
      ['tag', 'chat', 'wrench'],
      ['globe', 'star', 'check']
    ],
    'process.steps': ['chat', 'star', 'truck']
  },
  restaurant: {
    'features.items': [['leaf', 'clock', 'heart']]
  },
  shop: {
    'features.items': [['truck', 'leaf', 'wrench']],
    'shipping.items': ['truck', 'leaf', 'wrench']
  },
  event: {
    'process.steps': ['pin', 'chat', 'users']
  },
  portfolio: {},
  'pet-shop': {
    'features.items': [['heart', 'leaf', 'truck']]
  },
  business: {
    'services.items': [['check', 'clock', 'phone']],
    'features.items': [['check', 'star', 'shield']]
  }
};

let touched = 0;

for (const [bank, keys] of Object.entries(ICONS)) {
  const path = join(root, 'corpus', 'copy', bank + '.json');
  let data;
  try { data = JSON.parse(readFileSync(path, 'utf8')); } catch { continue; }

  let changed = false;
  for (const [key, spec] of Object.entries(keys)) {
    const value = data[key];
    if (!Array.isArray(value)) continue;

    // Two shapes exist: a list of variant-lists, or a single flat list.
    const isNested = Array.isArray(value[0]);
    const variants = isNested ? value : [value];
    const specs = Array.isArray(spec[0]) ? spec : [spec];

    variants.forEach((rows, vi) => {
      const names = specs[Math.min(vi, specs.length - 1)];
      rows.forEach((row, ri) => {
        if (row && typeof row === 'object' && !row.icon) {
          row.icon = names[ri % names.length];
          changed = true;
        }
      });
    });
  }

  if (changed) {
    writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log('icons added to ' + bank);
    touched++;
  }
}

console.log(touched + ' copy bank(s) updated');
