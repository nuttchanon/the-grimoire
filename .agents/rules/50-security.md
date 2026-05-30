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
- **Dependencies.** Pin versions; review before adding; prefer the std lib when it suffices.
