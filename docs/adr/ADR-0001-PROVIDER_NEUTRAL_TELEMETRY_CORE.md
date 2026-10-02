# ADR-0001 — Provider-neutral telemetry core

Status: Accepted

## Decision

Codex-specific data extraction is isolated behind an adapter. Timeline, usage, cost, storage interfaces, and analysis operate on normalized provider-neutral events/entities.

## Why

The immediate product is Codex Desktop, but the intended later ADCP use requires multiple agents/providers. Encoding Codex fields into the core would create a guaranteed rewrite.

## Consequences

P1 must include provider-neutral synthetic fixtures. Future adapters map native semantics rather than adding provider branches throughout the analyzer. This does **not** authorize implementing other providers during Codex v1.
