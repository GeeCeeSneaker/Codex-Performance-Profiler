import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeRollout } from '../scripts/probe.mjs';

test('maps a completed turn without leaking content or confusing turn and model TTFT', async () => {
  const records = [
    { type: 'session_meta', payload: { source: 'vscode', cli_version: 'test', cwd: 'PRIVATE_PATH' } },
    { type: 'turn_context', payload: { turn_id: 'NATIVE_SECRET_ID', model: 'test-model', cwd: 'PRIVATE_PATH' } },
    { type: 'event_msg', payload: { type: 'task_started', turn_id: 'NATIVE_SECRET_ID', started_at: 1_700_000_000 } },
    { type: 'event_msg', payload: { type: 'item_completed', turn_id: 'NATIVE_SECRET_ID', thread_id: 'THREAD_SECRET',
      started_at_ms: 1_700_000_002_000, completed_at_ms: 1_700_000_003_000,
      item: { type: 'CommandExecution', status: 'failed', exit_code: 1,
        command: 'PRIVATE_COMMAND', stdout: 'PRIVATE_OUTPUT', stderr: 'PRIVATE_ERROR' } } },
    { type: 'token_usage_record', payload: { turn_id: 'NATIVE_SECRET_ID', thread_id: 'THREAD_SECRET',
      turn_token_usage: { input_tokens: 10, output_tokens: 2, secret: 'PRIVATE_USAGE' } } },
    { type: 'event_msg', payload: { type: 'task_complete', turn_id: 'NATIVE_SECRET_ID',
      completed_at: 1_700_000_005, duration_ms: 5_000, time_to_first_token_ms: 1_200,
      last_agent_message: 'PRIVATE_MESSAGE' } },
    null,
  ];
  const result = await summarizeRollout(records);
  const output = JSON.stringify(result);
  assert.equal(result.turn.wall_duration_ms.value, 5_000);
  assert.equal(result.turn.turn_time_to_first_token_ms.value, 1_200);
  assert.ok(result.unavailable.includes('model_ttft'));
  assert.equal(result.turn.tool_spans[0].start_offset_ms, 2_000);
  assert.equal(result.turn.tool_spans[0].duration_ms.value, 1_000);
  assert.equal(result.turn.tool_spans[0].status, 'error');
  assert.equal(result.turn.usage.input_tokens, 10);
  assert.equal(result.malformed_records, 1);
  for (const forbidden of ['PRIVATE_', 'NATIVE_SECRET_ID', 'THREAD_SECRET']) {
    assert.ok(!output.includes(forbidden), `leaked ${forbidden}`);
  }
});

test('missing completion and usage stay unavailable', async () => {
  const result = await summarizeRollout([
    { type: 'event_msg', payload: { type: 'task_started', turn_id: 'a', started_at: 1_700_000_000 } },
  ]);
  assert.equal(result.turn, null);
  assert.equal(result.native_turn_id_observed, true);
});

test('rejects content-shaped labels from upstream fields', async () => {
  const result = await summarizeRollout([
    { type: 'session_meta', payload: { source: 'PRIVATE PATH', cli_version: '0.1\nPRIVATE' } },
    { type: 'turn_context', payload: { turn_id: 'a', model: 'PRIVATE PROMPT' } },
    { type: 'event_msg', payload: { type: 'task_started', turn_id: 'a', started_at: 1_700_000_000 } },
    { type: 'event_msg', payload: { type: 'task_complete', turn_id: 'a', completed_at: 1_700_000_001 } },
  ]);
  assert.equal(result.session_origin, 'unknown');
  assert.equal(result.codex_cli_version, null);
  assert.equal(result.turn.model, null);
});
