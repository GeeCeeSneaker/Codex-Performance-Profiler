# ADCP Migration Handoff

## Status

Owner decision on 2026-10-07:

> Stop independent development of Codex Performance Profiler. Migrate the useful telemetry/monitoring capability into ADCP so each resident Controller can monitor and account for tasks executed by Codex and future Agents, with cross-node/cross-Agent analytics handled by the central Management Plane.

This document preserves the exact migration source and the parts worth carrying forward. It does not make the unmerged P0 branch a released product.

## Exact source to preserve

Standalone main contains project contracts only.

The useful experimental implementation/evidence is:

- branch: `feat/wo-0001-capability-spike`
- exact head: `b81f174137cd886f16e90de117cb2bed75c29589`
- branch is 22 commits ahead of `main@1314278e0fe6c8670ae7183194da6623bb093855`
- evidence: `docs/evidence/WO-0001-P0-CAPABILITY-PROBE.md` on that branch

Do not delete or rewrite this branch until ADCP migration has independently reproduced the needed facts.

## Proven / valuable findings

### 1. Codex current-thread correlation

The probe demonstrated a supported path from Codex Desktop MCP metadata to the current thread ID, then verified the matching Codex rollout/session by native session header.

Reusable idea:

```text
host thread identity
-> verify exact native session
-> read provider-owned durable telemetry read-only
-> project only bounded non-content facts
```

Do not copy raw prompt/code/tool output into analytics storage.

### 2. Incremental rollout reading

`server/incremental-rollout.mjs` proved a bounded JSONL cursor with:

- incremental byte offset;
- source identity/change detection;
- bounded read size;
- bounded line size;
- partial-line handling;
- malformed/oversized-record accounting;
- no raw record persistence.

This is a useful implementation reference for the Codex Provider Adapter, but ADCP should reimplement/port only what still fits the Controller runtime and language boundary.

### 3. Provider-neutral metric semantics

The main-branch telemetry contract remains valuable:

- metric quality: `exact | derived | estimated | unavailable`;
- unavailable is never encoded as zero;
- wall-clock composition and aggregate work are distinct;
- concurrent work is not double-counted into wall time;
- no generic inferred "thinking time";
- critical-path claims require causal evidence;
- token categories remain provider-native when categories differ;
- cost semantics distinguish provider-reported, estimated API, API-equivalent, and unavailable.

These semantics should become the ADCP Agent Telemetry contract.

### 4. Codex facts demonstrated through rollout data

The P0 branch demonstrated useful native/derived facts including:

- thread/turn identity;
- turn start/end and wall duration;
- model/provider identity;
- exact native turn token usage categories where reported;
- completed tool-call timestamps/status/type;
- child-session lineage in historical rollout examples;
- plugin-side incremental active/completed turn projection.

It did **not** establish reliable model request/inference duration or model-level TTFT/TBT through the chosen rollout path. These must remain unavailable unless a future Codex adapter source proves them.

### 5. Resource evidence

The probe showed the absolute Codex MCP/plugin host process footprint can dominate the profiler's own incremental logic. Short samples found very low incremental CPU but memory attribution remained incomplete.

Migration implication:

- Controller telemetry code must not add a second profiler daemon;
- reuse the resident Controller and existing Provider Adapter;
- resource accounting must separate Controller overhead, Provider/Agent process tree, and host/plugin runtime;
- MCPRelay generic `process_usage` should supply host-level process/tree metrics where applicable.

## Target ownership in ADCP

### Resident Controller / Provider Adapter

Owns collection and exact local attribution while the execution is live:

- run/turn/session identity;
- Provider lifecycle timestamps/status;
- local process/tree CPU/RSS;
- tool/subagent spans where the Provider exposes them;
- token usage;
- retries/reconnects where directly observable;
- source/quality assignment;
- live bounded per-run aggregates;
- terminal telemetry summary.

Telemetry is observational evidence, not Controller workflow state. It must not create new Task/run lifecycle states.

### Central ADCP Management Plane

Owns fleet/history analytics:

- cross-node and cross-Agent history;
- task/provider/model comparisons;
- long-term token/cost/performance trends;
- pricing snapshots and cost estimation;
- Dashboard/API presentation;
- task-class performance summaries used by Reviewer/operator reasoning.

Do not make the Management Plane a second source of live Provider/run correctness truth.

### MCPRelay

Owns generic host capability and transport only:

- exact process/tree resource sampling;
- node routing and Controller communication;
- generic file/Git/SQLite tools where appropriate.

Do not add `codex_tokens`, `agent_cost`, or other provider/workflow telemetry semantics to MCPRelay core.

## Storage direction

Do not put high-volume telemetry rows into the existing ADCP RuntimeStore correctness tables.

Preferred split:

- Controller RuntimeStore continues to hold only restart-critical binding/run/runtime correctness facts;
- live telemetry stays in memory while feasible;
- Controller may emit bounded terminal summaries and/or append-only normalized telemetry only when a concrete persistence consumer requires it;
- Management Plane introduces durable historical telemetry storage when M5/global analytics requires cross-run/cross-node history.

The exact telemetry store schema/database is intentionally not frozen here.

## UI migration

The standalone Codex Desktop side-panel is **not** the target product anymore.

Its P0 UI proves that live telemetry can be useful, but the long-term surfaces are:

- Controller snapshot for local current-run facts;
- central Management Plane Dashboard/API for fleet and historical analytics;
- optional provider/client-local UI only if later evidence shows it materially improves the workflow.

Do not carry the standalone plugin/dashboard architecture forward by default.

## Migration acceptance

ADCP migration is complete only when:

1. provider-neutral telemetry semantics are accepted in ADCP;
2. Codex Provider Adapter reproduces the needed P0 facts from supported sources;
3. Controller can report bounded live/current-run telemetry without material task overhead;
4. resource attribution separates Controller from Agent/provider descendants;
5. central Management Plane can ingest bounded terminal/aggregate telemetry for historical comparison;
6. a second Provider (for example CodeBuddy) maps to the same normalized contract without Codex-specific fields leaking into the core;
7. standalone Profiler repository is no longer needed for active development.

## Explicit non-goals

Do not migrate:

- a separate always-on profiler daemon;
- a Codex-specific central schema;
- a generic event broker;
- OpenTelemetry backend infrastructure;
- raw prompt/code/tool-output analytics;
- a single opaque "Agent score";
- automatic provider selection before reliable comparative evidence exists.
