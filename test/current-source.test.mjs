import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { probeCurrentSource } from '../server/current-source.mjs';

const THREAD = '12345678-1234-1234-1234-123456789abc';

test('host thread context selects only its matching read-only rollout and leaks no content', async (t) => {
  const home = await mkdtemp(join(tmpdir(), 'profiler-p0-'));
  t.after(() => rm(home, { recursive: true, force: true }));
  const day = join(home, 'sessions', '2026', '10', '02');
  await mkdir(day, { recursive: true });
  const file = join(day, `rollout-${THREAD}.jsonl`);
  const rows = [
    { type: 'session_meta', payload: { id: THREAD, cwd: 'PRIVATE_PATH', source: 'vscode' } },
    { type: 'turn_context', payload: { turn_id: 'SECRET_TURN', model: 'test-model' } },
    { type: 'event_msg', payload: { type: 'task_started', turn_id: 'SECRET_TURN', started_at: 1_700_000_000 } },
    { type: 'token_usage_record', payload: { turn_id: 'SECRET_TURN', thread_id: THREAD,
      turn_token_usage: { input_tokens: 8, output_tokens: 3 } } },
    { type: 'event_msg', payload: { type: 'task_complete', turn_id: 'SECRET_TURN',
      completed_at: 1_700_000_002, duration_ms: 2_000, last_agent_message: 'PRIVATE_MESSAGE' } },
  ];
  await writeFile(file, rows.map((row) => JSON.stringify(row)).join('\n'));
  const result = await probeCurrentSource({ threadId: THREAD }, home);
  assert.equal(result.thread_context, 'provided');
  assert.equal(result.rollout_match, 'verified');
  assert.equal(result.summary.turn.wall_duration_ms.value, 2_000);
  assert.equal(result.summary.turn.usage.input_tokens, 8);
  const output = JSON.stringify(result);
  for (const forbidden of [THREAD, 'SECRET_TURN', 'PRIVATE_']) {
    assert.ok(!output.includes(forbidden), `leaked ${forbidden}`);
  }
});

test('missing host context does not scan or guess a current thread', async () => {
  assert.deepEqual(await probeCurrentSource({}, 'C:/nonexistent'), {
    probe_version: 2, thread_context: 'unavailable', rollout_match: 'unavailable',
  });
});
