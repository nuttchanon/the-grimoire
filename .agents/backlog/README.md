# QUEUE — backlog

One work item per file: `backlog/<id>.md`. Frontmatter:

```
---
id: <kebab-id>
status: open        # open | active | blocked | done
priority: normal    # normal | hotfix
---
```

- **Hotfix is a priority flag, not a separate tree.** A hotfix item carries a cleanup checklist
  (tests to backfill, env flag to remove, ADR if implied).
- Done → move the file to `backlog/done/` with close-out evidence (ADR link, test reproducer,
  sign-off) inside it.

Routing (chat → item) is defined in `rules/40-handoff.md`.
