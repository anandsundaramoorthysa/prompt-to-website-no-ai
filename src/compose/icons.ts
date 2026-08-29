import { CORPUS } from '../generated/corpus.js';

/**
 * Inline SVG icons. Drawn from paths held in the corpus rather than pulled from
 * an icon font or a CDN, so a generated site still makes zero external requests.
 *
 * Decorative by default: aria-hidden, with the meaning carried by the heading
 * beside it. An icon that repeats the adjacent text just makes a screen reader
 * say everything twice.
 */
export function icon(name: string, fallback?: string): string {
  const set = CORPUS.icons;
  const path = set && set.icons ? set.icons[name] : undefined;

  if (!path) {
    // Unknown name: fall back to a letter rather than rendering an empty box.
    // A missing icon should look deliberate, never broken.
    const letter = (fallback || name || '?').trim().charAt(0).toUpperCase();
    return '<span class="pw-icon__glyph" aria-hidden="true">' + escapeText(letter) + '</span>';
  }

  return [
    '<svg class="pw-icon__svg" viewBox="' + (set._viewBox || '0 0 24 24') + '"',
    ' aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"',
    ' fill="none" stroke="currentColor" stroke-width="1.75"',
    ' stroke-linecap="round" stroke-linejoin="round">',
    '<path d="' + path + '"/>',
    '</svg>'
  ].join('');
}

/** Names available to copy banks, used by the corpus gate to catch typos. */
export function iconNames(): string[] {
  const set = CORPUS.icons;
  return set && set.icons ? Object.keys(set.icons) : [];
}

const escapeText = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
