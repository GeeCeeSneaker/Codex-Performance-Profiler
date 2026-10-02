import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { pathToFileURL } from 'node:url';

const TOOL_KINDS = new Map([
  ['CommandExecution', 'shell_exec'],
  ['FileChange', 'edit_patch'],
  ['McpToolCall', 'mcp'],
  ['WebSearch', 'web_search'],
]);

const TOKEN_FIELDS = [
  'input_tokens',
  'cached_input_tokens',
  'cache_write_input_tokens',
  'output_tokens',
  'reasoning_output_tokens',
  'total_tokens',
];

function metric(value, unit, source, quality = 'exact') {
  return { value, unit, source, quality };
}

function nonnegativeNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function safeLabel(value) {
  return typeof value === 'string' && value.length <= 80 && /^[a-zA-Z0-9._:-]+$/.test(value)
    ? value : undefined;
}

function millis(value) {
  // task lifecycle fields are Unix seconds; item_completed fields are Unix ms.
  const n = typeof value === 'string' ? Date.parse(value) :
    typeof value === 'number' && value < 100_000_000_000 ? value * 1000 : value;
  return Number.isFinite(n) ? n : undefined;
}

function safeUsage(usage) {
  if (!usage || typeof usage !== 'object') return undefined;
  const fields = {};
  for (const key of TOKEN_FIELDS) {
    if (nonnegativeNumber(usage[key])) fields[key] = usage[key];
  }
  return Object.keys(fields).length ? fields : undefined;
}

function toolStatus(item) {
  const status = typeof item.status === 'string' ? item.status.toLowerCase() : '';
  if (status === 'failed' || status === 'error' ||
      (typeof item.exit_code === 'number' && item.exit_code !== 0)) return 'error';
  if (status === 'cancelled' || status === 'canceled') return 'cancelled';
  if (status === 'completed' || status === 'success' || item.exit_code === 0) return 'success';
  return 'unknown';
}

