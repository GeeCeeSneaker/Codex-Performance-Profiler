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

The installable P0 MCP App/diagnostic skill and read-only rollout scanner, plus a partial Windows capability matrix, are recorded in `docs/evidence/WO-0001-P0-CAPABILITY-PROBE.md`. Version `0.2.1` repaired the initial blank view; both the global and thread-side views render in Desktop, satisfying AT-P0-01 for the static entrypoint. Desktop delivered the current thread ID to the `0.2.2` source probe, but its stdio process lacked `CODEX_HOME`, so the active rollout was not located. Version `0.2.3` explicitly requests that environment variable and is installed locally; a fresh Desktop invocation is needed to test actual pass-through. The plugin-only live data path remains unverified, so P0 exit has not passed.
