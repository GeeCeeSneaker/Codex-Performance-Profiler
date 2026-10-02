# Codex Performance Profiler Agent Contract

This repository is the durable authority for project design, implementation, review, and work handoff.

## Authority order

1. Explicit human/Owner decision.
2. This `AGENTS.md` and `docs/00-PROJECT_CHARTER.md`.
3. Accepted ADRs and `docs/02-SYSTEM_ARCHITECTURE.md`.
4. `docs/01-SYSTEM_REQUIREMENTS.md` and `docs/05-TELEMETRY_DATA_CONTRACT.md`.
5. `docs/04-MASTER_IMPLEMENTATION_PLAN.md`.
6. Active Work Order and GitHub Issue/PR evidence.
7. Agent assumptions.

When authoritative sources conflict, stop only the affected action and surface the conflict. Do not guess.

## Minimum necessary

Always choose the smallest design and implementation that satisfies accepted requirements and observed evidence. Do not add a daemon, database, service, queue, broker, network listener, compatibility layer, fallback, recovery subsystem, persistent field, or workflow state merely because it may be useful later.

Future ADCP integration is a schema/interface requirement, not permission to build ADCP infrastructure inside v1.

## Roles

### Owner
Owns product direction, acceptable risk, credentials, material scope changes, and final architecture decisions that cross escalation boundaries.

### Project Manager / Independent Reviewer
Owns requirements, architecture boundaries, telemetry semantics, Work Order readiness, scheduling, independent review, milestone verification, and escalation.

**Permanent execution boundary:** unless the Owner explicitly authorizes a specific local action, the Reviewer must not operate the Owner's Windows PC, run local commands, install or update Codex/plugins, start/stop processes, edit local Codex state, or manufacture missing runtime evidence. The Reviewer may manage repository documents, Issues, PRs, and reviews within the authority granted for this project.

### Development Team / Implementation Agent
Owns implementation inside the frozen requirements, Master Plan, and active Work Order: task decomposition, branches/PRs, coding, tests, diagnostics, evidence, ordinary dependency choices, documentation, and defect correction. It may proceed through pre-authorized phases when exit criteria pass without waiting for a new Reviewer command for every engineering step.

## Metric integrity

Telemetry is useful only if its semantics are trustworthy.

- Every nontrivial metric must identify its source and quality: `exact`, `derived`, `estimated`, or `unavailable`.
- Never label `total time - tool time` as "thinking time".
- Do not present estimated cost as billed cost.
- Do not double-count parallel work as wall-clock composition.
- If causality is insufficient for a critical-path claim, report it as unavailable rather than inventing attribution.
- Raw prompt/code/tool-output capture is forbidden by default unless a future requirement explicitly authorizes it.

## Development delivery

Implementation code should use task branches and PRs. PRs reference the Work Order/Issue and exact acceptance evidence. Bootstrap/governance documents may be written directly when the Owner explicitly requests repository initialization or governance updates.

A development team's green tests are evidence, not independent project verification. Milestone/release acceptance requires an independent Reviewer decision against the exact candidate head.

## Handoff standard

Material handoff records include: objective, Work Order/phase, exact commit/PR, changed components, tests/CI, Windows Desktop evidence where relevant, telemetry reconciliation evidence, resource evidence, known issues, deviations, minimalism review, and recommended next action.

Do not leave critical state only in chat or terminal history.
