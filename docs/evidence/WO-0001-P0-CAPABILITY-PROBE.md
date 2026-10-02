# WO-0001 P0 capability probe — partial evidence

Status: **IN_PROGRESS**. This is development evidence, not independent P0 acceptance.

## Tested environment and scope

- Date: 2026-10-02 (America/Los_Angeles).
- Windows Codex Desktop package: `OpenAI.Codex 26.930.2377.0`.
- Codex CLI / rollout `cli_version`: `0.157.0`.
- Probe plugin: `0.1.0`, portable local package with one diagnostic skill and a Node.js read-only scanner.
- Host: Windows; Node.js `v24.15.0` for the probe. No persistent probe process, database, listener, network export, or Codex-file write.
- One previously completed Codex Desktop turn from a local rollout was used. Its native IDs, path, prompts, commands, outputs, account metadata, and raw JSONL are deliberately omitted.

The installed package was listed by `codex plugin list` as enabled. The running Desktop app was not restarted, so UI entrypoint and skill discovery in a new Desktop chat are **not verified**.

## Capability and source matrix

`SUPPORTED` means a documented host/package capability demonstrated locally; `AVAILABLE_INDIRECTLY` means a read-only rollout field was observed; `UNVERIFIED` means this spike has not established availability in the Codex Desktop plugin host. “Unavailable” applies to a metric in the tested source, not to every possible future source.

| Fact or surface | P0 finding | Exact observed source and metric quality | Limitation |
| --- | --- | --- | --- |
| Local plugin package | SUPPORTED | `codex plugin add`/`list`, package `0.1.0` | Skill package only; no MCP App UI. |
| Conversation side panel | UNVERIFIED | Official extension docs describe a ChatGPT thread entrypoint | No Codex Desktop runtime proof or screenshot. AT-P0-01 open. |
| Thread and turn IDs | AVAILABLE_INDIRECTLY | `token_usage_record.thread_id/turn_id`, `item_completed.thread_id/turn_id`, `task_started.turn_id`; exact identity | Probe replaces native IDs with local aliases in output. Current-thread context is not exposed to this skill. |
| Turn start/end/wall duration | AVAILABLE_INDIRECTLY | `task_started.started_at`, `task_complete.completed_at/duration_ms`; reported duration exact | Lifecycle timestamps are Unix seconds; tool timestamps are Unix milliseconds. |
| Model/provider | AVAILABLE_INDIRECTLY | `turn_context.model`, `session_meta.model_provider`; exact identity | Service tier not observed. |
| Turn token usage | AVAILABLE_INDIRECTLY | `token_usage_record.turn_token_usage`; exact native report | Provider cache semantics need separate validation before a cache-hit ratio. |
| Tool start/end/status | AVAILABLE_INDIRECTLY | `item_completed.started_at_ms/completed_at_ms` and item status; timestamps/status exact, duration derived | Completion record permits retrospective spans; a live start notification was not established. |
| Subagent lifecycle | UNVERIFIED | No representative child-agent turn in this sample | Parent/child correlation remains open. |
| Request/inference duration | UNVERIFIED | No matching field in inspected records | Report unavailable for this source. |
| Model TTFT/TBT | UNVERIFIED | `task_complete.time_to_first_token_ms` is **turn-level**, not model TTFT | Model TTFT/TBT remain unavailable for this source. |
| Retry/reconnect | UNVERIFIED | No explicit event in inspected completed turn | Do not infer retries from gaps or repeated calls. |
| Rollout discovery/access | AVAILABLE_INDIRECTLY | `CODEX_HOME/sessions` file discovery and read-only JSONL open | Local script access is proven; panel/MCP runtime access is not. |
| Host appearance/theme | UNVERIFIED | No tested host API | UI implementation pending. |

Official documentation supports portable plugin manifests and local marketplaces: <https://developers.openai.com/plugins/build/plugins>. The documented `{ type: "thread" }` conversation panel is described for ChatGPT extensions: <https://developers.openai.com/plugins/build/extensions>. The available official documentation does **not** by itself prove that Codex Windows Desktop exposes that panel or current-thread lifecycle/usage events to this package.

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
| AT-P0-01 side panel | OPEN | Installed skill package; no Desktop side-panel entrypoint test. |
| AT-P0-02 identity/duration | PARTIAL | Native IDs and completed-turn timing found read-only in rollout; no live panel binding. |
| AT-P0-03 usage | PARTIAL | Native turn usage found; independent UI/native reconciliation still needed. |
| AT-P0-04 tool lifecycle | PARTIAL | 13 retrospective spans; live start/end observation still needed. |
| AT-P0-05 timing | PARTIAL | Turn-level first token separated; model request/inference/TTFT/TBT unavailable in inspected source. Other supported sources untested. |
| AT-P0-06 read-only | PASS for probe | SHA-256 of completed rollout before and after scan matched. Scanner opens read-only and writes only stdout/stderr. |
| AT-P0-07 architecture | OPEN | No companion has been added. Plugin-only live data path and UI host capabilities remain unproven. |

## Resource and privacy baseline

Three active scans of the same approximately 0.68 MB completed rollout took **18, 19, and 19 ms** inside the Node process, with reported peak RSS **42 MiB** in each run. This is a one-shot scanner baseline, not a measurement of continuous live profiling overhead or Codex task slowdown. Idle probe CPU/memory is zero because the package has no resident process. The skill package itself was installable with no additional npm dependency. Probe tests verify that prompt-shaped labels, native IDs, command text, stdout/stderr, and messages are absent from output. No raw rollout or private path is committed.

## Architecture decision pending

Keep the P0 scaffold as a read-only skill and scanner for now. The rollout source provides retrospective turn, usage, and tool facts. A side-panel implementation or local companion would be premature until Codex Desktop's plugin UI and current-thread data-access surfaces are tested in a freshly loaded plugin session. If those surfaces are absent, record the exact host limitation and escalate before changing the accepted side-panel architecture. No ADR change is proposed from this partial sample.

## Handoff

Development Status: `IN_PROGRESS`; Independent Review: `PENDING`. Phase/WO: `P0 / WO-0001`. Coordination Issue: `#1`. PR/head and CI: to be filled from the draft PR. Windows runtime evidence: package installed via CLI and completed rollout scanned; Desktop side panel not verified. Telemetry reconciliation: native rollout fields mapped, external UI reconciliation pending. Minimalism review: no daemon, MCP server, database, network listener, or full UI added. Next action: restart/reload Desktop with the local plugin, test skill discovery and supported thread entrypoint, then test a live harmless turn and close the remaining AT-P0 items.
