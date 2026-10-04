import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findCurrentRollout } from '../server/current-source.mjs';

const THREAD = '12345678-1234-1234-1234-123456789abc';

test('locator verifies the session header and refuses ambiguous matches', async (t) => {
  const home = await mkdtemp(join(tmpdir(), 'profiler-source-'));
  t.after(() => rm(home, { recursive: true, force: true }));
  const day = join(home, 'sessions', '2026', '10', '02');
  await mkdir(day, { recursive: true });
  const file = join(day, `rollout-${THREAD}.jsonl`);
  const meta = { threadId: THREAD };
  await writeFile(file, JSON.stringify({ type: 'session_meta', payload: { id: 'wrong-session' } }));
  assert.equal((await findCurrentRollout(meta, home)).rollout_match, 'not_found');
  const header = JSON.stringify({ type: 'session_meta', payload: { id: THREAD } });
  await writeFile(file, header);
  assert.deepEqual(await findCurrentRollout(meta, home), {
    thread_context: 'provided', rollout_match: 'verified', file,
  });
  await writeFile(join(day, `duplicate-${THREAD}.jsonl`), header);
  assert.deepEqual(await findCurrentRollout(meta, home), {
    thread_context: 'provided', rollout_match: 'ambiguous',
  });
});

test('missing or invalid host context does not select a rollout', async () => {
  for (const meta of [{}, { threadId: '../private-path' }]) {
    assert.deepEqual(await findCurrentRollout(meta, 'C:/nonexistent'), {
      thread_context: 'unavailable', rollout_match: 'unavailable',
    });
  }
});
