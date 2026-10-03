# WO-0001 P0 capability probe — partial evidence

Status: **IN_PROGRESS**. This is development evidence, not independent P0 acceptance.

## Tested environment and scope

- Date: 2026-10-02 (America/Los_Angeles).
- Windows Codex Desktop package: `OpenAI.Codex 26.930.2377.0`.
- Codex CLI / rollout `cli_version`: `0.157.0`.
- Probe plugin: `0.2.0` in the first restarted Desktop observation; repaired `0.2.1` in the second; `0.2.2` in the first current-thread source call; `0.2.3` installed locally with an explicit `CODEX_HOME` pass-through request. All are portable local packages with one diagnostic skill, a bundled stdio MCP App, and a Node.js read-only scanner.
- Host: Windows; Node.js `v24.15.0` for the probe. No project-owned daemon, database, listener, network export, or Codex-file write. The MCP server is host-managed stdio and serves static UI only.
- One previously completed Codex Desktop turn from a local rollout was used. Its native IDs, path, prompts, commands, outputs, account metadata, and raw JSONL are deliberately omitted.

The installed package was listed by `codex plugin list` as enabled. A separate local app-server instance discovered its MCP tool/resource and `thread` entrypoint metadata. After a Desktop restart, `profiler.open` was available and returned successfully; the user screenshot showed a new `Profiler Panel Probe` content tab beside the conversation, but its body was blank. The Desktop log for that open reported `Uncaught SyntaxError: Failed to execute 'write' on 'Document': Invalid or unexpected token` during widget execution. A local syntax check reproduced the error: the build's string replacement expanded `$` sequences in bundled JavaScript and inserted duplicate HTML into it. Version `0.2.1` fixes the replacement, adds a global entrypoint at the user's request, and passes a bundled-script syntax regression test. After the second Desktop restart, the user confirmed the left-navigation entry and reported that opening it displayed the title and status text. The Desktop log recorded successful resource read and `mcp_app_sandbox.widget_running` for the fullscreen global view. A subsequent user screenshot showed the repaired `Profiler Panel Probe` tab rendered beside the conversation with the title and `MCP App opened by the host` status. This proves both supported placements render; it does **not** prove current-thread telemetry access. The screenshot is not committed because it includes unrelated Desktop content.

