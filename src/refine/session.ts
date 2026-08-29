import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { CORPUS } from '../generated/corpus.js';
import type { Stack } from '../types.js';

export const SESSION_SCHEMA_VERSION = 1;
export const SESSION_DIR = '.promptsite';
export const SESSION_FILE = 'session.json';

export interface Step { id: number; text: string; enabled: boolean; }

export interface Session {
  schemaVersion: number;
  /** Pinned so a replay reproduces the original bytes even after a corpus bump. */
  corpus: string;
  extension: string;
  stack: Stack;
  steps: Step[];
  /** Set when generated files were edited by hand — see guardManualEdits(). */
  manualEditsDetected: boolean;
  /** path -> sha256 at write time */
  fileHashes: Record<string, string>;
}

export function newSession(prompt: string, stack: Stack): Session {
  return {
    schemaVersion: SESSION_SCHEMA_VERSION,
    corpus: CORPUS.corpusHash,
    extension: CORPUS.version,
    stack,
    steps: [{ id: 1, text: prompt, enabled: true }],
    manualEditsDetected: false,
    fileHashes: {}
  };
}

/** H12 — old sessions must keep opening after the schema moves on. */
export function migrate(raw: any): Session {
  const s = { ...raw };
  if (typeof s.schemaVersion !== 'number') s.schemaVersion = 0;

  if (s.schemaVersion < 1) {
    s.steps = Array.isArray(s.steps)
      ? s.steps.map((t: any, i: number) =>
          typeof t === 'string' ? { id: i + 1, text: t, enabled: true } : t)
      : [];
    s.manualEditsDetected = Boolean(s.manualEditsDetected);
    s.fileHashes = s.fileHashes || {};
    s.stack = s.stack || 'bootstrap';
    s.corpus = s.corpus || CORPUS.corpusHash;
    s.extension = s.extension || CORPUS.version;
    s.schemaVersion = 1;
  }
  return s as Session;
}

export function sessionPath(root: string): string {
  return path.join(root, SESSION_DIR, SESSION_FILE);
}

export async function loadSession(root: string): Promise<Session | null> {
  try {
    const raw = await fs.readFile(sessionPath(root), 'utf8');
    return migrate(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function saveSession(root: string, session: Session): Promise<void> {
  const p = sessionPath(root);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(session, null, 2) + '\n', { encoding: 'utf8' });
}

export function addStep(session: Session, text: string): Session {
  const nextId = session.steps.reduce((m, s) => Math.max(m, s.id), 0) + 1;
  return { ...session, steps: [...session.steps, { id: nextId, text, enabled: true }] };
}

export function toggleStep(session: Session, id: number): Session {
  return {
    ...session,
    steps: session.steps.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
  };
}

export function removeStep(session: Session, id: number): Session {
  return { ...session, steps: session.steps.filter((s) => s.id !== id) };
}

export function moveStep(session: Session, id: number, delta: number): Session {
  const steps = [...session.steps];
  const i = steps.findIndex((s) => s.id === id);
  const j = i + delta;
  if (i === -1 || j < 0 || j >= steps.length) return session;
  [steps[i], steps[j]] = [steps[j], steps[i]];
  return { ...session, steps };
}
