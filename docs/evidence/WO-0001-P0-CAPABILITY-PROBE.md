# WO-0001 P0 capability probe — partial evidence

Status: **IN_PROGRESS**. This is development evidence, not independent P0 acceptance.

## Tested environment and scope

- Date: 2026-10-02 (America/Los_Angeles).
- Windows Codex Desktop package: `OpenAI.Codex 26.930.2377.0`.
- Codex CLI / rollout `cli_version`: `0.157.0`.
- Probe plugin: `0.2.0`, portable local package with one diagnostic skill, a bundled stdio MCP App, and a Node.js read-only scanner.
- Host: Windows; Node.js `v24.15.0` for the probe. No project-owned daemon, database, listener, network export, or Codex-file write. The MCP server is host-managed stdio and serves static UI only.
- One previously completed Codex Desktop turn from a local rollout was used. Its native IDs, path, prompts, commands, outputs, account metadata, and raw JSONL are deliberately omitted.

The installed package was listed by `codex plugin list` as enabled. A separate local app-server instance discovered its MCP tool/resource and `thread` entrypoint metadata. The running Desktop app was not restarted, so actual UI rendering and skill discovery in a new Desktop chat are **not verified**.

## Capability and source matrix

`SUPPORTED` means a documented host/package capability demonstrated locally; `AVAILABLE_INDIRECTLY` means a read-only rollout field was observed. `UNVERIFIED—NOT_EXERCISED` means the running Desktop renderer or a representative case has not been tested; `UNVERIFIED—INSPECTED_SOURCE_ABSENT` means the inspected rollout has no matching fact; `UNVERIFIED—APP_SERVER_ONLY` means the app-server protocol exposes a fact but this plugin has no proven subscription to the active Desktop instance. None of these is a claim that every possible future source is unavailable.

| Fact or surface | P0 finding | Exact observed source and metric quality | Limitation |
| --- | --- | --- | --- |
| Local plugin package | SUPPORTED | `codex plugin add`/`list`, package `0.2.0`; cached bundle hash matched source | Installed package contains only manifest, skill, probe script, and bundled UI/server; no `node_modules`. |
| MCP App thread entrypoint metadata | SUPPORTED in local stdio/app-server protocol | `tools/list` and separate app-server `mcpServerStatus/list` both exposed `profiler.open`, one UI resource, and `thread` entrypoint | `plugin/installed` local summary had no `extensions` field; it must not be used as a positive UI-rendering claim. |
| Conversation side panel | UNVERIFIED—NOT_EXERCISED | Static fullscreen-only MCP App/resource now exists | Running Codex Desktop renderer has not been reloaded/opened; no screenshot or runtime UI proof. AT-P0-01 open. |
| Live turn/tool/usage notifications | UNVERIFIED—APP_SERVER_ONLY | `rust-v0.157.0` protocol declares `turn/started`, `item/started`, `item/completed`, `thread/tokenUsage/updated`, and `turn/completed` | This MCP server is a separate peer, with no supported subscription to the active Desktop app-server shown. A second app-server session would not observe the Desktop turn. |
| Thread and turn IDs | AVAILABLE_INDIRECTLY | `token_usage_record.thread_id/turn_id`, `item_completed.thread_id/turn_id`, `task_started.turn_id`; exact identity | Probe replaces native IDs with local aliases in output. Current-thread context is not exposed to this skill. |
| Turn start/end/wall duration | AVAILABLE_INDIRECTLY | `task_started.started_at`, `task_complete.completed_at/duration_ms`; reported duration exact | Lifecycle timestamps are Unix seconds; tool timestamps are Unix milliseconds. |
| Model/provider | AVAILABLE_INDIRECTLY | `turn_context.model`, `session_meta.model_provider`; exact identity | Service tier not observed. |
| Turn token usage | AVAILABLE_INDIRECTLY | `token_usage_record.turn_token_usage`; exact native report | Six token fields matched the final `event_msg:token_count.info.total_token_usage` in the one-turn sample. Cache-ratio semantics still need validation. |
| Tool start/end/status | AVAILABLE_INDIRECTLY | `item_completed.started_at_ms/completed_at_ms` and item status; timestamps/status exact, duration derived | Completion record permits retrospective spans; a live start notification was not established. |
| Subagent lifecycle | UNVERIFIED—NOT_EXERCISED | No representative child-agent turn in this sample | Parent/child correlation remains open. |
| Request/inference duration | UNVERIFIED—INSPECTED_SOURCE_ABSENT | No matching field in inspected rollout records | Other native sources were not accessible in this test. |
| Model TTFT/TBT | UNVERIFIED—INSPECTED_SOURCE_ABSENT | `task_complete.time_to_first_token_ms` is **turn-level**, not model TTFT | Model TTFT/TBT remain unavailable for this source. |
| Retry/reconnect | UNVERIFIED—NOT_EXERCISED | No explicit event in inspected completed turn | Do not infer retries from gaps or repeated calls. |
| Rollout discovery/access | AVAILABLE_INDIRECTLY | `CODEX_HOME/sessions` file discovery and read-only JSONL open | A 12-second watch of the active file observed two growth events and 3,620 appended bytes, including tool completion and token-count records. Automatic active-thread selection by the MCP App remains unproven. |
| Host appearance/theme | UNVERIFIED—NOT_EXERCISED | MCP App host context supports theme in the standard | Desktop renderer not exercised. |