For `0.2.2`, the tested [Codex `rust-v0.157.0` app-server source](https://github.com/openai/codex/blob/rust-v0.157.0/codex-rs/app-server/src/request_processors/mcp_processor.rs) adds `_meta.threadId` to direct MCP tool calls. The installed MCP SDK exposes request metadata to the server tool handler. A new `profiler.sourceProbe` tool accepts no thread ID as a model argument: it reads only the host metadata, validates the ID, verifies an exactly matching session header, and returns a content-free rollout summary. Local stdio integration tests pass for supplied request metadata and the missing-metadata case. An independent read-only call against this chat's active rollout matched the session and recovered a completed turn from an approximately 10 MB file in 200 ms, with 85 MiB one-shot process peak RSS. A real Desktop call returned `probe_version: 2`, `thread_context: provided`, `rollout_match: codex_home_unavailable`, and no turn summary. Thus Desktop-to-plugin current-thread metadata transfer **is verified**, while the plugin process lacked the rollout root. The tool does not update the UI or subscribe to live events.

The tested [Codex `rust-v0.157.0` plugin configuration parser](https://github.com/openai/codex/blob/rust-v0.157.0/codex-rs/codex-mcp/src/plugin_config.rs) accepts `env_vars` for a local stdio MCP server. Version `0.2.3` requests `CODEX_HOME` in `mcp.json`; installation succeeded, its cached manifest retained the request, and the installed server bundle hash matched the built source. Nine local tests pass. Actual Desktop pass-through after a fresh restart is **unverified**; installation alone does not establish it.

## Capability and source matrix

`SUPPORTED` means a documented host/package capability demonstrated locally; `AVAILABLE_INDIRECTLY` means a read-only rollout field was observed. `UNVERIFIED—NOT_EXERCISED` means the running Desktop renderer or a representative case has not been tested; `UNVERIFIED—INSPECTED_SOURCE_ABSENT` means the inspected rollout has no matching fact; `UNVERIFIED—APP_SERVER_ONLY` means the app-server protocol exposes a fact but this plugin has no proven subscription to the active Desktop instance. None of these is a claim that every possible future source is unavailable.

| Fact or surface | P0 finding | Exact observed source and metric quality | Limitation |
| --- | --- | --- | --- |
| Local plugin package | SUPPORTED | `codex plugin add`/`list`, packages `0.2.0` and `0.2.1`; original cached bundle hash matched source | Installed package contains only manifest, skill, probe script, and bundled UI/server; no `node_modules`. |
| MCP App global view | SUPPORTED in tested Desktop | `0.2.1` appeared in left navigation; user confirmed visible title/status after opening; Desktop log recorded successful resource read and fullscreen `widget_running` | Static P0 probe only; no active-thread data binding or telemetry shown. |
| Conversation content tab | SUPPORTED in tested Desktop | `0.2.0` opened a tab but failed to render; after the fix, a user screenshot showed the `0.2.1` probe title/status rendered beside the conversation | Static view only; it does not display active-thread telemetry. |
| Live turn/tool/usage notifications | UNVERIFIED—APP_SERVER_ONLY | `rust-v0.157.0` protocol declares `turn/started`, `item/started`, `item/completed`, `thread/tokenUsage/updated`, and `turn/completed` | This MCP server is a separate peer, with no supported subscription to the active Desktop app-server shown. A second app-server session would not observe the Desktop turn. |
| Thread and turn IDs | SUPPORTED for active thread ID; AVAILABLE_INDIRECTLY for rollout turn ID | Rollout records carry native IDs; `rust-v0.157.0` app-server source injects `_meta.threadId` for direct MCP tool calls; the real `0.2.2` Desktop call reported `thread_context: provided` | No native ID is returned by the probe. Mapping that ID to the rollout in the Desktop plugin process remains unverified. |
| Turn start/end/wall duration | AVAILABLE_INDIRECTLY | `task_started.started_at`, `task_complete.completed_at/duration_ms`; reported duration exact | Lifecycle timestamps are Unix seconds; tool timestamps are Unix milliseconds. |
| Model/provider | AVAILABLE_INDIRECTLY | `turn_context.model`, `session_meta.model_provider`; exact identity | Service tier not observed. |
| Turn token usage | AVAILABLE_INDIRECTLY | `token_usage_record.turn_token_usage`; exact native report | Six token fields matched the final `event_msg:token_count.info.total_token_usage` in the one-turn sample. Cache-ratio semantics still need validation. |
| Tool start/end/status | AVAILABLE_INDIRECTLY | `item_completed.started_at_ms/completed_at_ms` and item status; timestamps/status exact, duration derived | Completion record permits retrospective spans; a live start notification was not established. |
| Subagent lifecycle | UNVERIFIED—NOT_EXERCISED | No representative child-agent turn in this sample | Parent/child correlation remains open. |
| Request/inference duration | UNVERIFIED—INSPECTED_SOURCE_ABSENT | No matching field in inspected rollout records | Other native sources were not accessible in this test. |
| Model TTFT/TBT | UNVERIFIED—INSPECTED_SOURCE_ABSENT | `task_complete.time_to_first_token_ms` is **turn-level**, not model TTFT | Model TTFT/TBT remain unavailable for this source. |
| Retry/reconnect | UNVERIFIED—NOT_EXERCISED | No explicit event in inspected completed turn | Do not infer retries from gaps or repeated calls. |
| Rollout discovery/access | AVAILABLE_INDIRECTLY | `CODEX_HOME/sessions` file discovery and read-only JSONL open; `0.2.2` matches a validated host thread ID to the session header before scanning | A 12-second watch of the active file observed two growth events and 3,620 appended bytes. A local call found this chat's rollout; Desktop's `0.2.2` stdio process lacked `CODEX_HOME`. The `0.2.3` pass-through request is not yet tested after restart. |
| Host appearance/theme | UNVERIFIED—NOT_EXERCISED | MCP App host context supports theme in the standard | The blank `0.2.0` view never completed app initialization. |

Official documentation supports portable plugin manifests and local marketplaces: <https://developers.openai.com/plugins/build/plugins>. The documented `{ type: "global" }` and `{ type: "thread" }` entrypoints are described in the OpenAI MCP Extensions specification: <https://github.com/openai/mcp-extensions/blob/main/docs/spec.md#mcp-app-entrypoints>. Local Desktop rendering is established by the observed `0.2.1` host behavior above, not by documentation or the Codex upstream extension-summary commit alone. The available official documentation does **not** by itself prove current-thread lifecycle/usage event access by this package.

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
| AT-P0-01 side panel | PASS for P0 static entrypoint | The user-requested `0.2.1` global view opens and renders; a user screenshot also shows the repaired thread view rendered beside the conversation through the supported entrypoint. Live telemetry is covered by separate P0 tests. |
| AT-P0-02 identity/duration | PARTIAL | Native IDs and completed-turn timing found read-only in rollout. A real Desktop call supplied the active thread ID, but the plugin process had no rollout root. Current-thread rollout match and live panel binding remain unverified. |
| AT-P0-03 usage | PARTIAL | Six native token fields reconciled between `token_usage_record` and final `token_count` in one completed turn; visible Desktop UI reconciliation remains open. |
| AT-P0-04 tool lifecycle | PARTIAL | 13 retrospective spans; live start/end observation still needed. |
| AT-P0-05 timing | PARTIAL | Turn-level first token separated; model request/inference/TTFT/TBT unavailable in inspected source. Other supported sources untested. |
| AT-P0-06 read-only | PASS for probe | SHA-256 of completed rollout before and after scan matched. Scanner opens read-only and writes only stdout/stderr. |
| AT-P0-07 architecture | OPEN | No companion has been added. Plugin-only live data path and UI host capabilities remain unproven. |

## Resource and privacy baseline

Three active scans of the same approximately 0.68 MB completed rollout took **18, 19, and 19 ms** inside the Node process, with reported peak RSS **42 MiB** in each run. This is a one-shot scanner baseline, not a measurement of continuous live profiling overhead or Codex task slowdown. The scanner has no resident process. The installed MCP App runtime is a bundled stdio server and needs no `npm install`. In a four-second idle sample after startup using the `0.2.1` minified installed bundle, its RSS was **46.2 MiB** at both ends and CPU increment was 0% of one logical CPU. An independent one-shot `0.2.2` source scan of this chat's approximately 10 MB rollout took **200 ms** and reached **85 MiB** process peak RSS. These exceed the v1 companion/plugin-local 40 MiB idle memory target or resource direction as applicable; one-shot and resident-process measurements are not interchangeable. The P0 probes do no continuous collection, so these are warnings for future architecture, not silent budget relaxations. Desktop lifecycle and active overhead remain unmeasured. Tests verify that prompt-shaped labels, native IDs, command text, stdout/stderr, and messages are absent from output. No raw rollout or private path is committed.

## Architecture decision pending

Keep the P0 MCP App as a static host-capability probe and the rollout scanner read-only. The rollout source provides retrospective turn, usage, and tool facts and grows during an active turn. Do not add an independent Codex app-server session and mistake its notifications for the active Desktop conversation. The user prefers a left-navigation dashboard; `0.2.1` provides a tested global view while retaining the thread tab for the original side-panel test. A direct MCP call establishes current-thread identity, while rollout access from the plugin process and live telemetry access remain unproven. A telemetry companion would be premature until current-thread data-access surfaces are tested in the freshly loaded plugin session. If those surfaces are absent, record the exact host limitation and escalate before changing the accepted side-panel architecture. No ADR change is proposed from this partial sample.

## Handoff

Development Status: `IN_PROGRESS`; Independent Review: `PENDING`. Phase/WO: `P0 / WO-0001`. Coordination Issue: `#1`; draft PR: `#2`. Exact candidate head and CI result are tracked on the PR. Windows runtime evidence: `0.2.1` global navigation and thread-side static views both rendered after restart; AT-P0-01 passes for the entrypoint. A real `0.2.2` Desktop source call supplied current-thread context but reported `codex_home_unavailable`. Version `0.2.3` is installed with an explicit `CODEX_HOME` request and awaits a fresh Desktop call. Telemetry reconciliation: native rollout fields match across two record families, external UI reconciliation pending. Minimalism review: no daemon, database, network listener, or product UI added; one host-managed stdio MCP server and a one-shot read-only diagnostic tool exist for P0 capability testing. Next action: restart Desktop with `0.2.3`, invoke `profiler.sourceProbe` in this conversation, check whether the current rollout matches without exposing native IDs, then test a live harmless turn and close the remaining AT-P0 items.
