# Development Log

Durable chronological record of material project decisions, integration findings, and milestone outcomes. Routine commit history does not need duplication here.

## 2026-10-02 — Project bootstrap

- Repository initialized for Codex Performance Profiler.
- Product target fixed to Codex Windows Desktop first.
- Long-term architecture fixed around a provider-neutral Agent Telemetry Core with Codex as the first adapter.
- v1 explicitly avoids a project-owned SQL database; persistent multi-agent history is deferred to ADCP integration.
- Side-panel presentation selected over unsupported native Desktop footer modification.
- Telemetry correctness rules established: source/quality on metrics, no residual-time-as-thinking, wall vs aggregate separation, cost semantics explicitly qualified.
- P0/WO-0001 prepared to validate actual Windows Desktop extension/data-source capabilities before substantial implementation.

## 2026-10-02 — P0 partial capability probe

- Installed a minimal local diagnostic plugin package (`0.1.0`) through the Codex CLI marketplace flow.
- Built a streaming, read-only rollout probe that allowlists telemetry fields and maps one completed Desktop turn into sanitized candidate events. It distinguishes native turn time to first token from unavailable model TTFT.
- Recorded partial source/resource/privacy evidence in `evidence/WO-0001-P0-CAPABILITY-PROBE.md`.
- Kept P0 open: a supported Codex Desktop conversation-side panel and current-thread live data path are not yet demonstrated. No companion process or architecture change was added.
