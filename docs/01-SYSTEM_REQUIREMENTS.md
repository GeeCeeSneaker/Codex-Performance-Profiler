# System Requirements — v1

Normative terms `MUST`, `SHOULD`, and `MAY` describe v1 requirements.

## 1. Platform and product requirements

- **REQ-PLAT-001**: v1 MUST support Codex Windows Desktop first.
- **REQ-PLAT-002**: the UI SHOULD use a supported conversation/thread side-panel or equivalent extension surface. Unsupported DOM/binary patching MUST NOT be required.
- **REQ-PLAT-003**: the core data model MUST NOT depend on Codex-specific field names.
- **REQ-PLAT-004**: Codex-specific extraction/normalization MUST live behind an adapter boundary.

## 2. Turn/time requirements

- **REQ-TIME-001**: each observed turn MUST have a stable local identity and, when available, native thread/turn identifiers.
- **REQ-TIME-002**: total wall time MUST come from native lifecycle timestamps/duration when available, otherwise from a clearly identified derived source.
- **REQ-TIME-003**: model, tool, child-agent, wait, retry, and orchestration activity MUST be represented as intervals/spans when timestamps are available.
- **REQ-TIME-004**: wall-clock composition MUST NOT double-count overlapping intervals.
- **REQ-TIME-005**: aggregate work duration MUST be reported separately from wall-clock duration.
- **REQ-TIME-006**: unknown/unattributed wall time MUST remain visible.
- **REQ-TIME-007**: "thinking time" MUST NOT be inferred from residual time. Provider-reported inference/reasoning duration may be shown only with its actual semantics.

## 3. Model-performance requirements

- **REQ-MODEL-001**: collect model/provider/service-tier identity where available.
- **REQ-MODEL-002**: collect request count and request/inference duration where available.
- **REQ-MODEL-003**: collect TTFT/TBT where a trustworthy source exposes them.
- **REQ-MODEL-004**: generation throughput MUST carry source/quality. Preferred order is native server TBT, observed streaming timing, then token-count/time estimate.
- **REQ-MODEL-005**: retries/reconnects and their duration SHOULD be separated from normal inference when evidence supports it.

## 4. Tool/subagent requirements

- **REQ-TOOL-001**: record tool invocation count, status, start/end/duration when available.
- **REQ-TOOL-002**: normalize at least `shell/exec`, `apply_patch/edit`, `mcp`, `web/search`, `computer_use`, and `other` categories.
- **REQ-TOOL-003**: failed/cancelled tool calls MUST remain distinguishable from successful calls.
- **REQ-TOOL-004**: repeated/duplicate-command analysis MAY be derived without persisting raw command text.
- **REQ-AGENT-001**: subagent/child-agent work MUST preserve parent/child relationships when available.
- **REQ-AGENT-002**: aggregate child-agent work and wall-clock concurrency MUST be reported separately.
- **REQ-AGENT-003**: critical-path claims MUST be omitted when causal evidence is insufficient.

## 5. Usage and cost requirements

- **REQ-USAGE-001**: represent input, cached-input, output, and reasoning tokens independently when the provider reports them.
- **REQ-USAGE-002**: never synthesize token categories that the source cannot distinguish without marking them estimated.
- **REQ-USAGE-003**: expose cache-hit ratio when meaningful.
- **REQ-COST-001**: cost records MUST distinguish `provider_reported`, `estimated_api`, `api_equivalent`, and `unavailable` semantics.
- **REQ-COST-002**: ChatGPT subscription usage MUST NOT be presented as if it were API-billed cost.
- **REQ-COST-003**: pricing-based estimates MUST retain model/provider/tier, pricing source/version/effective date, and estimate quality.
- **REQ-COST-004**: a provider-reported final cost, when authoritative, takes precedence over a local estimate.

## 6. UI requirements

- **REQ-UI-001**: provide a Live view for the current turn.
- **REQ-UI-002**: provide a completed Turn view with time, model, tools, usage, cost, and quality indicators.
- **REQ-UI-003**: provide a lightweight current-Thread/session cumulative view.
- **REQ-UI-004**: unavailable metrics MUST be omitted or labeled unavailable; the UI MUST NOT show fake zeroes.
- **REQ-UI-005**: estimated metrics/cost MUST be visibly distinguishable.
- **REQ-UI-006**: UI update frequency MUST be bounded to avoid measurable workload distortion.

## 7. Persistence and privacy requirements

- **REQ-DATA-001**: v1 MUST operate without a project-owned SQL database.
- **REQ-DATA-002**: the implementation SHOULD replay Codex-owned durable artifacts rather than duplicate them where practical.
- **REQ-DATA-003**: any project-owned persistence before ADCP integration MUST be minimal, append-only or cache-like, and justified by a missing native source.
- **REQ-PRIV-001**: prompts, source-code content, file contents, and tool stdout/stderr MUST NOT be persisted for analytics by default.
- **REQ-PRIV-002**: telemetry MUST stay local by default and MUST NOT require cloud export.
- **REQ-PRIV-003**: no administrator privilege or new public/network listener may be required for normal v1 operation without architecture escalation.

## 8. Reliability/compatibility requirements

- **REQ-REL-001**: parser/adapters MUST tolerate unknown future fields and fail closed on incompatible structural changes.
- **REQ-REL-002**: missing data MUST degrade metric availability, not break the Codex task.
- **REQ-REL-003**: profiler failure MUST NOT block or corrupt Codex execution.
- **REQ-REL-004**: Codex-owned files MUST be read-only from the profiler's perspective.
- **REQ-REL-005**: version/capability detection MUST make unsupported Codex surfaces diagnosable.

## 9. Extensibility requirements

- **REQ-EXT-001**: normalized event/schema versioning MUST be explicit.
- **REQ-EXT-002**: new Agent/Provider adapters MUST be addable without modifying Timeline/Usage/Cost analyzers for provider-specific names.
- **REQ-EXT-003**: storage MUST be abstracted behind a narrow interface so ADCP can later introduce SQLite without changing telemetry semantics.
- **REQ-EXT-004**: the future ADCP integration boundary MUST be event/schema based rather than importing Codex-specific parser state into the Controller.
