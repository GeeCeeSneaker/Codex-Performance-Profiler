# Master Implementation Plan — Codex Desktop v1

## 1. Execution authority

This v1 program is pre-authorized for development. The development team may move between phases when documented exit criteria pass and no escalation trigger in `03-DEVELOPMENT_MANAGEMENT.md` is crossed. The team may decompose/reorder/parallelize ordinary work, fix defects, refactor, remove unnecessary code, choose exact implementation details, and merge ordinary pre-authorized changes according to repository discipline.

## 2. Phase sequence

```text
P0 Capability + data-source spike
          |
P1 Normalized core + offline replay
          |
P2 Windows Desktop live vertical slice
          |
P3 Timing/usage/cost + concurrency correctness
          |
P4 Reliability + packaging + privacy hardening
          |
P5 v1 release qualification

Post-v1: ADCP integration + persistent multi-agent history
```

## P0 — Windows Desktop capability and data-source spike

### Objective
Prove the highest-risk assumptions before substantial code: supported side-panel integration and exact telemetry sources available to a local plugin on current Codex Windows Desktop.

### Required work
1. Build the smallest installable local plugin/extension scaffold.
2. Prove a thread/conversation side panel or nearest supported equivalent can open in Windows Desktop.
3. Run one real harmless Codex turn and inventory which facts are available through supported surfaces: thread/turn lifecycle, token usage, tool events, subagents, model/provider/tier, native runtime timing, TTFT/TBT, retry/reconnect.
4. Inspect rollout/session artifacts only read-only and map stable IDs/timestamps.
5. Determine whether a separate local companion is actually required.
6. Record exact Codex/app/plugin versions and sanitized capability evidence.
7. Measure baseline profiler overhead.

### Non-goals
No database, dashboard platform, long-term history, cloud export, unsupported Desktop patching, or full analyzer.

### Exit
- supported side-panel path proven or a precise upstream limitation documented;
- data-source capability matrix recorded;
- at least one real turn mapped to native IDs and timestamps;
- token source proven;
- tool source proven;
- inference/TTFT/TBT source classified as exact/derived/unavailable;
- minimum runtime architecture chosen from evidence;
- no unjustified permanent process added.

## P1 — Normalized telemetry core + offline replay

### Objective
Implement the provider-neutral data contract and deterministic analysis against synthetic fixtures and sanitized/replayable Codex data.

### Required work
- schema/types for Run, Turn, ExecutionSpan, UsageRecord, CostRecord, MetricValue;
- Codex adapter normalization for proven P0 sources;
- event correlation by stable IDs;
- interval-union/concurrency engine;
- token normalization;
- pricing/cost semantic model with a test pricing fixture;
- in-memory store + replay interface;
- synthetic parallel/subagent/retry test corpus;
- no UI dependency in the core analyzer.

### Exit
Core tests prove no wall-time double counting, correct unknown handling, deterministic replay, and provider-neutral fixtures independent of Codex names.

## P2 — Windows Desktop live vertical slice

### Objective
Deliver useful real-time product value for one active Codex conversation.

### Required work
- connect proven Windows data source(s) to normalized events;
- Live panel with elapsed/current activity and bounded refresh;
- completed Turn view;
- lightweight Thread/session cumulative view;
- tool category/status/timing;
- token usage and quality labels;
- graceful profiler disconnect/restart behavior;
- no Codex task interruption on profiler failure.

### Exit
A real Windows Desktop task can be observed end-to-end and the panel remains accurate across at least three representative turns, including one tool call and one failure/cancellation scenario.

## P3 — Timing, usage, cost, and concurrency correctness

### Objective
Turn useful telemetry into trustworthy workflow-analysis data.

### Required work
- native inference/API/TTFT/TBT mapping where supported;
- throughput source fallback chain;
- retry/reconnect classification;
- subagent parent/child correlation;
- wall vs aggregate work separation;
- concurrency/parallelism metrics;
- usage reconciliation against Codex-reported usage;
- subscription vs API/API-equivalent cost semantics;
- versioned pricing snapshot mechanism without background cloud dependency;
- workflow-efficiency indicators defined in `05-TELEMETRY_DATA_CONTRACT.md`.

### Exit
Acceptance fixtures and real-turn samples demonstrate semantic correctness, including overlapping agents/tools, missing metrics, and estimated-cost labeling.

## P4 — Reliability, packaging, and privacy hardening

### Objective
Make the plugin repeatable for normal Windows use.

### Required work
- deterministic install/update/uninstall/reload instructions;
- capability/version diagnostics;
- bounded file watching/event buffering if used;
- no console-window flash from background helpers;
- crash/restart and Codex update compatibility tests;
- privacy scan proving no raw prompt/code/tool output is persisted;
- resource-budget measurements;
- remove spike-only code and redundant fallbacks;
- user/operator documentation.

### Exit
Fresh Windows validation can install, run representative tasks, restart Codex/profiler, and remove the plugin without residue outside documented locations.

## P5 — v1 release qualification

### Required work
- full acceptance matrix;
- exact-head Windows evidence;
- synthetic and real-turn reconciliation;
- privacy/security review;
- resource-budget review;
- dependency/version inventory;
- minimalism deletion pass;
- independent Reviewer exact-head decision.

### Final v1 acceptance
All Charter success criteria pass or any unavailable upstream metric is explicitly documented without false substitute semantics.

## 3. Post-v1 — ADCP integration

After v1 proves the schema and analyzers, ADCP may ingest the same normalized telemetry from multiple adapters. Only then evaluate SQLite as the local durable store for cross-agent/project history. Do not pre-build this phase into Codex Desktop v1.
