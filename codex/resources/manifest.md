# Resource manifest

One row per resource — tracked **and** gitignored. The durable record of what exists and where to get
it, even when the bytes aren't in git. Keep it current.

| resource | source / provenance | purpose | git status |
|---|---|---|---|
| `<path or name>` | <where it came from> | <what it's used for> | tracked \| gitignored |

<!-- For gitignored secret/PHI-bearing material: record location + purpose only here; the value lives
     in the gitignored inventory, never in a tracked doc. -->
