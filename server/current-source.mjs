import { createReadStream } from 'node:fs';
import { glob } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { summarizeRollout } from '../plugins/codex-performance-profiler/scripts/probe.mjs';

const THREAD_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function* records(file) {
  const lines = createInterface({ input: createReadStream(file, { encoding: 'utf8' }), crlfDelay: Infinity });
  for await (const line of lines) {
    try { yield JSON.parse(line); }
    catch { yield null; }
  }
}

async function isMatchingSession(file, threadId) {
  for await (const row of records(file)) {
    return row?.type === 'session_meta' && row.payload?.id === threadId;
  }
  return false;
}

export function installedCodexHome() {
  let directory = dirname(fileURLToPath(import.meta.url));
  while (true) {
    const parent = dirname(directory);
    if (basename(directory).toLowerCase() === 'cache' && basename(parent).toLowerCase() === 'plugins') {
      return dirname(parent);
    }
    if (parent === directory) return undefined;
    directory = parent;
  }
}

export async function findCurrentRollout(requestMeta, codexHome = process.env.CODEX_HOME || installedCodexHome()) {
  const threadId = requestMeta?.threadId;
  if (typeof threadId !== 'string' || !THREAD_ID.test(threadId)) {
    return { thread_context: 'unavailable', rollout_match: 'unavailable' };
  }
  if (!codexHome) {
    return { thread_context: 'provided', rollout_match: 'codex_home_unavailable' };
  }

  try {
    const root = resolve(codexHome, 'sessions');
    let match;
    for await (const relative of glob(`**/*${threadId}*.jsonl`, { cwd: root })) {
      const candidate = join(root, relative);
      if (!(await isMatchingSession(candidate, threadId))) continue;
      if (match) return { thread_context: 'provided', rollout_match: 'ambiguous' };
      match = candidate;
    }
    if (!match) return { thread_context: 'provided', rollout_match: 'not_found' };
    return { thread_context: 'provided', rollout_match: 'verified', file: match };
  } catch {
    // Paths, native IDs, and raw records must not escape through diagnostics.
    return { thread_context: 'provided', rollout_match: 'read_error' };
  }
}

export async function probeCurrentSource(requestMeta, codexHome = process.env.CODEX_HOME || installedCodexHome()) {
  const match = await findCurrentRollout(requestMeta, codexHome);
  if (match.rollout_match !== 'verified') return { probe_version: 2, ...match };
  try {
    return {
      probe_version: 2,
      thread_context: 'provided',
      rollout_match: 'verified',
      summary: await summarizeRollout(records(match.file)),
    };
  } catch {
    return { probe_version: 2, thread_context: 'provided', rollout_match: 'read_error' };
  }
}
