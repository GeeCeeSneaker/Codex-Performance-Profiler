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
