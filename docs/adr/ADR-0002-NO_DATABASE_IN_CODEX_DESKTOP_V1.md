# ADR-0002 — No project-owned database in Codex Desktop v1

Status: Accepted

## Decision

Initial Codex Desktop v1 uses in-memory state plus replay of Codex-owned durable artifacts where practical. No SQLite/Postgres/other database is added.

## Why

The first objective is accurate turn profiling, not long-term fleet analytics. A database creates schema/migration/lifecycle/privacy burden before a demonstrated need.

## Consequences

The core exposes a narrow store abstraction so ADCP integration can later add SQLite without changing metric semantics. A bounded cache/append-only file before then requires explicit evidence that native artifacts cannot supply necessary recovery/history.
