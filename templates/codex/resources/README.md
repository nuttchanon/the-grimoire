# resources

Raw materials and external artifacts: datasets, vendor/API specs, database dumps, binary snapshots,
captured payloads — the inputs you reverse-engineer or extract from. Conclusions go in `evidence/`
and `reference/`; the raw stuff lives here.

## Large / secret / binary handling

- **Secret-bearing or PHI-bearing raw material** (dumps, captures, credential files) is **gitignored**
  — it must never enter git history. Add the path to the project `.gitignore`.
- **Huge or binary** artifacts: keep out of the repo (or use the project's large-file mechanism);
  don't bloat history.
- **Always keep a tracked `manifest.md`**: one row per resource — name, source/provenance, purpose,
  and whether it's tracked or gitignored. The manifest is the durable record even when the bytes are
  not in git, so a reader knows what exists and where to get it.

Never echo a secret / PHI from a resource into chat or agent output. See `.agents/standards/codex.md`.
