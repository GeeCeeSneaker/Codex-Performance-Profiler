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

The installable P0 MCP App/diagnostic skill and read-only rollout scanner, plus a partial Windows capability matrix, are recorded in `docs/evidence/WO-0001-P0-CAPABILITY-PROBE.md`. Version `0.2.5` restored the Desktop entrypoint after the `0.2.4` manifest failure. The independent left-navigation page rendered but returned `not_found`; it cannot be treated as automatically bound to the normal chat. Version `0.2.6` displayed a completed-turn snapshot beside the conversation. After restarting with `0.2.7`, this chat's `profiler.open` returned `verified`, an active turn, a latest completed turn, and zero skipped records. The user confirmed the side panel displayed both turns and token values, and that running values changed automatically. The Owner selected this conversation-side panel as the v1 primary entrypoint and retained the global page as a P0 probe. Direct progress calls read only 869 and 791 appended bytes. Fourteen local tests and CI pass. The installed stdio server settled around 52–53 MiB RSS in a standalone sample, and a Desktop process check found three host-managed `0.2.7` processes totaling about 170.5 MiB RSS; their roles are not established. The 40 MiB resource direction is missed. End-to-end overhead, remaining telemetry cases, and the architecture decision remain open, so P0 exit has not passed.

The latest multi-turn source inspection found separate native turn and thread token-usage fields. Adjacent `token_count` records do not generally match them and have no turn ID for a reliable join. The earlier one-turn six-field match is therefore limited to that sample; AT-P0-03 stays partial.
