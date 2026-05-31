---
updated: 2026-05-31
description: Server-side authorization, no hardcoded secrets/roles, fail closed.
---

# 50 — Security

- **Permissions via helpers, not literals.** Authorize through a single helper/policy layer.
  Never `if (role === "admin")` scattered across the code.
- **Validate + authorize on the server.** Client checks are UX only; the server is the boundary.
  Validate every input; reject by default.
- **Fail closed.** On error, missing data, or unknown state → deny, do not allow.
- **Parameterized queries only.** Never string-concatenate SQL or shell. No dynamic `eval`.
- **No secrets in code or logs.** Secrets come from env/secret-store. Never commit them; never log
  them. Scrub before logging.
- **Least privilege.** Tokens, DB roles, and API scopes get the minimum needed.
- **Row-level authorization.** Every user row is restricted to its owner (Postgres/Supabase RLS or
  an app-layer check). **Default-deny** — zero policies means a wide-open database.
- **Test the abuse paths.** Wrong password, reset for a non-existent email (no user enumeration),
  expired session, malformed/oversized input — not just the happy path.
- **Security headers.** Set CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy.
- **Privacy by default.** Collect the minimum personal data, know where it lives, publish a privacy
  policy (GDPR/CCPA/PDPA; PHI → HIPAA).
- **Validate env at startup.** Required env vars are checked at the init boundary with a clear error — never `process.env.X!` at use sites.
- **Secrets at rest.** Desktop/native apps store secrets in the OS keystore (Electron `safeStorage` / OS keychain), never plaintext on disk.
- **Dependencies.** Pin versions; review before adding; prefer the std lib when it suffices.

**Before launching a user-facing, data-collecting app:** clear `standards/launch-security-checklist.md`
(privacy · row-level authz · abuse-path tests · server validation · headers · OWASP) and run a SAST
scan (`standards/security-scanners.md`). This is part of Definition of Done (`rules/30-verification.md`).
