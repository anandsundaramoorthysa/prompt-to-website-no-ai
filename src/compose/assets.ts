import { pick } from '../hash.js';

/**
 * D9 — every visual placeholder is generated, deterministic and inline.
 * No hotlinks, no downloads, no broken images, no stock-photo licensing.
 */
export function heroGradient(seed: number, alt: string): string {
  const rot = pick([0, 25, 45, 70, 110, 160], seed, 3);
  const id = 'pwg' + (seed % 99991);
  return [
    `<svg class="pw-hero__media" viewBox="0 0 640 420" role="img" aria-label="${escapeAttr(alt)}"`,
    ` xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">`,
    `<defs><linearGradient id="${id}" gradientTransform="rotate(${rot})">`,
    `<stop offset="0" stop-color="var(--pw-color-primary)" stop-opacity=".85"/>`,
    `<stop offset="1" stop-color="var(--pw-color-primary)" stop-opacity=".18"/>`,
    `</linearGradient></defs>`,
    `<rect width="640" height="420" rx="14" fill="url(#${id})"/>`,
    `<g fill="var(--pw-color-surface)" fill-opacity=".55">`,
    `<rect x="56" y="88" width="300" height="16" rx="8"/>`,
    `<rect x="56" y="124" width="220" height="16" rx="8"/>`,
    `<rect x="56" y="184" width="520" height="150" rx="12" fill-opacity=".38"/>`,
    `</g></svg>`
  ].join('');
}

export function favicon(brand: string, seed: number): string {
  const letter = (brand.trim()[0] ?? 'W').toUpperCase();
  const r = pick(['6', '10', '16'], seed, 7);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">`,
    `<rect width="64" height="64" rx="${r}" fill="#1F5C94"/>`,
    `<text x="32" y="43" font-family="Segoe UI, system-ui, sans-serif" font-size="34"`,
    ` font-weight="700" fill="#ffffff" text-anchor="middle">${escapeAttr(letter)}</text>`,
    `</svg>`
  ].join('');
}

const escapeAttr = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/** Square tile for project/gallery grids. Same seed, same tile. */
export function tile(seed: number): string {
  const rot = pick([15, 55, 95, 135], seed, 11);
  const id = 'pwt' + (seed % 88883);
  return [
    '<svg class="pw-tile" viewBox="0 0 400 300" role="img"',
    ' aria-label="TODO: describe this project image"',
    ' xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">',
    '<defs><linearGradient id="' + id + '" gradientTransform="rotate(' + rot + ')">',
    '<stop offset="0" stop-color="var(--pw-color-primary)" stop-opacity=".7"/>',
    '<stop offset="1" stop-color="var(--pw-color-primary)" stop-opacity=".15"/>',
    '</linearGradient></defs>',
    '<rect width="400" height="300" fill="url(#' + id + ')"/>',
    '</svg>'
  ].join('');
}
