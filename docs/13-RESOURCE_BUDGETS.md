# Resource Budgets — v1

These are engineering budgets/targets for a profiler whose purpose is measurement. P0 records a baseline and may propose evidence-based adjustment before P2.

## 1. Collector/runtime

If no companion process is needed, this section applies to plugin-local telemetry work. If a companion is required:
- idle average CPU target: <= 0.2% of one logical CPU after steady state;
- idle resident memory target: <= 40 MiB;
- no busy polling of rollout/session files;
- no inbound/public network listener;
- no visible console window during normal operation.

## 2. Active profiling overhead

- event processing must be asynchronous/non-blocking relative to Codex where host APIs allow;
- side-panel refresh normally <= 2 Hz;
- synthetic/replay processing should not be on the critical path of agent execution;
- target measured wall-time overhead for representative turns: <= 1% or statistically indistinguishable within test noise; methodology must be recorded.

## 3. Disk/persistence

Initial v1 has no SQL database. Project-owned persistent telemetry/cache target is effectively zero unless P0 proves a native-source gap. Any approved cache/log must be bounded and exclude raw prompt/code/tool output.

## 4. UI

UI rendering should not continuously reprocess full session history. Maintain incremental current-turn state and compute heavy historical summaries on demand or from cached normalized aggregates.

## 5. Review

A budget miss is not automatically a release failure if measurement shows the target was unrealistic, but any relaxation requires exact evidence and a minimum-necessary review rather than silent acceptance.
