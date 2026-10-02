---
name: profiler-probe
description: Inspect a Codex rollout file read-only and report a sanitized turn capability summary for the Codex Performance Profiler P0 spike.
---

# Profiler probe

Run `node scripts/probe.mjs --file <absolute-rollout-jsonl-path>` from this plugin's root. The probe prints only allowlisted telemetry fields; do not paste raw rollout records into chat, logs, issues, or commits. Use a completed harmless turn and record the exact app/plugin versions separately. The output is a capability probe, not a live side panel. Treat missing timing as unavailable and never call residual wall time thinking time.
