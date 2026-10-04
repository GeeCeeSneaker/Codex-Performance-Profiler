import { findCurrentRollout, installedCodexHome } from './current-source.mjs';
import { IncrementalRolloutReader } from './incremental-rollout.mjs';

const MAX_CACHE_ENTRIES = 4;
const MAX_BYTES_PER_CALL = 64 * 1024 * 1024;
const TOKEN_FIELDS = [
  'input_tokens', 'cached_input_tokens', 'cache_write_input_tokens',
  'output_tokens', 'reasoning_output_tokens', 'total_tokens',
];
const TOOL_KINDS = new Set(['CommandExecution', 'FileChange', 'McpToolCall', 'WebSearch']);
const cache = new Map();

function nativeId(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 128 ? value : undefined;
}

function safeLabel(value) {
  return typeof value === 'string' && value.length <= 80 && /^[a-zA-Z0-9._:-]+$/.test(value)
    ? value : null;
}

function safeUsage(value) {
  if (!value || typeof value !== 'object') return null;
  const usage = {};
  for (const key of TOKEN_FIELDS) {
    if (typeof value[key] === 'number' && Number.isFinite(value[key]) && value[key] >= 0) {
      usage[key] = value[key];
    }
  }
  return Object.keys(usage).length ? usage : null;
}

function millis(value) {
  const time = typeof value === 'string' ? Date.parse(value)
    : typeof value === 'number' && value < 100_000_000_000 ? value * 1000 : value;
  return Number.isFinite(time) ? time : null;
}

function projectRecord(row) {
  if (!row || typeof row !== 'object' || !row.payload || typeof row.payload !== 'object') return null;
  const p = row.payload;
  const turnId = nativeId(p.turn_id);
  if (row.type === 'turn_context' && turnId) {
    return { kind: 'context', turnId, model: safeLabel(p.model) };
  }
  if (row.type === 'token_usage_record' && turnId) {
    const usage = safeUsage(p.turn_token_usage);
    return usage ? { kind: 'usage', turnId, usage } : null;
  }
  if (row.type !== 'event_msg' || !turnId) return null;
  if (p.type === 'task_started') {
    return { kind: 'started', turnId, startedMs: millis(p.started_at) ?? millis(row.timestamp) };
  }
  if (p.type === 'task_complete') {
    return { kind: 'completed', turnId,
      completedMs: millis(p.completed_at) ?? millis(row.timestamp),
      duration: typeof p.duration_ms === 'number' && Number.isFinite(p.duration_ms) && p.duration_ms >= 0
        ? p.duration_ms : null };
  }
  if (p.type === 'item_completed' && TOOL_KINDS.has(p.item?.type)) {
    return { kind: 'tool_completed', turnId };
  }
  return null;
}

class LiveState {
  active = null;
  latestCompleted = null;
  pendingContext = null;
  skippedRecords = 0;

  add(event) {
    if (event.kind === 'context') {
      this.pendingContext = { id: event.turnId, model: event.model };
      if (this.active?.id === event.turnId) this.active.model = event.model;
      return;
    }
    if (event.kind === 'started') {
      this.active = {
        id: event.turnId,
        model: this.pendingContext?.id === event.turnId ? this.pendingContext.model : null,
        tools: 0,
        usage: null,
        duration: null,
        startedMs: event.startedMs,
        durationQuality: 'unavailable',
      };
      this.pendingContext = null;
      return;
    }
    const turn = this.active?.id === event.turnId ? this.active
      : this.latestCompleted?.id === event.turnId ? this.latestCompleted : null;
    if (!turn) return;
    if (event.kind === 'tool_completed') turn.tools++;
    if (event.kind === 'usage') turn.usage = event.usage;
    if (event.kind === 'completed' && turn === this.active) {
      if (event.duration !== null) {
        turn.duration = event.duration;
        turn.durationQuality = 'exact';
      } else if (turn.startedMs !== null && event.completedMs !== null && event.completedMs >= turn.startedMs) {
        turn.duration = event.completedMs - turn.startedMs;
        turn.durationQuality = 'derived';
      }
      this.latestCompleted = turn;
      this.active = null;
    }
  }

  snapshot() {
    const turn = (value) => value ? {
      model: value.model,
      completed_tool_calls: {
        value: this.skippedRecords ? null : value.tools,
        unit: 'count', source: 'rollout:event_msg:item_completed',
        quality: this.skippedRecords ? 'unavailable' : 'exact',
        scope: 'recognized_tool_categories',
      },
      usage: value.usage && !this.skippedRecords
        ? { ...value.usage, source: 'rollout:token_usage_record:turn_token_usage', quality: 'exact' }
        : { source: 'rollout', quality: 'unavailable' },
    } : null;
    return {
      active_turn: turn(this.active),
      latest_completed_turn: this.latestCompleted ? {
        ...turn(this.latestCompleted),
        wall_duration_ms: {
          value: this.latestCompleted.duration,
          unit: 'ms', source: this.latestCompleted.durationQuality === 'derived'
            ? 'rollout:event_msg:task_started+task_complete' : 'rollout:event_msg:task_complete',
          quality: this.latestCompleted.durationQuality,
        },
      } : null,
      skipped_records: this.skippedRecords,
    };
  }
}

async function consume(entry) {
  let bytesRead = 0;
  let recordsProcessed = 0;
  let hasMore = false;
  do {
    const batch = await entry.reader.readNext();
    if (batch.status === 'source_changed') return { rollout_match: 'source_changed' };
    bytesRead += batch.bytes_read;
    entry.state.skippedRecords += batch.malformed_records + batch.oversized_records;
    recordsProcessed += batch.records.length;
    for (const event of batch.records) entry.state.add(event);
    hasMore = batch.has_more;
  } while (hasMore && bytesRead < MAX_BYTES_PER_CALL);
  return {
    rollout_match: 'verified',
    progress: entry.state.snapshot(),
    update: { bytes_read: bytesRead, metric_records_processed: recordsProcessed, catching_up: hasMore },
  };
}

export async function probeCurrentProgress(requestMeta, codexHome = process.env.CODEX_HOME || installedCodexHome()) {
  const threadId = requestMeta?.threadId;
  // findCurrentRollout performs authoritative host ID validation and session-header matching.
  const key = `${codexHome}\0${threadId}`;
  let entry = cache.get(key);
  if (!entry) {
    const match = await findCurrentRollout(requestMeta, codexHome);
    if (match.rollout_match !== 'verified') return { probe_version: 3, ...match };
    entry = { reader: new IncrementalRolloutReader(match.file, projectRecord), state: new LiveState(), pending: Promise.resolve() };
    cache.set(key, entry);
    if (cache.size > MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value);
  }
  const work = entry.pending.then(() => consume(entry));
  entry.pending = work.catch(() => {});
  try {
    const result = await work;
    if (result.rollout_match === 'source_changed') cache.delete(key);
    return { probe_version: 3, thread_context: 'provided', ...result };
  } catch {
    cache.delete(key);
    // Do not expose filesystem paths or raw JSONL in tool errors.
    return { probe_version: 3, thread_context: 'provided', rollout_match: 'read_error' };
  }
}
