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
