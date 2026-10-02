# Acceptance Test Plan — v1

Acceptance evidence must identify exact code head, Codex Desktop version, plugin build/version, test category, and sanitized result.

## P0 capability tests

- **AT-P0-01 Side panel:** install the local plugin on Windows Desktop and open the profiler beside a conversation using a supported entrypoint.
- **AT-P0-02 Turn identity:** observe a real turn and recover stable thread/turn identity plus start/end/duration or document the exact missing surface.
- **AT-P0-03 Usage:** capture native turn/thread token usage and reconcile with a visible/native Codex usage record.
- **AT-P0-04 Tool lifecycle:** observe one harmless tool command with start/end/status/duration source.
- **AT-P0-05 Timing:** determine exact availability of request/inference/TTFT/TBT data; unsupported fields must remain unavailable.
- **AT-P0-06 Read-only:** prove no Codex-owned file is modified by the profiler.
- **AT-P0-07 Architecture:** show whether the plugin alone suffices or why a companion process is required.

## Core/schema tests

- **AT-CORE-01 Provider neutrality:** run synthetic fixtures for at least two different agent/provider names through the same analyzer with no core code path keyed to Codex field names.
- **AT-CORE-02 Unknown fields:** additive adapter input does not break parsing.
- **AT-CORE-03 Missing fields:** missing metrics render unavailable rather than zero.
- **AT-CORE-04 Deterministic replay:** identical event streams yield identical summaries.

## Timeline tests

- **AT-TIME-01 Sequential:** model 10s + tool 5s + model 10s in a 25s turn yields 25s wall and 25s aggregate coverage.
- **AT-TIME-02 Parallel tools:** two overlapping 10s tools consume 10s wall coverage but 20s aggregate tool work.
- **AT-TIME-03 Model/tool overlap:** overlap appears in `concurrent`, not double-counted wall buckets.
- **AT-TIME-04 Unknown gap:** an unobserved 7s interval remains 7s unknown.
- **AT-TIME-05 Critical path:** no critical path is published when causality is insufficient.

## Model/throughput tests

- **AT-MODEL-01 Native timing:** exact native inference/TTFT/TBT maps without semantic renaming.
- **AT-MODEL-02 TPS fallback:** source priority is enforced and estimate is visibly marked.
- **AT-MODEL-03 Retry:** retry duration is separated when source events make it observable.

## Tool/subagent tests

- **AT-TOOL-01 Categories:** representative shell, patch/edit, MCP, and other tool events normalize correctly.
- **AT-TOOL-02 Failure:** failed/cancelled calls are retained and counted.
- **AT-AGENT-01 Parent/child:** subagent lineage is preserved.
- **AT-AGENT-02 Parallelism:** child aggregate work may exceed wall time without corrupting wall composition.

## Usage/cost tests

- **AT-USAGE-01 Reconciliation:** normalized token categories reconcile to native Codex-reported values for supported categories.
- **AT-USAGE-02 Cache semantics:** cache-hit ratio is omitted when source semantics do not support it.
- **AT-COST-01 Provider cost:** provider-reported cost is labeled reported.
- **AT-COST-02 API estimate:** usage × versioned pricing is labeled estimated API cost.
- **AT-COST-03 Subscription:** ChatGPT subscription activity can show API-equivalent estimate but never billed API cost.
- **AT-COST-04 Price history:** historical estimate retains its pricing version/effective date.

## Desktop product tests

- **AT-UI-01 Live:** panel updates while a turn runs without excessive render churn.
- **AT-UI-02 Turn:** completed summary remains viewable and matches analyzer output.
- **AT-UI-03 Thread:** cumulative values equal the sum/union semantics defined by the analyzer.
- **AT-UI-04 Graceful degradation:** source loss displays unavailable/diagnostic state; Codex turn continues.

## Privacy/security tests

- **AT-PRIV-01 Content scan:** project-owned telemetry/cache contains no prompt text, source-file contents, tool stdout/stderr, tokens/secrets, local usernames, or machine identifiers.
- **AT-PRIV-02 No egress:** telemetry requires no external network export.
- **AT-PRIV-03 No mutation:** profiler performs no writes to Codex-owned session files.

## Resource/reliability tests

- **AT-RES-01 Idle budget:** idle resource use meets `13-RESOURCE_BUDGETS.md`.
- **AT-RES-02 Active overhead:** profiler adds no material execution slowdown within the accepted measurement method.
- **AT-REL-01 Restart:** profiler/plugin restart does not corrupt Codex and can reconstruct the current/recent turn where source data permits.
- **AT-REL-02 Codex restart:** clean Codex Desktop restart leaves no orphaned control process or locked session file.

## v1 release gate

P5 passes when all mandatory tests applicable to supported upstream data are green on an exact release head, and genuinely unsupported metrics are documented as unavailable rather than replaced with misleading estimates.