Official documentation supports portable plugin manifests and local marketplaces: <https://developers.openai.com/plugins/build/plugins>. The documented `{ type: "thread" }` conversation panel is described for ChatGPT extensions: <https://developers.openai.com/plugins/build/extensions>. Codex upstream commit `a1f40f3f1326eff7c81b860a4f4e27c1be186e10` added extension fields to hosted plugin summaries; this is not proof that a local MCP App renders in the tested Desktop instance. The available official documentation does **not** by itself prove current-thread lifecycle/usage event access by this package.

## One real turn mapped to normalized candidate facts

The selected turn was complete and had stable native turn/thread IDs. Values below were emitted by `scripts/probe.mjs`; native IDs and timestamps are represented as aliases and offsets.

| Candidate normalized fact | Sanitized value | Source / quality |
| --- | --- | --- |
| Turn wall duration | 329,884 ms | `task_complete.duration_ms` / exact |
| Turn time to first token | 9,360 ms | `task_complete.time_to_first_token_ms` / exact **turn-level** semantic |
| Model | `gpt-6-luna` | `turn_context.model` / exact identity |
| Tool spans | 13 total: 12 `shell_exec`, 1 `edit_patch`; 3 failed | `item_completed` / exact category/status; each duration derived from timestamps |
| Example tool span | `tool-1`, offset 27,249–27,249 ms, error | `item_completed` / 0 ms derived after timestamp rounding; no raw command |
| Input / cached input / output / reasoning output | 595,351 / 536,576 / 10,311 / 7,371 tokens | `turn_token_usage` / exact native report |
| Request/inference/model TTFT/TBT | unavailable | No supported matching source established |

The first span's 0 ms is an observed same-millisecond timestamp pair, **not** a missing-value zero. The output does not calculate “thinking time,” cost, critical path, or an assumed wall-time composition.

## AT-P0 evidence and remaining work

| Test | State | Evidence / gap |
| --- | --- | --- |
| AT-P0-01 side panel | OPEN | Real MCP App thread entrypoint and fullscreen UI resource pass stdio/app-server metadata checks; Desktop rendering remains untested. |
| AT-P0-02 identity/duration | PARTIAL | Native IDs and completed-turn timing found read-only in rollout; no live panel binding. |
| AT-P0-03 usage | PARTIAL | Six native token fields reconciled between `token_usage_record` and final `token_count` in one completed turn; visible Desktop UI reconciliation remains open. |
| AT-P0-04 tool lifecycle | PARTIAL | 13 retrospective spans; live start/end observation still needed. |
| AT-P0-05 timing | PARTIAL | Turn-level first token separated; model request/inference/TTFT/TBT unavailable in inspected source. Other supported sources untested. |
| AT-P0-06 read-only | PASS for probe | SHA-256 of completed rollout before and after scan matched. Scanner opens read-only and writes only stdout/stderr. |
| AT-P0-07 architecture | OPEN | No companion has been added. Plugin-only live data path and UI host capabilities remain unproven. |

## Resource and privacy baseline

Three active scans of the same approximately 0.68 MB completed rollout took **18, 19, and 19 ms** inside the Node process, with reported peak RSS **42 MiB** in each run. This is a one-shot scanner baseline, not a measurement of continuous live profiling overhead or Codex task slowdown. The scanner has no resident process. The installed MCP App runtime is a bundled stdio server and needs no `npm install`. In a four-second idle sample after startup using the final minified installed bundle, its RSS was **46.2 MiB** at both ends and CPU increment was 0% of one logical CPU. This exceeds the v1 companion/plugin-local 40 MiB idle memory target; the P0 UI probe has no collector work, so the measurement is a warning for future architecture, not a silent budget relaxation. Desktop lifecycle and active overhead remain unmeasured. Probe tests verify that prompt-shaped labels, native IDs, command text, stdout/stderr, and messages are absent from output. No raw rollout or private path is committed.

## Architecture decision pending

Keep the P0 MCP App as a static host-capability probe and the rollout scanner read-only. The rollout source provides retrospective turn, usage, and tool facts and grows during an active turn. Do not add an independent Codex app-server session and mistake its notifications for the active Desktop conversation. A telemetry companion would be premature until the actual Desktop UI and current-thread data-access surfaces are tested in a freshly loaded plugin session. If those surfaces are absent, record the exact host limitation and escalate before changing the accepted side-panel architecture. No ADR change is proposed from this partial sample.

## Handoff

Development Status: `IN_PROGRESS`; Independent Review: `PENDING`. Phase/WO: `P0 / WO-0001`. Coordination Issue: `#1`; draft PR: `#2`. Exact candidate head and CI result are tracked on the PR. Windows runtime evidence: installed MCP App protocol metadata and completed rollout scan; Desktop side panel not verified. Telemetry reconciliation: native rollout fields match across two record families, external UI reconciliation pending. Minimalism review: no daemon, database, network listener, or product UI added; one host-managed stdio MCP server exists only for panel capability testing. Next action: restart/reload Desktop with the local plugin, test the supported thread entrypoint in the renderer, then test a live harmless turn and close the remaining AT-P0 items.
