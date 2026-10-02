# Development Management Handbook

## 1. Governance model

The project uses **bounded team autonomy**. The v1 requirements, architecture boundaries, telemetry semantics, implementation phases, and acceptance criteria are sufficiently defined for a competent development team to execute without per-step Reviewer approval.

Repository state is authoritative over transient chat/terminal context.

## 2. Roles

### Owner
Owns product direction, material architecture/scope changes, risk/credential decisions, and final escalations.

### Project Manager / Independent Reviewer
Owns requirements, architecture/data-contract boundaries, Work Order readiness, priorities, independent review, and milestone verification.

Without explicit Owner authorization for a specific action, Reviewer must not operate the local Windows machine, install/update Codex or plugins, run local commands, manipulate processes, or create missing runtime evidence personally.

### Development Team
Within the Master Plan the team owns implementation execution, branches/Issues/PRs, tests, diagnostics, same-responsibility dependency choice, documentation, evidence, refactoring, defect repair, and progression to dependent pre-authorized phases when exit criteria pass.

## 3. Authority levels

### A — autonomous engineering

No additional approval required:
- implementation/refactor/tests/docs;
- branch/Issue/PR decomposition;
- internal API/file-layout choices;
- ordinary dependency/version choices with compatibility tests;
- deleting unnecessary code/layers;
- implementation-language choice inside accepted module boundaries;
- same-responsibility substitutions that do not expand architecture;
- proceeding to the next pre-authorized phase after evidence is recorded.

### B — architecture escalation

Pause the affected decision and request review before:
- adding a persistent SQL/NoSQL database before the ADCP integration phase;
- adding a permanent network service/listener;
- adding a generalized telemetry backend, queue, broker, scheduler, or cloud service;
- unsupported Codex Desktop binary/DOM patching;
- changing the provider-neutral schema in a backward-incompatible way after it is accepted;
- storing prompt/code/tool-output content;
- adding workflow control/scheduling authority to the profiler;
- materially increasing install/runtime burden to solve one compatibility issue.

### C — Owner authorization

Required before:
- destructive/irreversible local-data action;
- admin/elevation or security-control weakening;
- new paid third-party service;
- use/change of Owner credentials outside an already authorized workflow;
- material product-scope change;
- external upload of telemetry that is local-only by accepted design.

## 4. Progress states

For phases/Work Orders:

`PLANNED / IN_PROGRESS / DEV_ACCEPTED / BLOCKED / PROJECT_REVIEW / PROJECT_VERIFIED / REOPENED`.

`DEV_ACCEPTED` means the implementation team believes acceptance passes. It is not independent verification.

## 5. Review cadence

Independent review is expected at:
- completion of P0 capability/data-source spike;
- first real Windows Desktop live vertical slice;
- timing/usage/cost semantic freeze;
- packaged v1 release candidate;
- any Level-B/C escalation.

Non-blocking work may continue while review is pending if it does not depend on a disputed foundation.

## 6. PR and merge discipline

- Implementation PRs reference phase/Work Order and acceptance evidence.
- Exact versions and data-source capability findings belong in repository evidence/PR discussion.
- Do not merge known privacy leakage, metric-semantic corruption, unsupported UI patching, or architecture escalation without resolution.
- Green tests are necessary evidence, not independent project verification.
- Final v1 qualification binds to an exact release head.

## 7. Handoff standard

Material handoff includes objective, phase/WO, exact PR/head, changed modules, tests/CI, Windows evidence, telemetry reconciliation, resource evidence, known issues, architecture deviations, minimalism review, and next action.

## 8. Minimum-necessary review

At each integration point ask:
- What permanent process, dependency, persistence, service, field, fallback, or abstraction was added?
- Which frozen requirement or demonstrated failure requires it?
- Could Codex's existing data/source own this responsibility?
- Can any earlier workaround now be deleted?
- Are we duplicating OpenTelemetry/rollout/plugin capabilities already available upstream?
- Are we storing data that can be replayed instead?
- Did future ADCP extensibility become speculative ADCP implementation?

Unnecessary complexity is a blocking finding even if functionality works.

## 9. Metric-integrity review

Every milestone review separately checks:
- source/quality attached to derived metrics;
- no residual-time-as-thinking claim;
- no aggregate/wall double counting;
- estimates visually distinguished from provider-reported facts;
- missing fields produce unavailable/unknown rather than zero;
- token categories preserve provider semantics;
- pricing version/source retained for estimates.

## 10. Public repository hygiene

Do not commit secrets, account IDs/emails, local usernames, machine names, profile paths, private repository paths, rollout content, prompts, code, raw tool outputs, or other identifying local telemetry. Evidence uses synthetic fixtures or sanitized summaries.

## 11. Definition of Done

v1 is complete only when P5 acceptance passes on an exact release head, real Windows Desktop proof exists, resource/privacy/minimalism reviews pass, and an independent Reviewer records `PROJECT_VERIFIED` or an explicit conditional approval.
