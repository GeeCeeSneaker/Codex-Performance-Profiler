# WO-0001 — Windows Desktop Capability and Telemetry Source Spike

Status: `IN_PROGRESS`

Phase: `P0`

Coordination Issue: #1 — `[WO-0001] P0 Windows Desktop capability and telemetry source spike`

## 1. Objective

Prove the real Codex Windows Desktop plugin/extension surface and exact telemetry sources required for the profiler before substantial product implementation.

## 2. Governing documents

- `00-PROJECT_CHARTER.md`
- `01-SYSTEM_REQUIREMENTS.md`
- `02-SYSTEM_ARCHITECTURE.md`
- `05-TELEMETRY_DATA_CONTRACT.md`
- `06-WINDOWS_DESKTOP_INTEGRATION.md`
- ADR-0001 through ADR-0004

## 3. Scope

### A. Minimal plugin/extension proof

Create the smallest package that Codex Windows Desktop can load. Prove a supported thread/conversation side-panel entrypoint or document the exact supported nearest alternative and upstream limitation.

### B. Data-source inventory

Using one or more harmless real turns, determine access and semantics for:
- thread/turn IDs and lifecycle;
- turn duration;
- model/provider/service tier;
- token usage updates;
- tool start/end/status;
- subagent lifecycle;
- request/inference timing;
- TTFT/TBT;
- retry/reconnect events;
- rollout/session file discovery and stable record IDs/timestamps.

Classify each source/fact as `SUPPORTED`, `AVAILABLE_INDIRECTLY`, or `UNAVAILABLE`, and every metric as exact/derived/estimated/unavailable.

### C. Minimum architecture decision

Determine whether the plugin runtime alone can provide the v1 data path. Add a local companion to the proposed architecture only if a required fact cannot be obtained reliably otherwise. If needed, document the narrow responsibility and IPC/lifecycle choice.

### D. Baseline measurements

Record plugin/collector idle resource use and active event/update behavior sufficiently to validate the v1 resource-budget direction.

## 4. Required deliverables

- plugin/extension scaffold committed to a feature branch;
- capability matrix document/evidence;
- sanitized example mapping of one real turn into normalized candidate events;
- exact tested Codex Desktop/plugin versions;
- source/quality table for each requested metric;
- side-panel screenshot or sanitized equivalent evidence if repository policy permits; otherwise a detailed verified runtime record;
- resource baseline;
- architecture findings in DEVLOG and ADR only if accepted design changes.

## 5. Non-goals

Do not build:
- SQLite/database;
- full dashboard/history platform;
- multi-provider adapters;
- ADCP integration;
- unsupported native footer/DOM patch;
- background cloud export;
- permanent generalized daemon;
- elaborate pricing service.

## 6. Acceptance

Must satisfy AT-P0-01 through AT-P0-07. Additionally:
- profiler does not modify Codex-owned files;
- unavailable timing is not mislabeled as thinking/inference;
- evidence is sanitized for the public repository;
- any positive complexity delta has a demonstrated source-gap justification.

## 7. Escalation conditions

Escalate before implementing if the only path appears to require unsupported Desktop patching, elevated privilege, raw-content persistence, a broad network service, or another Level-B/C change from `03-DEVELOPMENT_MANAGEMENT.md`.

## 8. Completion handoff

Use the template in `08-WORK_ORDER_PROTOCOL.md`, including exact Windows/Codex versions, source matrix, resource evidence, and the recommended P1 architecture.