export async function summarizeRollout(records) {
  const starts = new Map();
  const completions = new Map();
  const contexts = new Map();
  const tools = new Map();
  const usage = new Map();
  const observed = new Set();
  let threadIdObserved = false;
  let source = 'unknown';
  let cliVersion;
  let modelProvider;
  let malformedRecords = 0;

  for await (const row of records) {
    if (row === null) { malformedRecords++; continue; }
    if (!row || typeof row !== 'object') continue;
    const p = row.payload;
    if (!p || typeof p !== 'object') continue;
    if (row.type === 'session_meta') {
      source = safeLabel(p.source) ?? source;
      cliVersion = safeLabel(p.cli_version) ?? cliVersion;
      modelProvider = safeLabel(p.model_provider) ?? modelProvider;
    } else if (row.type === 'turn_context' && typeof p.turn_id === 'string') {
      contexts.set(p.turn_id, {
        model: safeLabel(p.model),
      });
    } else if (row.type === 'event_msg') {
      if (p.type === 'task_started' && typeof p.turn_id === 'string') {
        observed.add('task_started');
        starts.set(p.turn_id, millis(p.started_at) ?? millis(row.timestamp));
      } else if (p.type === 'task_complete' && typeof p.turn_id === 'string') {
        observed.add('task_complete');
        completions.set(p.turn_id, {
          end: millis(p.completed_at) ?? millis(row.timestamp),
          duration: nonnegativeNumber(p.duration_ms) ? p.duration_ms : undefined,
          firstToken: nonnegativeNumber(p.time_to_first_token_ms) ? p.time_to_first_token_ms : undefined,
        });
      } else if (p.type === 'item_completed' && typeof p.turn_id === 'string') {
        const category = TOOL_KINDS.get(p.item?.type);
        if (!category) continue;
        observed.add('item_completed');
        if (typeof p.thread_id === 'string') threadIdObserved = true;
        const start = millis(p.started_at_ms);
        const end = millis(p.completed_at_ms);
        const list = tools.get(p.turn_id) ?? [];
        list.push({ category, status: toolStatus(p.item), start, end });
        tools.set(p.turn_id, list);
      }
    } else if (row.type === 'token_usage_record' && typeof p.turn_id === 'string') {
      observed.add('token_usage_record');
      if (typeof p.thread_id === 'string') threadIdObserved = true;
      const value = safeUsage(p.turn_token_usage);
      if (value) usage.set(p.turn_id, value);
    }
  }

  const completed = [...completions.keys()].filter((id) => starts.has(id));
  const turnId = completed.at(-1);
  const start = turnId ? starts.get(turnId) : undefined;
  const completion = turnId ? completions.get(turnId) : undefined;
  const end = completion?.end;
  const validWindow = Number.isFinite(start) && Number.isFinite(end) && end >= start;
  const spans = turnId ? (tools.get(turnId) ?? []) : [];
  const normalized = spans.map((span, index) => ({
    span_id: `tool-${index + 1}`,
    kind: 'tool',
    subkind: span.category,
    status: span.status,
    start_offset_ms: validWindow && Number.isFinite(span.start) ? span.start - start : null,
    end_offset_ms: validWindow && Number.isFinite(span.end) ? span.end - start : null,
    duration_ms: Number.isFinite(span.start) && Number.isFinite(span.end) && span.end >= span.start
      ? metric(span.end - span.start, 'ms', 'rollout:event_msg:item_completed', 'derived')
      : metric(null, 'ms', 'rollout:event_msg:item_completed', 'unavailable'),
  }));

  return {
    probe_version: 1,
    source: 'Codex rollout JSONL (read only)',
    session_origin: source,
    codex_cli_version: cliVersion ?? null,
    model_provider: modelProvider ?? null,
    native_thread_id_observed: threadIdObserved,
    native_turn_id_observed: starts.size > 0,
    malformed_records: malformedRecords,
    observed_record_types: [...observed].sort(),
    turn: turnId ? {
      turn_ref: 'turn-1',
      wall_duration_ms: completion.duration !== undefined
        ? metric(completion.duration, 'ms', 'rollout:event_msg:task_complete')
        : validWindow
          ? metric(end - start, 'ms', 'rollout:event_msg:task_started+task_complete', 'derived')
          : metric(null, 'ms', 'rollout', 'unavailable'),
      turn_time_to_first_token_ms: completion.firstToken !== undefined
        ? metric(completion.firstToken, 'ms', 'rollout:event_msg:task_complete')
        : metric(null, 'ms', 'rollout', 'unavailable'),
      model: contexts.get(turnId)?.model ?? null,
      tool_spans: normalized,
      usage: usage.has(turnId)
        ? { ...usage.get(turnId), source: 'rollout:token_usage_record:turn_token_usage', quality: 'exact' }
        : { source: 'rollout', quality: 'unavailable' },
    } : null,
    unavailable: ['request_duration', 'inference_duration', 'model_ttft', 'model_tbt', 'service_tier', 'critical_path'],
  };
}

async function main() {
  const args = process.argv.slice(2);
  if (!((args.length === 2 || (args.length === 3 && args[2] === '--measure')) && args[0] === '--file')) {
    console.error('Usage: node scripts/probe.mjs --file <absolute-rollout-jsonl-path> [--measure]');
    process.exitCode = 2;
    return;
  }
  const started = performance.now();
  const lines = createInterface({ input: createReadStream(args[1], { encoding: 'utf8' }), crlfDelay: Infinity });
  async function* parse() {
    for await (const line of lines) {
      try { yield JSON.parse(line); }
      catch { yield null; }
    }
  }
  console.log(JSON.stringify(await summarizeRollout(parse()), null, 2));
  if (args[2] === '--measure') {
    const resources = process.resourceUsage();
    console.error(JSON.stringify({
      elapsed_ms: Math.round(performance.now() - started),
      peak_rss_mib: Math.round(resources.maxRSS / 1024),
      user_cpu_ms: Math.round(resources.userCPUTime / 1000),
      system_cpu_ms: Math.round(resources.systemCPUTime / 1000),
    }));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    // File paths can identify a user. Never print the raw error message.
    console.error(`Probe failed: ${error.code ?? 'read_error'}`);
    process.exitCode = 1;
  });
}
