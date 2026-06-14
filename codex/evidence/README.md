# evidence

Where investigation lands: reverse-engineering a legacy binary, extracting values from a vendor spec,
reading a database dump, recovering a protocol. These docs are the **paper trail** behind every
confirmed fact in `domain/`, `reference/`, and `requirements/`.

## Provenance discipline (in brief)

- Every finding cites its **source** — file + offset/record — and a **CONFIRMED | INFERRED** tag.
- What you couldn't recover is listed explicitly under "Not recovered" — silence is not a finding.
- No unsourced guesses. An `INFERRED` row stays inferred until a source confirms it.
- Never paste a real secret / PHI into an evidence doc; record its **location and purpose**, not its
  value (see `resources/README.md` + `.agents/standards/codex.md`).

Copy `0000-extraction-template.md` per run. Full standard: `.agents/standards/codex.md`.
