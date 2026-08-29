const REPEAT = /<!--\s*pw:repeat\s+([\w-]+)\s*-->([\s\S]*?)<!--\s*\/pw:repeat\s*-->/g;

const escapeHtml = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Substitute {{slot}} and expand <!-- pw:repeat name --> blocks. Nothing else. */
export function render(tpl: string, data: Record<string, any>, assets: Record<string, string> = {}): string {
  let out = tpl.replace(REPEAT, (_m, name: string, inner: string) => {
    const rows = Array.isArray(data[name]) ? data[name] : [];
    return rows.map((row: Record<string, any>) => fill(inner, row, assets)).join('');
  });
  out = fill(out, data, assets);
  return out;
}

function fill(tpl: string, data: Record<string, any>, assets: Record<string, string>): string {
  return tpl.replace(/\{\{\s*([\w.:-]+)\s*\}\}/g, (_m, key: string) => {
    if (key.startsWith('asset:')) return assets[key.slice(6)] ?? '';
    const v = data[key];
    if (v === undefined || v === null) return '';
    return escapeHtml(v);
  });
}

/** Slots that were never filled — surfaced to the user, never left silently blank. */
export function missingSlots(tpl: string, data: Record<string, any>): string[] {
  const found = new Set<string>();
  const body = tpl.replace(REPEAT, '');
  let m: RegExpExecArray | null;
  const re = /\{\{\s*([\w.:-]+)\s*\}\}/g;
  while ((m = re.exec(body)) !== null) {
    const k = m[1];
    if (!k.startsWith('asset:') && (data[k] === undefined || data[k] === null || data[k] === '')) found.add(k);
  }
  return [...found];
}
