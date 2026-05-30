# Security scanners (SAST)

Linters find what is ugly; **SAST** finds what is exploitable — SQLi, XSS, RCE, path traversal,
hardcoded secrets, weak crypto. Pick by language, run in CI, fail on High/Critical. OSS unless noted.

| Scanner | Scope | Use when |
|---|---|---|
| **Semgrep** | pattern-based, 30+ languages | default for any project (incl. TS/JS) |
| **njsscan** | JS / Node / React Native | Next.js, Electron, React Native |
| **CodeQL** | semantic taint-tracking, GitHub-native | any repo on GitHub (free for public) — enable Code Scanning |
| **Bandit** | Python | any Python service |
| **Brakeman** | Ruby on Rails | Rails apps |
| **gosec** | Go | Go services |
| **Snyk Code** | AI-assisted, inline fixes (freemium) | optional, on top of the above |

## For this org''s stacks (TypeScript · Next.js · Electron)

Run **Semgrep + njsscan** in CI and enable **CodeQL** Code Scanning on GitHub. Add **Bandit** if a
Python service appears.

## CI wiring (sketch)

- Semgrep: `semgrep ci` (or `semgrep --config auto`) as a job; fail on findings.
- CodeQL: GitHub → Security → Code scanning → enable, or the `github/codeql-action` workflow.
- njsscan: `njsscan --exit-on-warn .`

Pre-launch: clear High/Critical and wire the scan into `standards/launch-security-checklist.md`.
