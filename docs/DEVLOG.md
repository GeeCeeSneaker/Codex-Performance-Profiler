# Development Log

Durable chronological record of material project decisions, integration findings, and milestone outcomes. Routine commit history does not need duplication here.

## 2026-10-02 — Project bootstrap

- Repository initialized for Codex Performance Profiler.
- Product target fixed to Codex Windows Desktop first.
- Long-term architecture fixed around a provider-neutral Agent Telemetry Core with Codex as the first adapter.
- v1 explicitly avoids a project-owned SQL database; persistent multi-agent history is deferred to ADCP integration.
- Side-panel presentation selected over unsupported native Desktop footer modification.
- Telemetry correctness rules established: source/quality on metrics, no residual-time-as-thinking, wall vs aggregate separation, cost semantics explicitly qualified.
- P0/WO-0001 prepared to validate actual Windows Desktop extension/data-source capabilities before substantial implementation.

## 2026-10-02 — P0 partial capability probe

- Installed a minimal local diagnostic plugin package (`0.1.0`) through the Codex CLI marketplace flow.
- Built a streaming, read-only rollout probe that allowlists telemetry fields and maps one completed Desktop turn into sanitized candidate events. It distinguishes native turn time to first token from unavailable model TTFT.
- Recorded partial source/resource/privacy evidence in `evidence/WO-0001-P0-CAPABILITY-PROBE.md`.
- Kept P0 open: a supported Codex Desktop conversation-side panel and current-thread live data path are not yet demonstrated. No companion process or architecture change was added.

## 2026-10-02 — P0 reviewer-directed MCP App probe

- Addressed draft PR #2 review: the first skill-only package could not test AT-P0-01. Added one bundled stdio MCP server, one opener tool/resource, a `thread` entrypoint, and a static fullscreen-only view.
- Protocol tests and a separate local app-server `mcpServerStatus/list` found the thread entrypoint in tool metadata; `plugin/installed` did not include local extension summary fields. Actual Desktop rendering remains untested.
- Moved the installable plugin under `plugins/codex-performance-profiler/` so its cache omits repository history and development dependencies.
- Observed read-only growth of the active rollout during a Desktop turn and reconciled six usage fields across native record families. Neither observation proves that the MCP App receives active-thread identity or app-server notifications.

## 2026-10-02 — First Desktop view and left-navigation request

- After a Desktop restart, the `0.2.0` `profiler.open` tool returned successfully and a conversation content tab opened. The user screenshot showed a blank tab body. The Desktop log recorded an invalid-token syntax error during widget execution.
- Reproduced the syntax error in the bundled inline script. The build's `String.replace` replacement string interpreted `$` sequences in bundled JavaScript and inserted duplicate HTML. Changed it to a replacement callback and added a regression test that parses the bundled script.
- The user chose a left-navigation dashboard. Version `0.2.1` advertises a `global` entrypoint alongside the existing `thread` entrypoint; the new package is locally installed. Desktop placement and rendering of the repaired view still require a fresh host check.

## 2026-10-02 — Repaired global view verified in Desktop

- After restarting with `0.2.1`, the user confirmed the left-navigation entry is visible and that its page shows the probe title and status text.
- The Desktop log recorded successful UI resource read and `mcp_app_sandbox.widget_running` for the fullscreen global view. A repaired thread-hosted view also reached `widget_running`, but a fresh visual confirmation beside a conversation is still pending.
- The static view proves supported placement and rendering. It does not yet expose active-thread identity or live telemetry, so P0 remains open.
- A subsequent user screenshot showed the repaired thread view with its title and host-open status beside the conversation. AT-P0-01 now passes for the supported static entrypoint; the screenshot itself is not committed because it includes unrelated Desktop content.

## 2026-10-02 — Current-thread source probe candidate

- Inspected the tested Codex `rust-v0.157.0` app-server source: direct MCP tool calls add `_meta.threadId`. Added `profiler.sourceProbe` in plugin `0.2.2` to validate that host metadata, match the corresponding read-only rollout by session header, and return only a sanitized completed-turn summary.
- Local stdio integration tests prove metadata reaches the new tool handler when supplied and that IDs, paths, prompts, and outputs stay out of its response. A local scan of this chat's approximately 10 MB active rollout matched and recovered a completed turn in 200 ms with 85 MiB one-shot peak RSS.
- Installed `0.2.2` locally. Actual Desktop metadata transfer, live update behavior, and budget compliance remain unverified; no companion or architecture change was added.

## 2026-10-02 — Desktop thread context observed; rollout root pass-through candidate

