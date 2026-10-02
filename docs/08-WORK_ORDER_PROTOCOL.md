# Work Order Protocol

## 1. Purpose

Work Orders are durable milestone-size execution contracts and handoff/checklist artifacts. They are not mandatory Reviewer approval gates between every small development step.

`04-MASTER_IMPLEMENTATION_PLAN.md` pre-authorizes the v1 program. The development team may create finer GitHub Issues/PRs without waiting for a new Work Order if work remains inside the frozen phase/architecture.

## 2. Canonical form

Use `docs/work_orders/WO-XXXX-<name>.md` for milestone-size packages, architecture-sensitive work, or cross-agent handoff. Routine bugs/refactors may use Issues/PRs only.

Each Work Order should have one coordination Issue when execution begins.

## 3. Required fields

- status;
- objective;
- governing requirements/ADRs;
- scope;
- non-goals;
- dependencies;
- required behavior/deliverables;
- acceptance/evidence;
- resource/privacy requirements where relevant;
- escalation conditions;
- completion handoff.

## 4. Team autonomy

Inside a pre-authorized Work Order, the team may decompose, reorder/parallelize, choose implementation details, fix defects, substitute equivalent same-responsibility dependencies, create ordinary PRs, mark `DEV_ACCEPTED`, and continue into dependent pre-authorized work after exit evidence passes.

## 5. Escalation

Use `03-DEVELOPMENT_MANAGEMENT.md` Authority Levels. Do not hide architecture growth inside a routine implementation PR.

## 6. Review

Reviewer inspects exact repository/PR/CI/evidence and does not operate the developer's Windows machine to compensate for missing evidence.

Review outcomes: `PROJECT_VERIFIED / PASS_WITH_CONDITIONS / REOPENED / FAIL`.

## 7. Completion handoff template

```text
Development Status: DEV_ACCEPTED | BLOCKED
Independent Review: PENDING | PROJECT_VERIFIED | REOPENED | FAIL
Phase/WO:
Coordination Issue:
PR(s):
Exact Head SHA:
Codex Desktop Version:
Plugin Build/Version:
Data Sources Proven:
Acceptance Tests:
CI:
Windows Runtime Evidence:
Telemetry Reconciliation:
Resource Evidence:
Privacy Check:
Minimalism Review:
Known Issues:
Architecture Deviations: NONE | ...
Next Actions:
```
