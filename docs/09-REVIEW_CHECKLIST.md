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

- No unjustified daemon/service/database/queue/network listener.
- No duplicate persistence when Codex artifacts can be replayed.
- Codex-specific logic remains inside adapter/integration surfaces.
- Provider-neutral core contains no hidden Codex field assumptions.
- Compatibility fallbacks are evidence-driven and bounded.
- Spike/obsolete code is deleted when no longer needed.

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

## Outcomes

`PROJECT_VERIFIED`, `PASS_WITH_CONDITIONS`, `REOPENED`, or `FAIL`.
