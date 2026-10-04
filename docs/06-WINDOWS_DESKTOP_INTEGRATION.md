# Codex Windows Desktop Integration Design

## 1. First-class target

v1 is explicitly for **Codex Windows Desktop**. CLI support is secondary and must not drive UI/runtime decisions before the Desktop vertical slice works.

## 2. Supported integration surfaces

Preferred order:
1. supported plugin/extension entrypoint and host APIs;
2. supported local MCP App/tool runtime as needed for the UI/data bridge;
3. documented app-server protocol/events if a plugin can legitimately subscribe/access them;
4. read-only Codex rollout/session artifacts;
5. bounded lifecycle hook only for a missing event/turn-finalization signal.

Unsupported DOM injection, Electron modification, binary patching, DLL injection, or replacing Codex's native UI bundle is prohibited for v1.

## 3. P0 capability matrix

The development team must record for the tested Codex Desktop version whether each item is `SUPPORTED`, `AVAILABLE_INDIRECTLY`, or `UNAVAILABLE`:

- thread/conversation side-panel entrypoint;
- current thread/turn IDs;
- turn started/completed timestamps/duration;
- model/provider/service tier;
- token-usage updates;
- tool invocation lifecycle;
- subagent lifecycle;
- Responses/API request timing;
- inference timing;
- TTFT/TBT;
- retry/reconnect events;
- rollout path/discovery;
- host appearance/theme data;
- plugin local filesystem/process access.

Capability evidence must be based on real Windows Desktop behavior, not inferred from TUI-only code.

## 4. Side-panel product

The v1 primary entrypoint is the panel opened from the target conversation. The left-navigation global page remains a diagnostic probe until an explicit chat-selection mechanism is specified; it must not imply automatic binding to the active chat. This placement was confirmed by the Owner after the `0.2.7` conversation-side panel displayed automatically changing active values in Windows Desktop.

### Live
Show elapsed time, current known activity, model/tool aggregate time, call counts, token usage, current throughput when supported, and data-quality state. Refresh should normally be no faster than 2 Hz unless profiling evidence proves a faster rate has negligible cost and materially improves UX.

### Turn
Show wall composition, aggregate work, model timing, tools/failures, retries, usage/cache, cost semantics, subagents/concurrency, and unknown/unavailable metrics.

### Thread
Lightweight cumulative totals only: turns, wall time, model/tool work, token usage, and cost/API-equivalent estimate. No heavy dashboard in v1.

## 5. Local companion rule

A companion process is not part of the architecture until P0 proves it necessary. If required:
- single purpose: expose missing read-only local telemetry;
- no public/inbound TCP listener by default;
- no elevation;
- no modification of Codex state;
- no visible console flash during normal background operation;
- deterministic lifecycle with the plugin;
- bounded memory/CPU;
- narrow protocol with schema versioning.

A single self-contained Windows executable is preferred over requiring users to install an extra runtime, but evidence may justify another simpler approach.

## 6. Rollout/session access

Treat Codex-owned session artifacts as authoritative read-only input. Never rewrite, truncate, rotate, move, or lock them in a way that can affect Codex. Readers must tolerate partially written tail records and resume incrementally.

Do not store raw records in project-owned logs. Parse only the fields required for telemetry.

## 7. Hooks

Avoid per-tool process-spawning hooks on Windows unless no supported event source exists. A single bounded turn-finalization hook is acceptable only when needed and must be tested for Desktop reliability and console-window behavior.

## 8. Compatibility

The adapter records tested Codex version and detected capabilities. Unknown/additive fields should be ignored safely. Structural changes that invalidate semantics mark the affected metric unavailable and surface diagnostics rather than breaking Codex execution.
