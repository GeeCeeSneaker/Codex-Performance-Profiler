# Roadmap

## v1 — Codex Windows Desktop

- P0: capability/data-source spike.
- P1: provider-neutral core and deterministic replay.
- P2: live Windows Desktop side-panel vertical slice.
- P3: trustworthy timing, usage, cost, concurrency/subagent analytics.
- P4: reliability, packaging, privacy, resource hardening.
- P5: release qualification.

## v1.x — Evidence-driven refinements

Only after v1 usage demonstrates need:
- richer per-tool semantic classification;
- limited local history views without a general database;
- export of normalized telemetry for analysis;
- better critical-path reconstruction when upstream causality permits;
- native completion/footer decoration if Codex exposes a supported extension point.

## v2 — ADCP integration

- ingest normalized telemetry from ADCP-managed agents;
- add adapters for additional agent/provider combinations;
- introduce a lightweight durable local store (SQLite candidate) for cross-agent/project history;
- compare efficiency by task class without conflating quality, latency, usage, and price;
- expose telemetry to ADCP dashboards/read models.

## Later, only if demonstrated

- automatic workflow recommendations;
- provider/agent routing optimization;
- fleet/multi-host telemetry;
- cloud aggregation;
- cost budgets/alerts.

These are not v1 commitments.
