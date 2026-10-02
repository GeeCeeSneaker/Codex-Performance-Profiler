# Telemetry Data Contract — v1

## 1. Purpose

Define provider-neutral semantics before implementation so Codex-specific data cannot leak into the analysis core.

## 2. Metric provenance and quality

Every metric that is not self-evident raw identity carries:

```text
value
unit
source
quality: exact | derived | estimated | unavailable
notes? / source_version?
```

Definitions:
- `exact`: directly reported by the authoritative execution/provider source with matching semantics;
- `derived`: deterministically computed from exact events without heuristic assumptions;
- `estimated`: requires an approximation/heuristic/pricing model;
- `unavailable`: source cannot support the metric reliably.

Never use `0` to mean unavailable.

## 3. Core entities

### Run
Logical top-level execution container. In v1 a Codex thread/session may map to a Run or provide its external reference. Future ADCP can supply its own `run_id`.

Required normalized fields: `schema_version`, `run_id`, `agent_type`, `provider`, `started_at`, optional `ended_at`, external references, and capabilities.

### Turn
One user-to-agent execution unit:

```text
turn_id
run_id
external_thread_id?
external_turn_id?
started_at
ended_at?
wall_duration_ms?
model?
provider?
service_tier?
status
```

### ExecutionSpan

```text
span_id
turn_id
parent_span_id?
kind: model | tool | agent | wait | retry | orchestration | other
subkind?
start_at
end_at?
duration_ms?
status: running | success | error | cancelled | unknown
source
quality
attributes{}
```

`attributes` may contain bounded non-content metadata such as tool category, exit status, model name, or native event ID. It must not become an unbounded dump of prompt/code/tool output.

### UsageRecord

```text
input_tokens?
cached_input_tokens?
cache_write_tokens?
output_tokens?
reasoning_tokens?
other_tokens?
source
quality
```

Absent provider categories remain absent.

### CostRecord

```text
amount?
currency
semantics: provider_reported | estimated_api | api_equivalent | unavailable
provider
model
service_tier?
pricing_source?
pricing_version?
pricing_effective_at?
quality
```

## 4. Wall-clock accounting

Two different products are required.

### 4.1 Wall-clock composition

Partition the turn interval using an interval sweep over known spans. For each minimal time segment:
- no known activity -> `unknown` or a supported wait category;
- exactly one active major category -> that category's exclusive wall bucket;
- multiple active major categories -> `concurrent` unless causal evidence identifies a single blocking/critical owner.

The exclusive buckets plus `concurrent + unknown` MUST equal observed turn wall time within timestamp rounding tolerance.

Do not arbitrarily assign concurrent time to model or tools merely to make a chart sum to 100%.

### 4.2 Aggregate work

Sum model/tool/agent span durations independently. These may exceed wall time. Report concurrency/parallelism separately.

```text
parallelism_factor = aggregate_active_work_ms / covered_wall_ms
```

Only publish when the numerator/denominator semantics are meaningful.

### 4.3 Critical path

Critical path requires parent/causal/wait relationships sufficient to establish blocking order. Otherwise it is `unavailable`; timestamp overlap alone is not causality.

## 5. Model timing

Preferred fields:
- request duration;
- provider/service inference duration;
- TTFT;
- TBT;
- generation/streaming interval;
- retry/reconnect duration.

There is no generic `thinking_time` field in v1. Provider-reported reasoning/inference duration may be mapped to an explicitly named semantic field.

## 6. Throughput

Priority:
1. provider/server native TBT -> derive `1000 / tbt_ms` (`derived` from exact TBT);
2. observed streaming token timing (`derived` if token events are exact);
3. output-token count divided by a clearly defined generation window (`estimated`).

TPS MUST state whether output includes reasoning tokens. Do not mix visible-output TPS and total-generation TPS without distinct names.

## 7. Tool normalization

Base categories:
- `shell_exec`;
- `edit_patch`;
- `mcp`;
- `web_search`;
- `computer_use`;
- `file_io` when distinct;
- `other`.

Optional semantic command classes such as `test`, `build`, `lint`, `git`, `read`, `search`, `install`, `script` may be derived from bounded metadata. Raw command persistence is not required.

Per category retain calls, success/error/cancel count, aggregate duration, wall coverage where computable, max duration, and optional percentile statistics for sufficiently large samples.

## 8. Usage semantics

Keep provider categories separate. Cache-hit ratio may be computed as:

```text
cached_input_tokens / input_tokens
```

only when the provider defines cached input as a subset of input under compatible semantics. Adapter documentation must state the mapping.

## 9. Cost semantics

Precedence:
1. authoritative provider-reported cost;
2. provider-reported normalized usage × versioned pricing table (`estimated_api`);
3. subscription usage × comparable public API pricing (`api_equivalent`), explicitly not billed cost;
4. unavailable.

Historical estimates retain the pricing snapshot that produced them.

## 10. Efficiency indicators

Initial normalized indicators:
- wall duration;
- model/tool/wait/concurrent/unknown wall shares where computable;
- aggregate model/tool/agent work;
- retry ratio;
- failed-tool ratio;
- cache-hit ratio;
- generation TPS;
- token totals;
- estimated/API-equivalent cost per turn;
- subagent count;
- parallelism factor;
- critical-path duration when supported.

Indicators are descriptive evidence. They do not automatically choose an agent/provider in v1.
