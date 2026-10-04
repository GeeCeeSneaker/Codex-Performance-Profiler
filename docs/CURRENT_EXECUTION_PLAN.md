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

The installable P0 MCP App/diagnostic skill and read-only rollout scanner, plus a partial Windows capability matrix, are recorded in `docs/evidence/WO-0001-P0-CAPABILITY-PROBE.md`. Version `0.2.5` restored the Desktop entrypoint after the `0.2.4` manifest failure. A direct source call from this chat matched its rollout, and the user confirmed that the conversation-side panel's source check also matched. The independent left-navigation page rendered but returned `not_found`; it cannot be treated as automatically bound to the normal chat. After restarting with `0.2.6`, a chat-originating open returned `verified`; the user confirmed that the conversation-side panel displayed the completed-turn duration, tool count, and input/output tokens automatically, before Refresh. Active-rollout evidence shows token usage and tool completions before turn end, but no separate `item_started` record. Version `0.2.7` is a candidate incremental reader and active-turn panel: fourteen tests pass, and a local read-only run against this chat's approximately 21.1 MiB rollout took 560 ms for initial catch-up versus 2 ms for a zero-byte follow-up. It parsed four large tool-completion records after raising a bounded line cap to 4 MiB. A separate one-shot run reached 131 MiB peak RSS; an installed-stdio-server sample settled around 52–53 MiB, above the 40 MiB idle direction. Desktop live refresh, end-to-end overhead, and the architecture decision remain open, so P0 exit has not passed.
