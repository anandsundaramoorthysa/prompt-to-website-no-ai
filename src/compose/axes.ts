import type { TokenPreset } from '../types.js';
import type { Axes } from '../refine/mutate.js';

/**
 * D14 — customization axes are pure parameter substitution over a fixed corpus.
 * 4 palettes x 4 radii x 3 densities x 3 elevations = 144 coherent configurations
 * before block-variant selection, which is the structural answer to output sameness.
 */

const RADIUS: Record<Axes['radius'], Record<string, string>> = {
  sharp:   { sm: '0px', md: '0px', lg: '0px' },
  soft:    { sm: '4px', md: '8px', lg: '14px' },
  rounded: { sm: '8px', md: '14px', lg: '22px' },
  pill:    { sm: '999px', md: '18px', lg: '26px' }
};

const DENSITY: Record<Axes['density'], number> = {
  compact: 0.78,
  normal: 1,
  roomy: 1.32
};

const ELEVATION: Record<Axes['elevation'], Record<string, string>> = {
  flat:   { sm: 'none', md: 'none' },
  subtle: { sm: '0 1px 2px rgba(16,24,40,.06)', md: '0 4px 16px rgba(16,24,40,.10)' },
  lifted: { sm: '0 2px 6px rgba(16,24,40,.10)', md: '0 12px 32px rgba(16,24,40,.16)' }
};

const px = (v: string, factor: number): string => {
  const n = parseFloat(v);
  if (Number.isNaN(n)) return v;
  return Math.max(2, Math.round(n * factor)) + 'px';
};

/** Contrast-safe: only structural tokens scale. Colours are replaced wholesale. */
export function applyAxes(preset: TokenPreset, axes: Axes): TokenPreset {
  const out: TokenPreset = JSON.parse(JSON.stringify(preset));

  out.radius = { ...RADIUS[axes.radius] };
  out.shadow = { ...ELEVATION[axes.elevation] };

  const factor = DENSITY[axes.density];
  if (factor !== 1) {
    for (const k of Object.keys(out.space)) out.space[k] = px(out.space[k], factor);
  }

  if (axes.primary) {
    out.color.primary = axes.primary;
    out.color['primary-ink'] = readableInk(axes.primary);
    out.colorDark.primary = lighten(axes.primary, 0.42);
    out.colorDark['primary-ink'] = readableInk(out.colorDark.primary);
  }
  return out;
}

function channels(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16)) as [number, number, number];
}
const toHex = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');

function luminance(hex: string): number {
  const srgb = (c: number) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  const [r, g, b] = channels(hex);
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
}

/**
 * Pick the foreground that actually passes on this background, rather than
 * assuming white. The user cannot customise their way into a failing pair.
 */
function readableInk(bg: string): string {
  const l = luminance(bg);
  const withWhite = (1.05) / (l + 0.05);
  const withBlack = (l + 0.05) / 0.05;
  return withWhite >= withBlack ? '#FFFFFF' : '#101010';
}

function lighten(hex: string, amount: number): string {
  const [r, g, b] = channels(hex);
  return '#' + toHex(r + (255 - r) * amount) + toHex(g + (255 - g) * amount) + toHex(b + (255 - b) * amount);
}
