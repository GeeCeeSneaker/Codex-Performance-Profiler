# ADR-0004 — Metric provenance and quality are first-class

Status: Accepted

## Decision

Every material metric carries its source and one of `exact`, `derived`, `estimated`, or `unavailable`. The UI preserves this distinction.

## Why

The product exists to guide optimization. False precision is worse than missing data, especially for inference timing, throughput, reasoning, cache, and cost across different providers.

## Consequences

- no residual-time-as-thinking metric;
- no estimated cost displayed as billed cost;
- unsupported fields remain unavailable;
- fallback throughput formulas remain visibly estimated;
- adapters document native-to-normalized semantic mappings.
