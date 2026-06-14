# Incident runbook — <service / app name>

The on-call answer to "production is broken — what now." Required by the launch-security checklist
(`.agents/standards/launch-security-checklist.md`). Keep it short, current, and runnable under stress.
Copy to `codex/runbooks/<service>.md`.

## At a glance

- **Service:** <name + one line on what it does>
- **Owners / on-call:** <names / rotation / how to reach>
- **Dashboards:** <links — metrics, logs, error tracker, uptime>
- **Status page / comms channel:** <where incidents are announced>

## Severity levels

| Sev | Meaning | Response |
|---|---|---|
| SEV1 | Full outage / data loss / security breach | Page now; all hands; comms immediately |
| SEV2 | Major feature down / degraded for many | Page on-call; fix within hours |
| SEV3 | Minor / workaround exists | Next business day |

## First 15 minutes

1. **Acknowledge** — claim the incident so others know it's owned.
2. **Assess severity** (table above) and **declare** in the comms channel.
3. **Stabilize, don't fix yet** — stop the bleeding: roll back the last release (see
   `.agents/standards/release-versioning.md` → rollback), flip the feature flag off
   (`.agents/rules/20-modes.md` HOTFIX), or scale/restart. Recovery beats root-cause under SEV1/2.
4. **Communicate** — short status update; repeat on a cadence until resolved.

## Diagnose

- Check the dashboards above; read logs by **error code**, not message text
  (`.agents/standards/observability.md` + `standards/error-codes.md`).
- What changed? Last deploy/tag, last migration, last flag flip, upstream provider status.
- Reproduce on the smallest input that triggers it.

## Common failure modes

<!-- Fill in per service: symptom → likely cause → action. This is the highest-value section. -->
| Symptom | Likely cause | Action |
|---|---|---|
| <e.g. 5xx spike after deploy> | <bad release> | <roll back to previous tag> |
| <DB connection errors> | <pool exhausted / provider down> | <check provider; restart; raise pool> |

## Recovery & rollback

- **Roll back a release:** `<exact command / steps; previous-good-tag location>`.
- **Disable a feature:** `<flag name + how to flip>`.
- **Restore data:** `<backup location, restore procedure, last-known-good>`.

## After: post-incident

- Write a blameless post-mortem: timeline, impact, root cause, what made it worse/better, action
  items with owners.
- File the action items in `backlog/` (`.agents/rules/40-handoff.md`).
- If the root cause was an unrecorded assumption or a ground-truth value, update the owning doc /
  ADR / requirement the same turn (`.agents/rules/00-always.md`).
