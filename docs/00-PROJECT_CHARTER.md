# Project Charter

## 1. Mission

Build a local-first profiler that explains **where an AI agent task's wall-clock time, token usage, and cost go**, beginning with Codex Windows Desktop and later serving as a reusable telemetry/analysis foundation for ADCP and multiple agents/providers.

The immediate product is not a generic observability platform. It is a practical workflow-optimization instrument for Codex Desktop.

## 2. Owner priorities

In order:

1. Accurate decomposition of Codex task execution time.
2. Useful live/completed-turn visibility inside Codex Windows Desktop.
3. Token usage and clearly qualified cost estimation.
4. Low overhead and local privacy.
5. Minimum architecture and operational burden.
6. Provider-neutral contracts that avoid redesign during later ADCP integration.
7. Historical/session analysis only to the extent needed to improve workflow decisions.

## 3. v1 scope

### In scope

- Codex Windows Desktop as the first supported client.
- Conversation-side performance panel when the supported Codex extension surface permits it.
- Turn wall time and normalized execution timeline.
- Model/API/inference timing available from trustworthy sources.
- TTFT/TBT/generation throughput where measurable.
- Tool category/call/duration/failure statistics.
- Retry/wait/concurrency/unattributed-time analysis.
- Input, cached-input, output, and reasoning token usage where reported.
- Cache-hit ratio.
- Provider-reported cost when available; otherwise explicit estimates/API-equivalent estimates.
- Subagent/parallel-work accounting.
- Current-thread cumulative summary.
- Provider-neutral normalized telemetry and adapter interfaces.
- Replay of existing Codex durable artifacts when practical.

### Explicitly out of scope for initial Codex Desktop v1

- Persistent SQL database.
- Cloud telemetry backend or SaaS dashboard.
- Cross-machine fleet monitoring.
- ADCP runtime integration itself.
- Automatic agent/provider selection.
- Automatic workflow optimization/control decisions.
- DOM injection, binary patching, or unsupported modification of Codex Desktop.
- Capturing prompts, source code, or tool outputs for analytics.
- General OpenTelemetry backend deployment.
- A custom always-on daemon unless the P0 compatibility spike proves it is necessary.

## 4. Success criteria

v1 succeeds when an independently reviewed Windows Desktop build can, for real Codex turns:

1. identify thread/turn boundaries and wall time;
2. render live and completed-turn telemetry in a supported side-panel surface;
3. account for tool execution and model timing without known double counting;
4. show token usage that reconciles with Codex's reported usage within documented semantics;
5. show throughput with provenance/quality;
6. show cost only with the correct billing/estimate semantics;
7. handle parallel/subagent work without claiming aggregate duration equals wall time;
8. degrade to `unavailable` or `unknown` when data is missing rather than fabricate precision;
9. operate without storing prompt/code/tool-output content by default;
10. remain within resource budgets and not materially slow Codex;
11. expose a stable provider-neutral event/schema boundary suitable for later ADCP ingestion.

## 5. Delivery strategy

Use vertical slices. First prove the actual Codex Windows Desktop plugin/extension surface and reliable data sources. Only then build the normalized core and live product path. Avoid implementing speculative infrastructure before those assumptions are proven.

A failed capability spike is useful evidence and may change the integration method; it must not be hidden by silently adding unsupported UI patching or a large sidecar architecture.

## 6. Lifecycle-wide minimum-necessary invariant

Minimum necessary is a permanent project invariant, not a late-stage cleanup exercise. It applies continuously to requirements, architecture, data contracts, implementation, tests, compatibility work, defect repair, packaging, operations, release qualification, and later ADCP integration.

At every decision point, prefer the smallest sufficient change that satisfies an accepted requirement with trustworthy evidence. Reuse Codex/platform capabilities before introducing project-owned machinery, and remove obsolete spike code, fallbacks, abstractions, dependencies, fields, services, persistence, or compatibility paths as soon as their justification disappears. Every material positive complexity delta must trace to a frozen requirement, accepted invariant, or demonstrated failure that a simpler design cannot cover. Future extensibility by itself is not sufficient justification for present complexity.

The rule also applies to project governance: do not create extra states, documents, approval gates, or process machinery merely to demonstrate compliance with minimalism.

## 7. Governance

Repository documents, ADRs, Work Orders, Issues, PRs, exact-head review decisions, and sanitized evidence are the durable project record. Material scope or architecture changes require documented change control.
