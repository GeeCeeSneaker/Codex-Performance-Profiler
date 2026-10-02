# ADR-0003 — Supported side panel, not Codex Desktop patching

Status: Accepted

## Decision

Use supported plugin/MCP App/Extension entrypoints to present performance data beside a Codex conversation. Do not patch Codex Desktop binaries, DOM, Electron bundles, or native transcript/footer UI.

## Why

The desired data is richer than a completion footer and unsupported UI injection would be brittle across Codex updates. A side panel provides space for live/turn/thread analysis while preserving host compatibility.

## Consequences

Native `Worked for ...` decoration remains a future enhancement only if Codex exposes a supported completion-metadata extension point.