- After restart, a real Desktop `profiler.sourceProbe` call returned `thread_context: provided` and `rollout_match: codex_home_unavailable`. This confirms host thread metadata reaches the plugin, but its stdio process did not inherit `CODEX_HOME`; no live or retrospective current-thread data path is proven yet.
- Codex `rust-v0.157.0` plugin configuration accepts `env_vars` for local stdio MCP servers. Version `0.2.3` adds `env_vars: ["CODEX_HOME"]` to the plugin manifest. Nine tests pass; the installed cache has the same bundled-server SHA-256 as the source package and retains the requested variable. Actual Desktop environment pass-through awaits a fresh invocation after restart.
- Version `0.2.4` adds a small `Check current thread` control to the MCP App. It uses the SDK's host-proxied `callServerTool` API to request only the sanitized source summary, then displays the match state and a few sourced completed-turn facts. This tests panel-to-source binding without adding a full dashboard. Nine tests pass; the installed cache matches the built server and view. Desktop behavior is unverified until restart.

## 2026-10-03 — Desktop loader rejected `env_vars`; repaired plugin manifest

- After restarting with `0.2.4`, the user reported that the left-navigation entry was absent. The Desktop log gave the exact cause: `failed to parse plugin MCP server` with `unknown field env_vars, expected one of command, args, env, cwd`. The panel server was not registered, and a resource read failed with `unknown MCP server 'panel-probe'`. The earlier upstream `env_vars` parser evidence does not describe this installed Desktop plugin loader; installation success and local tests did not catch this mismatch.
- Version `0.2.5` removes the rejected field. With no inherited `CODEX_HOME`, the bundled server derives Codex Home from its own `plugins/cache` install path and still verifies the session header before reading a rollout. A copied-bundle stdio test under a simulated cache layout passes without that environment variable. Ten tests pass; installed manifest has only the four fields accepted by the observed loader, and installed server/view hashes match the build. Desktop recovery remains unverified until restart.

## 2026-10-03 — Conversation panel source path verified; global binding gap

- The user screenshot confirms the `0.2.5` global left-navigation page rendered after restart. Its button returned `thread_context: provided` and `rollout_match: not_found`. This shows that a provided ID in the independent page does not necessarily select the normal chat's saved rollout.
- A direct `profiler.sourceProbe` call from this chat returned `rollout_match: verified` with a completed-turn summary. After `profiler.open` opened the conversation-side tab, the user clicked `Check current thread` there and reported `verified`. Thus the chat-side UI can invoke the same read-only source path. The user's report does not establish continuous live updates.
- Installed `0.2.6` makes `profiler.open` return the sanitized snapshot from the direct chat context; the MCP App's `ontoolresult` renders it on open, and the button refreshes it. The global page now explains when it is not linked to a saved chat. Ten local tests pass. Automatic snapshot display on Desktop remains unverified until restart.
- After restarting with `0.2.6`, a real chat-originating `profiler.open` returned `thread_context: provided`, `rollout_match: verified`, and a completed-turn summary with exact duration quality. The user confirmed the conversation-side panel displayed Latest completed turn, Tool calls, and Input/output tokens without pressing Refresh. The Desktop log recorded the widget running. This proves automatic retrospective snapshot rendering for the current chat, not live update behavior.
- A read-only scan of this chat's active approximately 14.9 MiB rollout found 21 `token_usage_record`, 20 `event_msg:token_count`, and 45 `event_msg:item_completed` records after the latest `task_started` and before its `task_complete`. The inspected file had no standalone `item_started` record. A one-shot full scan took 138 ms and 80 MiB peak RSS; frequent full-file polling is not an acceptable default. Incremental read behavior and active overhead remain to be tested before a live UI path is chosen.
- A 15-second read-only append check then observed 5,285 bytes of growth with seven complete records, including one token-usage and one tool-completion record. Reading and parsing only the appended bytes took 1 ms in that sample. This supports an incremental source design, while steady-state process cost, partial-line handling, and UI update behavior remain unverified.

## 2026-10-03 — Incremental active-turn probe candidate

- Version `0.2.7` adds a bounded read-only JSONL cursor. It projects only turn lifecycle, recognized tool completions, model label, and token-usage fields; holds at most one incomplete raw line in memory; and resumes after split UTF-8/JSONL writes. A changed or truncated source is reported instead of silently continuing at a stale offset.
- `profiler.open` now supplies a compact active/latest-completed snapshot. The visible conversation-side panel requests appended progress every five seconds; its manual refresh uses the same cursor. The existing `profiler.sourceProbe` remains a separate one-shot diagnostic. This is a P0 experiment, not a complete telemetry dashboard.
- Fourteen local tests pass, including no-newline final records, appended bytes read once, content redaction, truncation, and MCP stdio response metadata. A read-only local run against this chat's approximately 21.1 MiB active rollout found an active turn and a prior completed turn; its first catch-up took 560 ms, and an immediate no-change check took 2 ms and read zero bytes. Four `item_completed` and two `compacted` records exceeded 1 MiB; increasing the line cap to 4 MiB let the cursor parse all observed records, including 46 recognized tool completions in the active turn. A separate one-shot process run reported 131 MiB peak RSS and 96 MiB RSS after explicit GC, above the 40 MiB idle direction. These are process measurements, not Desktop panel overhead or continuous profiling evidence.
- Desktop plugin loading, visible automatic refresh, active-turn UI semantics, and sustained resource cost for `0.2.7` still require a restarted host observation. The global left-navigation page still has no verified binding to the current chat.
- Installed `0.2.7` from the local marketplace. Cached manifest, MCP configuration, server bundle, and panel HTML SHA-256 hashes match the source build. A direct stdio call against the installed bundle, without inherited `CODEX_HOME`, returned `verified`, active turn present, zero skipped records, exact observed usage, and zero bytes on an immediate repeat. The current running Desktop session still exposes the older tool list, so this does not prove the new UI has loaded there.
- Compared the one-shot `profiler.sourceProbe` with the `0.2.7` incremental projection over the same real active rollout. Both matched the chat, and the latest completed turn agreed on native wall duration, 29 recognized tool completions, input tokens, and output tokens; the incremental scan skipped zero records. This reconciles two local read paths, not the Desktop's displayed usage.
- In a separate 30-second installed-stdio-server sample, RSS was 58 MiB before opening, 86 MiB just after the full catch-up, and about 53 MiB after the process settled. Five-second progress calls read 0, 0, 3,543, 6,452, 0, and 0 bytes. The rounded Windows process CPU counter did not advance during the last approximately 20 seconds, but the resident memory remained above the 40 MiB target. A second sample separated tool-call time from the Windows process query: three progress calls took 6, 6, and 5 ms, reading 0, 0, and 2,775 bytes. These are standalone installed-server measurements, not Desktop panel overhead or Codex turn slowdown.

