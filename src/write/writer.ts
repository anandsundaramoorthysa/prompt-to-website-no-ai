import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { GeneratedFile } from '../compose/compose.js';

/**
 * Pre-flight decision 4 — LF and UTF-8 without BOM, always.
 * Byte-identical determinism silently fails between Windows and CI otherwise,
 * taking the D7 provenance hash and D12 replay guarantee with it.
 */
export function normalise(content: string): string {
  return content.replace(/^﻿/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

export interface WriteResult { written: string[]; overwritten: string[]; }

export async function planWrites(root: string, files: GeneratedFile[]): Promise<string[]> {
  const clashes: string[] = [];
  for (const f of files) {
    try {
      await fs.access(path.join(root, f.path));
      clashes.push(f.path);
    } catch {
      /* absent — nothing to overwrite */
    }
  }
  return clashes;
}

export async function writeAll(root: string, files: GeneratedFile[]): Promise<WriteResult> {
  const written: string[] = [];
  const overwritten: string[] = [];
  for (const f of files) {
    const target = path.join(root, f.path);
    await fs.mkdir(path.dirname(target), { recursive: true });
    let existed = false;
    try { await fs.access(target); existed = true; } catch { /* new file */ }
    if (f.copyFrom) {
      await fs.copyFile(f.copyFrom, target);
    } else {
      await fs.writeFile(target, normalise(f.content), { encoding: 'utf8' });
    }
    (existed ? overwritten : written).push(f.path);
  }
  return { written, overwritten };
}
