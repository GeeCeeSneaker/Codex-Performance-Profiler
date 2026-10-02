# Codex Performance Profiler

Local-first performance, usage, and cost observability for Codex, starting with **Codex Windows Desktop** and designed from day one to evolve into a provider-neutral Agent Telemetry Core for ADCP.

## Mission

Explain where an AI-agent task's wall-clock time, tokens, and estimated cost go so that workflow optimization can be based on evidence rather than intuition.

The first product target is a Codex Windows Desktop plugin with a conversation-side performance panel showing live and completed-turn telemetry. The core contracts must remain agent/provider-neutral so future ADCP integrations can add Codex CLI, Claude, Gemini, OpenRouter, or other agents/providers through adapters rather than redesigning the analyzer.

## v1 principles

- **Windows Desktop first.** Optimize the first vertical slice for Codex Windows Desktop.
- **Measure, do not guess.** Every derived metric records source and quality (`exact`, `derived`, `estimated`, or `unavailable`).
- **Wall time and aggregate work are different.** Parallel work must never be double-counted as wall-clock composition.
- **Local first and privacy preserving.** Do not persist prompts, source code, or tool output merely to produce telemetry.
- **No database in the initial Codex Desktop slice.** Replay Codex's durable artifacts where practical; introduce a persistent telemetry store when ADCP integration creates a demonstrated need.
- **Provider-neutral core.** Codex is the first adapter, not the data model.
- **Minimum necessary architecture.** New daemons, databases, queues, services, compatibility layers, and recovery machinery require evidence that a simpler design is insufficient.

## Planned v1 output

A side panel beside the active Codex conversation should ultimately explain:

- total turn wall time;
- model/API/inference timing where the source supports it;
- TTFT/TBT and output throughput;
- tool calls, categories, failures, and durations;
- waits, retries, concurrency, and unattributed time;
- input/cached/output/reasoning token usage;
- cache-hit ratio;
- provider-reported cost when available, otherwise clearly labeled estimates;
- subagent/parallel-work statistics;
- current-thread cumulative usage and performance.

## Project authority and execution

The repository is the durable project record. Start with:

- `AGENTS.md` — role/authority contract;
- `docs/00-PROJECT_CHARTER.md` — mission, scope, product boundaries;
- `docs/01-SYSTEM_REQUIREMENTS.md` — frozen v1 requirements;
- `docs/02-SYSTEM_ARCHITECTURE.md` — target architecture and module boundaries;
- `docs/03-DEVELOPMENT_MANAGEMENT.md` — autonomy, review, escalation, minimalism;
- `docs/04-MASTER_IMPLEMENTATION_PLAN.md` — full pre-authorized implementation sequence;
- `docs/05-TELEMETRY_DATA_CONTRACT.md` — provider-neutral normalized schema and metric semantics;
- `docs/06-WINDOWS_DESKTOP_INTEGRATION.md` — Codex Desktop integration design;
- `docs/07-ACCEPTANCE_TEST_PLAN.md` — project acceptance matrix;
- `docs/08-WORK_ORDER_PROTOCOL.md` — durable work-package protocol;
- `docs/09-REVIEW_CHECKLIST.md` — independent review checklist;
- `docs/10-ROADMAP.md` — v1 and post-v1 roadmap;
- `docs/11-SECURITY_PRIVACY.md` — local-data and trust-boundary requirements;
- `docs/12-ADCP_INTEGRATION_CONTRACT.md` — future ADCP/provider integration boundary;
- `docs/13-RESOURCE_BUDGETS.md` — performance/resource budgets;
- `docs/CURRENT_EXECUTION_PLAN.md` — current authorized work;
- `docs/work_orders/` — milestone-size work orders;
- `docs/adr/` — accepted architecture decisions.

## Current status

P0 capability/data-source spike is in progress. A minimal local MCP App with global and thread entrypoints renders in Windows Desktop. Version `0.2.2` adds a one-shot, read-only current-thread source probe; local tests pass, while Desktop host metadata transfer and a live data path remain unverified. See `docs/evidence/WO-0001-P0-CAPABILITY-PROBE.md` for the partial source matrix and evidence.

### P0 diagnostic probe

With Node.js installed, run `node plugins/codex-performance-profiler/scripts/probe.mjs --file <absolute-path-to-a-Codex-rollout.jsonl>`. The optional `--measure` flag reports one-shot process time and peak RSS to stderr. The JSON output aliases native IDs and includes only allowlisted telemetry fields. Do not commit or share raw rollout files.

To make the P0 plugin available in local Codex, register this repository as a marketplace with `codex plugin marketplace add .`, then install `codex-performance-profiler@codex-performance-profiler-local` using `codex plugin add`. The package includes a static MCP App view for side-panel capability testing; it is not the planned telemetry product. To rebuild the committed, dependency-free runtime bundle, run `npm ci` and `npm run build` from the repository root. Run `npm test` for the MCP protocol, privacy, and timestamp checks.
