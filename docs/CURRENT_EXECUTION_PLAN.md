# Current Execution Plan

## Active phase

**P0 — Windows Desktop capability and data-source spike**

## Active Work Order

`WO-0001-WINDOWS-DESKTOP-CAPABILITY-SPIKE`

Status: `IN_PROGRESS`

Coordination Issue: #1 — `[WO-0001] P0 Windows Desktop capability and telemetry source spike`

## Objective

Prove the supported Codex Windows Desktop integration surface and exact telemetry sources before substantial implementation.

## Required outputs

- minimal installable plugin/extension scaffold;
- real Windows Desktop side-panel proof or precise upstream limitation;
- Codex version/capability matrix;
- one real turn mapped across available lifecycle/usage/tool/timing sources;
- sanitized evidence;
- decision whether a local companion is necessary;
- initial resource baseline;
- P0 findings recorded in DEVLOG/ADR if they change architecture.

## Dispatch rule

Development may begin from WO-0001 immediately. The team may decompose the Work Order into Issues/PRs, but P0 exit requires one coherent evidence package and independent review.

## Hard constraints

No database, cloud telemetry, unsupported Desktop patch, generalized daemon, or full product UI in P0. Do not turn unavailable timing fields into inferred "thinking time".

## Latest evidence

The `0.2.7` conversation-side panel matched this chat and displayed automatically changing active and completed-turn values after restart, confirmed by the user. The Owner selected that placement as v1 primary. The review of `08d1600` directs deletion of superseded P0 paths and resource measurement of the smallest candidate. The branch merged current `main` (`1314278`), including continuous minimum-necessary authority.

Candidate `0.2.8` removes the global entrypoint, sourceProbe, one-shot scanner/skill, duplicate parser tests, and version-2 UI fallback. It retains only thread opener/resource, incremental progress, source locator/cursor, and a small static view. Eleven local tests pass. The installed package matches the build. After restart, the session exposes only the two retained tools and real chat-originating reads are verified with zero skips. Expanded side-tab visibility remains pending; the MCP Apps tab inventory is empty and a user observation has been requested.

Native turn usage uses only `token_usage_record.turn_token_usage`; token_count is ignored. One existing subagent rollout replay verified static parent lineage, six completed child turns, and all six final native usage fields without modifying the source. A fresh stdio reconnect reconstructed the same completed snapshot. Precise live tool start and model request/inference/TTFT/TBT are classified unavailable through the chosen path. A provider retry has not been induced; the replay is not a fresh Desktop subagent test.

A short standalone runtime comparison settled at 48.4 MiB for a bare MCP SDK stdio control and 51.7 MiB for the installed candidate. Catch-up of about 26 MiB took 609 ms; appended-byte calls took 2–4 ms. This does not establish Desktop marginal cost or turn overhead. The 40 MiB direction still needs exact-head resource review.

Restarted closed-panel sampling found three stable installed-bundle processes totaling about 145.4 MiB with unchanged CPU counters over about 31 s; an initial fourth process exited itself. The opener scanned about 26.7 MiB in 899 ms of total host/transport time. One process rose from about 50 to 74.7 MiB, later 80.4 MiB; no stable count increase was seen. This does not yet establish the panel-open/closed marginal cost.

Next: resolve the pending visible-panel observation and complete closed/open/closed behavior; compare plugin-disabled host baseline and repeated representative Desktop turn durations where feasible. Native Desktop-visible usage comparison and independent P0 acceptance remain open. Full sanitized evidence is in `docs/evidence/WO-0001-P0-CAPABILITY-PROBE.md`. P0 remains IN_PROGRESS.
