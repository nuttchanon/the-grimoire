# 05 — Code quality (standards overview)

- **Small files.** Split when a file grows past its single responsibility. Prefer many small,
  named modules over one large one.
- **Minimal comments — why, not what.** Code says *what*; comments explain *why* only when
  non-obvious. Delete comments that restate the code.
- **DRY, but not prematurely.** Extract on the *third* repetition, not the first.
- **YAGNI.** Build for today's requirement. No speculative abstraction, config, or hooks.
- **Naming mirrors the domain.** Names come from the problem domain, not the implementation.
  Match the surrounding code's idiom, casing, and comment density.

Full standards: `standards/general.md` + the per-language file.
