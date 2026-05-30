# Launch security checklist

A pre-launch gate for any app that collects user data. Do not ship to real users until every item
passes — legal and breach exposure scale with user count, so clear these before marketing.

## 1. Privacy & data map
- Publish a privacy policy (GDPR / CCPA / PDPA as applicable). PHI → HIPAA (see `skills/catalog.md`
  Healthcare).
- Keep a data map: what personal data you collect, where it lives, who can read it, retention.
- Collect the minimum; delete what you do not need.

## 2. Row-level authorization on every user table
- Each row is restricted to its authenticated owner (Postgres/Supabase RLS, or app-layer checks).
- **Default-deny** — zero policies = a wide-open database. Verify one user cannot read another
  user''s rows (open DevTools / hit the API as user B).

## 3. Failure / abuse-path tests (not just the happy path)
- Wrong password ×N (lockout/backoff), reset for a non-existent email (no user enumeration),
  expired / missing session, malformed / oversized / injection input. Attackers probe these first.

## 4. Server-side validation on every write route
- Validate **and** authorize on the server. Client (zod) validation is UX only — attackers call the
  API directly with JS disabled.

## 5. Security headers + OWASP review
- Set headers: CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy.
- Run an OWASP Top 10 review (injection, broken auth, broken access control, XSS, SSRF…) via
  `ecc:security-review` / `ecc:security-scan`.

## 6. SAST scan
- Run a static analysis scanner in CI and fix **High/Critical** before launch.
  See `standards/security-scanners.md`.

**Gate:** for any user-facing, data-collecting app this checklist is part of the Definition of Done
(`rules/30-verification.md`).
