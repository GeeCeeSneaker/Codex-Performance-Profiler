# Future ADCP Integration Contract

## 1. Purpose

Ensure the Codex Desktop implementation can become one adapter/client of a broader ADCP Agent Telemetry system without making Codex v1 carry ADCP infrastructure.

## 2. Integration boundary

ADCP consumes a versioned normalized event stream, not Codex rollout records or Codex-specific parser objects.

Conceptual envelope:

```json
{
  "schema_version": "1.x",
  "event_id": "...",
  "run_id": "...",
  "turn_id": "...",
  "agent_type": "codex",
  "provider": "openai",
  "event_type": "span.completed",
  "observed_at": "...",
  "payload": {},
  "source": "...",
  "quality": "exact"
}
```

Exact wire schema is frozen during P1 after P0 source evidence.

## 3. Adapter contract

Each future adapter owns:
- native event discovery/parsing;
- provider/agent identity mapping;
- native token-category mapping;
- native timing semantics;
- parent/child correlation facts;
- source/quality assignment.

Adapters do not implement timeline/cost/workflow analysis separately.

## 4. Provider pricing adapter

Pricing is a separate adapter from execution telemetry. It maps provider/model/tier and effective date to normalized prices. Provider-reported cost bypasses local price calculation but retains source semantics.

## 5. Store contract

The analysis core depends on a narrow store abstraction, not SQL. Codex Desktop v1 uses in-memory/replay. The ADCP phase may add `SqliteTelemetryStore` when cross-run/cross-agent history justifies it.

A future database should store normalized events/aggregates, not blindly copy raw prompts/tool outputs.

## 6. ADCP authority boundary

Telemetry is observational evidence. It is not ADCP business workflow state and must not become a second scheduler/control plane. Future routing/optimization logic may read telemetry, but decisions remain under ADCP's accepted authority model.

## 7. Cross-agent comparison

Comparisons must preserve separate dimensions:
- task quality/success;
- wall latency;
- model/tool/wait composition;
- tokens/cache;
- reported/estimated cost;
- failures/retries;
- concurrency.

Do not collapse these into a single opaque "agent score" in the telemetry core.