## 2026-10-03 — Restarted Desktop incremental panel observed

- After the user's restart, Codex Desktop `26.930.3930.0` exposed the new `profiler.progressProbe` tool and the `0.2.7` `profiler.open` description. Opening it from this chat returned `probe_version: 3`, `thread_context: provided`, `rollout_match: verified`, an active turn, a latest completed turn, and zero skipped records. The user confirmed that the conversation-side panel showed the running turn, completed turn, and token values and that the running values changed automatically while the panel remained visible. This is development evidence for active display and refresh; no claim is made about independent acceptance or numeric agreement with a separate native Desktop usage display.
- Two subsequent direct progress calls read only 869 and 791 appended bytes. During these calls, the running turn's recognized tool completion count rose from 0 to 1 to 6, and the native input/output usage values also rose. This supports the incremental active data path; the direct calls do not independently prove the UI's five-second timer, which rests on the user's visual confirmation.
- A read-only Windows process check found three `node.exe` processes running the installed `0.2.7` bundle under a `codex` parent. Their RSS values were 45.4, 50.0, and 74.5 MiB in one sample; a later aggregate was 170.5 MiB. The process count stayed at three during a roughly 12-second observation. Their distinct host roles are not established, so this is a total observed footprint rather than a per-panel attribution. Resource target compliance and end-to-end turn overhead remain open.
- The Owner chose the conversation-side panel as the v1 primary entrypoint and kept the left-navigation page as a P0 probe. The current global page's `not_found` result does not justify presenting it as a chat-bound dashboard. ADR-0003 and the Windows integration design record this placement clarification.
- A further read-only source inspection found both `turn_token_usage` and `thread_token_usage` in `token_usage_record`. The adjacent `event_msg:token_count` records expose `info.last_token_usage` and `info.total_token_usage`, but carry no turn ID; in this multi-turn rollout, adjacent numeric values do not generally equal the corresponding `token_usage_record` fields. The earlier six-field equality in a one-turn sample must not be generalized. AT-P0-03 remains partial pending a sound join/scope explanation or a separate native Desktop usage comparison.


## 2026-10-03 — Apply review and reduce the P0 candidate

- Merged `origin/main` at `1314278`, adopting continuous minimum-necessary authority, and applied the independent progress review of `08d1600`.
- Candidate `0.2.8` retains only thread opener/resource and incremental progress; deleted the global probe, sourceProbe, diagnostic skill/script, duplicate retrospective parser/tests, and version-2 UI fallback. No new runtime dependency/process/state was introduced.
- Installed `0.2.8`; package hashes match the build. Eleven local tests pass. Restarted Desktop candidate validation is pending.
- Chose native turn_token_usage exclusively; a divergent token_count/thread-usage fixture cannot override it. Replayed one existing CLI 0.156.0 subagent file: static parent/child identity verified, six turns completed, six final token fields matched, source hash unchanged. No fresh Desktop subagent was spawned.
- Recorded one harmless completed shell call with exact native status/duration and derived envelope duration; precise live start and model timing are unavailable through the chosen path. Fresh stdio reconnect reconstructed the same completed snapshot. Provider retry remains unexercised.
- Standalone runtime control settled at 48.4 MiB versus candidate 51.7 MiB; catch-up 609 ms, appended-byte calls 2–4 ms. These measurements do not establish Desktop process attribution or end-to-end overhead and do not relax the 40 MiB target.
- Next: restarted thread-only Desktop closed/open sampling, host/plugin A/B and turn overhead, native visible usage comparison, exact-head independent review. Draft / P0 IN_PROGRESS retained. Detailed measurement method and limits are in the existing evidence document.
