# Requirements

The project's requirements as a tracked, referenceable artifact. Project-owned: `grimoire sync` never
touches this folder (seeded once by `grimoire init`). Full protocol:
`.agents/standards/requirements.md`.

## Files

| Path | Holds |
|---|---|
| `base.md` | The baseline — what the system must do **now**. Changed only via an applied addon/CR. |
| `addons/<id>-<slug>.md` | A new capability layered on the base (copy `addons/0000-template.md`). |
| `changes/<id>-<slug>.md` | A change request modifying existing requirements (copy `changes/0000-template.md`). |

## Rules of the road

- Every requirement has a stable id `REQ-<AREA>-<NNN>` — sequential per area, **never reused or
  renumbered**. A removed requirement becomes `status: withdrawn`; its row stays.
- Cite the id in commits (`implements REQ-…`), test names, and the ADR that decided *how*.
- The **base always reflects now**; addons and CRs are the **audit trail** of how it got there.
  Never change a requirement in `base.md` without a matching addon/CR file recording the diff.
- A requirement must be a **testable** statement. If it can't be verified, it isn't finished.
