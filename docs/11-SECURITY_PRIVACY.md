# Security and Privacy Requirements

## 1. Default posture

The profiler is local-only observability. It should require less trust than Codex itself and must not become a new remote-control or data-export path.

## 2. Data minimization

Persist/analyze only what is needed for timing/usage/cost:
- IDs/timestamps/status;
- bounded model/provider/tool category metadata;
- token counts;
- durations;
- pricing metadata;
- sanitized error classes when needed.

Do not persist by default:
- prompts or assistant content;
- source/file contents;
- shell command text unless a bounded non-content classification cannot be produced otherwise;
- stdout/stderr/tool responses;
- secrets/tokens/cookies;
- local usernames, machine names, absolute profile/project paths;
- account email/ID.

## 3. Codex state

Codex-owned session/rollout/config files are read-only inputs. The profiler must not edit them, lock them for long periods, rotate them, or treat them as its own database.

## 4. Process/network boundary

No admin privileges. No public/inbound listener by default. No cloud telemetry export. If a local companion is required, prefer stdio/host-managed local IPC; any broader transport is architecture escalation.

## 5. Public repository evidence

Use synthetic fixtures or sanitized summaries. Never commit real rollout JSONL, private paths, machine/account identifiers, tokens, prompts, source code captured from user projects, or billing/account screenshots containing identifiers.

## 6. Cost/pricing data

Public provider pricing metadata is non-sensitive. Account-specific balances, credits, rate-limit state, or subscription identifiers must not be persisted to public evidence.

## 7. Failure behavior

Security/privacy uncertainty blocks only the affected telemetry feature. Codex execution remains usable without the profiler.
