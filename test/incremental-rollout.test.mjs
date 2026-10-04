import test from 'node:test';
import assert from 'node:assert/strict';
import { appendFile, mkdtemp, rm, truncate, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { IncrementalRolloutReader } from '../server/incremental-rollout.mjs';

test('reads appended complete JSONL records once and waits for a split UTF-8 tail', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'profiler-incremental-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const file = join(root, 'rollout.jsonl');
  await writeFile(file, '');
  const reader = new IncrementalRolloutReader(file, (row) => row.type === 'event_msg'
    ? { kind: row.payload.type, count: row.payload.count } : null, { maxReadBytes: 9 });
  const line = Buffer.from(JSON.stringify({ type: 'event_msg', payload: {
    type: 'token_count', count: 3, message: 'PRIVATE_猫', command: 'PRIVATE_COMMAND',
  } }) + '\n');
  const split = line.indexOf(Buffer.from('猫')) + 1;
  await appendFile(file, line.subarray(0, split));
  let records = [];
  let chunk;
  do {
    chunk = await reader.readNext();
    records.push(...chunk.records);
  } while (chunk.has_more);
  assert.deepEqual(records, []);

  await appendFile(file, line.subarray(split));
  do {
    chunk = await reader.readNext();
    records.push(...chunk.records);
  } while (chunk.has_more);
  assert.deepEqual(records, [{ kind: 'token_count', count: 3 }]);
  assert.equal((await reader.readNext()).bytes_read, 0);
  assert.ok(!JSON.stringify(records).includes('PRIVATE_'));
});

test('skips oversized records without retaining their tail and reports source truncation', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'profiler-incremental-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const file = join(root, 'rollout.jsonl');
  await writeFile(file, `${JSON.stringify({ secret: 'PRIVATE_CONTENT'.repeat(10) })}\n{"value":1}\n`);
  const reader = new IncrementalRolloutReader(file, (row) => ({ value: row.value }),
    { maxReadBytes: 11, maxLineBytes: 32 });
  let oversized = 0;
  let records = [];
  let chunk;
  do {
    chunk = await reader.readNext();
    oversized += chunk.oversized_records;
    records.push(...chunk.records);
  } while (chunk.has_more);
  assert.equal(oversized, 1);
  assert.deepEqual(records, [{ value: 1 }]);
  await truncate(file, 0);
  assert.deepEqual((await reader.readNext()).status, 'source_changed');
});
