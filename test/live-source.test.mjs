import test from 'node:test';
import assert from 'node:assert/strict';
import { appendFile, mkdtemp, mkdir, rm, truncate, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { probeCurrentProgress } from '../server/live-source.mjs';

const THREAD = '12345678-1234-1234-1234-123456789abc';
const TURN = 'PRIVATE_TURN_ID';
const jsonl = (rows) => rows.map((row) => `${JSON.stringify(row)}\n`).join('');

test('active progress consumes only appended bytes and returns no native IDs or content', async (t) => {
  const home = await mkdtemp(join(tmpdir(), 'profiler-live-'));
  t.after(() => rm(home, { recursive: true, force: true }));
  const day = join(home, 'sessions', '2026', '10', '03');
  await mkdir(day, { recursive: true });
  const file = join(day, `rollout-${THREAD}.jsonl`);
  await writeFile(file, jsonl([
    { type: 'session_meta', payload: { id: THREAD, cwd: 'PRIVATE_PATH' } },
    { type: 'turn_context', payload: { turn_id: TURN, model: 'test-model' } },
    { type: 'event_msg', payload: { type: 'task_started', turn_id: TURN, started_at: 1_700_000_000 } },
    { type: 'event_msg', payload: { type: 'item_completed', turn_id: TURN,
      item: { type: 'CommandExecution', status: 'completed', command: 'PRIVATE_COMMAND', stdout: 'PRIVATE_OUTPUT' } } },
    { type: 'token_usage_record', payload: { turn_id: TURN,
      turn_token_usage: { input_tokens: 8, output_tokens: 3, secret: 'PRIVATE_USAGE' } } },
  ]));
  const meta = { threadId: THREAD };
  const first = await probeCurrentProgress(meta, home);
  assert.equal(first.rollout_match, 'verified');
  assert.equal(first.progress.active_turn.completed_tool_calls.value, 1);
  assert.equal(first.progress.active_turn.usage.input_tokens, 8);
  assert.equal(first.progress.active_turn.model, 'test-model');
  assert.equal(first.progress.latest_completed_turn, null);
  const second = await probeCurrentProgress(meta, home);
  assert.equal(second.update.bytes_read, 0);
  assert.equal(second.progress.active_turn.completed_tool_calls.value, 1);

  const append = jsonl([
    { type: 'event_msg', payload: { type: 'task_complete', turn_id: TURN,
      duration_ms: 2_000, last_agent_message: 'PRIVATE_MESSAGE' } },
  ]);
  await appendFile(file, append);
  const third = await probeCurrentProgress(meta, home);
  assert.equal(third.update.bytes_read, Buffer.byteLength(append));
  assert.equal(third.progress.active_turn, null);
  assert.equal(third.progress.latest_completed_turn.wall_duration_ms.value, 2_000);
  assert.equal(third.progress.latest_completed_turn.completed_tool_calls.value, 1);
  for (const forbidden of [THREAD, TURN, 'PRIVATE_']) {
    assert.ok(!JSON.stringify(third).includes(forbidden), `leaked ${forbidden}`);
  }

  await truncate(file, 0);
  assert.equal((await probeCurrentProgress(meta, home)).rollout_match, 'source_changed');
});

test('missing host context cannot select a rollout', async () => {
  assert.deepEqual(await probeCurrentProgress({}, 'C:/nonexistent'), {
    probe_version: 3, thread_context: 'unavailable', rollout_match: 'unavailable',
  });
});
