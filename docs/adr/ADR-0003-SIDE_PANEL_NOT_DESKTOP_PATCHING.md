# ADR-0003 — Supported side panel, not Codex Desktop patching

Status: Accepted

## Decision

Use supported plugin/MCP App/Extension entrypoints to present performance data beside a Codex conversation. Do not patch Codex Desktop binaries, DOM, Electron bundles, or native transcript/footer UI.

## Why

The desired data is richer than a completion footer and unsupported UI injection would be brittle across Codex updates. A side panel provides space for live/turn/thread analysis while preserving host compatibility.

## Consequences

Native `Worked for ...` decoration remains a future enhancement only if Codex exposes a supported completion-metadata extension point.

## Owner clarification — 2026-10-03

For v1, the conversation-side panel is the primary profiler entrypoint. The global left-navigation entry remains a P0 diagnostic probe. In the tested Desktop build, a chat-originating panel call matched that chat's rollout and showed changing active values, while the global page did not resolve to the chat's saved rollout. An independent global dashboard would require explicit chat selection or attachment and is not part of the current P0 implementation.
