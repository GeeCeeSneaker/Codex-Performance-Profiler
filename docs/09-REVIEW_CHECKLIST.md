# Independent Review Checklist

A Reviewer binds conclusions to the exact candidate head and applicable Work Order/requirements.

## Functional

- Frozen Work Order objective is satisfied.
- Required Windows Desktop path is demonstrated when applicable.
- Missing upstream metrics are represented honestly.
- Failure/degradation does not break Codex execution.

## Telemetry semantics

- Wall duration source is correct.
- Overlapping spans do not double-count wall composition.
- Aggregate work is separate from wall time.
- No residual time is labeled thinking/reasoning without an exact source.
- TPS source and included-token semantics are explicit.
- Unknown/unavailable is not silently converted to zero.
- Token categories preserve source semantics.
- Cost semantics distinguish provider-reported, API estimate, API-equivalent, and unavailable.

## Architecture/minimalism

This section is mandatory at every substantive review, not only release qualification.

- Every material positive complexity delta has a current accepted requirement, invariant, or demonstrated failure that requires it.
- Existing Codex/Windows/plugin/MCP/runtime capabilities were preferred over project-owned machinery where sufficient.
- No unjustified daemon/service/database/queue/network listener/event bus/framework.
- No duplicate persistence when Codex artifacts can be replayed.
- No speculative provider, ADCP, dashboard, history, recovery, or compatibility machinery was introduced for hypothetical future use.
- Codex-specific logic remains inside adapter/integration surfaces without forcing unused generic abstractions into the core.
- Provider-neutral core contains no hidden Codex field assumptions, but provider-neutrality has not been used to justify implementing unused providers.
- Compatibility fallbacks are evidence-driven, bounded, and still necessary for a currently supported gap.
- Spike/obsolete code, superseded fallbacks, duplicate parsers, unused configuration, stale fields, dependencies, and tests are deleted when no longer needed.
- A defect fix is proportionate to the demonstrated failure and does not create a broader subsystem without evidence.
- The candidate was actively challenged for what can be removed or collapsed before approval.

Unnecessary complexity is a blocking finding even when tests are green. Earlier justification does not permanently grandfather complexity whose need has disappeared.

## Privacy/security

- No prompt/code/tool-output persistence by default.
- No secrets or local identifying telemetry in the public repository/evidence.
- Codex-owned files remain read-only.
- No elevation or unsupported client patching.
- No telemetry network egress by default.

## Quality/evidence

- Tests cover positive, negative, overlap, missing-data, and failure paths.
- Real runtime claims include exact tested Codex/plugin versions.
- Resource budget evidence exists for integration/release milestones.
- PR/head identity matches reviewed result.
- Minimalism evidence is recorded in the normal PR/Work Order handoff; no separate score or process artifact is required.

## Outcomes

`PROJECT_VERIFIED`, `PASS_WITH_CONDITIONS`, `REOPENED`, or `FAIL`.
