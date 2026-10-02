# System Architecture — v1

## 1. Architecture goal

Build a thin Codex Desktop adapter around a provider-neutral telemetry core. The first implementation may be Codex-specific at the source boundary, but the normalized contracts and analyzers are not.

```text
Codex Windows Desktop
        |
        +-- supported app/extension events (if accessible)
        +-- app-server protocol data (if accessible)
        +-- rollout/session artifacts
        +-- runtime timing/usage data
        +-- bounded lifecycle hook (fallback only)
        |
   Codex Adapter
        |
   Event Correlator
        |
Normalized Telemetry Events
        |
 +------+-------------+--------------+
 |                    |              |
Timeline Engine    Usage Engine    Cost Engine
 |                    |              |
 +--------------------+--------------+
                      |
                  Analyzer
                      |
             InMemory/Replay Store
                      |
              Desktop Side Panel
```

P0 must prove which Codex data surfaces are actually available to a local plugin on Windows. Architecture diagrams name candidate sources, not permission to assume they are accessible.

## 2. Core modules

### M1 — Codex Adapter

Responsibilities:
- discover current Codex version/capabilities;
- ingest only supported/read-only sources;
- translate Codex thread/turn/tool/model/subagent/usage facts into normalized events;
- attach source and quality;
- tolerate additive upstream fields.

Candidate sub-sources are `CodexAppServerSource`, `CodexRolloutSource`, `CodexRuntimeMetricsSource`, and a minimal hook source only where required. P0 may collapse or remove sources when evidence shows they are unnecessary.

### M2 — Event Correlator

Correlates events by native IDs where possible (`thread_id`, `turn_id`, response/tool/agent IDs) and otherwise by bounded temporal/parent evidence. It must never merge ambiguous events silently.

### M3 — Telemetry Core

Defines provider-neutral `Run`, `Turn`, `ExecutionSpan`, `UsageRecord`, `CostRecord`, and metric provenance/quality. This is the future ADCP-facing contract.

### M4 — Timeline Engine

Computes:
- turn wall time;
- interval unions;
- exclusive single-activity wall segments;
- concurrent wall segments;
- aggregate model/tool/agent work;
- wait/retry/unknown coverage;
- parallelism factor where meaningful;
- critical path only when parent/causal information is sufficient.

It must not force aggregate durations to sum to wall time.

### M5 — Usage Engine

Normalizes token categories and current-thread cumulative usage. Provider-specific usage fields are mapped by adapters.

### M6 — Cost Engine

Accepts normalized usage and a versioned pricing record or provider-reported cost. It does not own billing. Output always includes cost semantics and quality.

### M7 — Analyzer

Produces compact turn/session views and workflow-efficiency indicators such as model share, tool share, unknown share, retry ratio, failed-tool ratio, cache-hit ratio, throughput, and parallelism.

### M8 — Telemetry Store

Narrow interface:

```text
append(event)
current_turn()
get_turn(id)
get_thread(id)
replay(source)
```

v1 implementation is in-memory plus replay from Codex-owned durable artifacts. A SQL query API is intentionally absent.

### M9 — Desktop UI

Supported plugin/MCP App/Extension side-panel surface. Three views:
- Live turn;
- completed Turn;
- current Thread/session.

UI is a read model and has no workflow authority over Codex.

## 3. Local companion process decision

Do not assume a daemon is required. P0 tests whether the plugin/extension runtime can access the required local sources directly.

A local companion is permitted only if at least one required source cannot be accessed reliably otherwise. If needed it should be the smallest process that provides the missing read-only telemetry capability, preferably a single self-contained Windows binary with no inbound network listener and no console-window flash. It must not become a general control plane.

## 4. Technology boundary

The **contract** is language-neutral JSON/schema. Implementation language is secondary. P0/P1 may choose the smallest practical implementation after validating Codex's current extension/runtime constraints. Future ADCP code may consume the schema without sharing the same language runtime.

## 5. Failure model

Profiler failures are fail-open with respect to Codex execution: telemetry may become unavailable, but the profiler must not interrupt, modify, or block the agent task. Data-integrity failures are fail-closed with respect to the metric: show `unknown/unavailable`, not a fabricated value.

## 6. No hidden second control plane

The profiler observes execution. It must not grow task scheduling, provider selection, Agent lifecycle authority, approval policy, or deployment orchestration. Those belong to Codex or future ADCP layers.
