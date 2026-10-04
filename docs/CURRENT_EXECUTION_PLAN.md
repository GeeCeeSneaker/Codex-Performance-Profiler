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

The installable P0 MCP App/diagnostic skill and read-only rollout scanner, plus a partial Windows capability matrix, are recorded in `docs/evidence/WO-0001-P0-CAPABILITY-PROBE.md`. Version `0.2.5` restored the Desktop entrypoint after the `0.2.4` manifest failure. A direct source call from this chat matched its rollout, and the user confirmed that the conversation-side panel's source check also matched. The independent left-navigation page rendered but returned `not_found`; it cannot be treated as automatically bound to the normal chat. After restarting with `0.2.6`, a chat-originating open returned `verified`; the user confirmed that the conversation-side panel displayed the completed-turn duration, tool count, and input/output tokens automatically, before Refresh. Live data and the architecture decision remain open, so P0 exit has not passed.
