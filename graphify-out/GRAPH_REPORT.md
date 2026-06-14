# Graph Report - .  (2026-06-14)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 146 nodes · 241 edges · 15 communities (11 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.7)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9ba3b53c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Working Process Rules|Working Process Rules]]
- [[_COMMUNITY_Agent Contract & Commands|Agent Contract & Commands]]
- [[_COMMUNITY_CLI Bootstrap & Plugins|CLI Bootstrap & Plugins]]
- [[_COMMUNITY_Package Manifest|Package Manifest]]
- [[_COMMUNITY_Init & Sync Commands|Init & Sync Commands]]
- [[_COMMUNITY_Index & Doctor Commands|Index & Doctor Commands]]
- [[_COMMUNITY_TypeScript Compiler Config|TypeScript Compiler Config]]
- [[_COMMUNITY_Architecture Decision Records|Architecture Decision Records]]
- [[_COMMUNITY_CLI Integration Tests|CLI Integration Tests]]
- [[_COMMUNITY_Blurb Extraction|Blurb Extraction]]
- [[_COMMUNITY_Guardrail Invariant Tests|Guardrail Invariant Tests]]
- [[_COMMUNITY_Lint Preset Tests|Lint Preset Tests]]
- [[_COMMUNITY_Codex Confirmed Values|Codex Confirmed Values]]
- [[_COMMUNITY_Surgical Changes Rule|Surgical Changes Rule]]

## God Nodes (most connected - your core abstractions)
1. `AGENTS.md master contract` - 17 edges
2. `init()` - 12 edges
3. `sync()` - 11 edges
4. `bootstrap()` - 10 edges
5. `Rule 30 — Verification` - 10 edges
6. `Rule 50 — Security` - 9 edges
7. `log()` - 8 edges
8. `compilerOptions` - 8 edges
9. `Rule 00 — Always` - 8 edges
10. `Capability catalog` - 8 edges

## Surprising Connections (you probably didn't know these)
- `seedRoot()` --calls--> `walk()`  [INFERRED]
  bin/grimoire.mjs → templates/tests/guardrail.invariants.test.ts
- `Standard — requirements` --references--> `codex decisions README`  [EXTRACTED]
  .agents/standards/requirements.md → codex/decisions/README.md
- `graphify retrieval tool` --shares_data_with--> `codex INDEX`  [INFERRED]
  .agents/stack/README.md → codex/INDEX.md
- `CLAUDE.md entry pointer` --references--> `AGENTS.md master contract`  [EXTRACTED]
  CLAUDE.md → .agents/AGENTS.md
- `Grimoire README` --references--> `grimoire CLI`  [INFERRED]
  README.md → .agents/NAVIGATOR.md

## Import Cycles
- None detected.

## Communities (15 total, 4 thin omitted)

### Community 0 - "Working Process Rules"
Cohesion: 0.11
Nodes (27): CI workflow template, codex decisions README, incident runbook template, clean-code lint preset, Rule 00 — Always, Rule 05 — Code quality, Rule 10 — Working process, Rule 20 — Modes (+19 more)

### Community 1 - "Agent Contract & Commands"
Cohesion: 0.14
Nodes (26): ADR 0001 per-folder INDEX, local AGENTS overrides, AGENTS.md master contract, CLAUDE.md entry pointer, checkpoint command, grimoire command, onboard command, present command (+18 more)

### Community 2 - "CLI Bootstrap & Plugins"
Cohesion: 0.17
Nodes (17): applyPlugins(), bootstrap(), claudeSettingsPath(), __dirname, INDEX_FOLDERS, LOCAL_INDEX_FOLDERS, mergedTooling(), mergeMcp() (+9 more)

### Community 3 - "Package Manifest"
Cohesion: 0.14
Nodes (13): author, bin, grimoire, description, engines, node, license, name (+5 more)

### Community 4 - "Init & Sync Commands"
Cohesion: 0.29
Nodes (11): backupAgents(), copyAgentsWholesale(), ensureGitignore(), init(), migrateLegacyLayout(), mirrorProjectSkills(), seedCodex(), seedRoot() (+3 more)

### Community 5 - "Index & Doctor Commands"
Cohesion: 0.31
Nodes (9): catalogDrift(), doctor(), fail(), generateIndexes(), help(), index(), log(), renderIndex() (+1 more)

### Community 6 - "TypeScript Compiler Config"
Cohesion: 0.22
Nodes (8): compilerOptions, exactOptionalPropertyTypes, forceConsistentCasingInFileNames, noFallthroughCasesInSwitch, noImplicitOverride, noUncheckedIndexedAccess, strict, verbatimModuleSyntax

### Community 7 - "Architecture Decision Records"
Cohesion: 0.39
Nodes (8): ADR 0002 tiered knowledge, ADR 0003 context-engineering vocab, ADR 0004 GraphRAG retrieval, ADR 0005 codex knowledge base, ADR 0006 delegate retrieval, graphify retrieval tool, Roadmap, Stack README

### Community 9 - "Blurb Extraction"
Cohesion: 0.40
Nodes (4): blurbFor(), cleanBlurb(), firstSentence(), indexEntries()

### Community 10 - "Guardrail Invariant Tests"
Cohesion: 0.50
Nodes (3): scan(), SRC, walk()

## Knowledge Gaps
- **36 isolated node(s):** `__dirname`, `TEMPLATE_ROOT`, `TEMPLATE_AGENTS`, `TEMPLATES_DIR`, `INDEX_FOLDERS` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AGENTS.md master contract` connect `Agent Contract & Commands` to `Working Process Rules`, `Architecture Decision Records`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `Rule 50 — Security` connect `Working Process Rules` to `Agent Contract & Commands`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `Rule 00 — Always` connect `Working Process Rules` to `Agent Contract & Commands`, `Architecture Decision Records`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `__dirname`, `TEMPLATE_ROOT`, `TEMPLATE_AGENTS` to the rest of the system?**
  _37 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Working Process Rules` be split into smaller, more focused modules?**
  _Cohesion score 0.10541310541310542 - nodes in this community are weakly interconnected._
- **Should `Agent Contract & Commands` be split into smaller, more focused modules?**
  _Cohesion score 0.13846153846153847 - nodes in this community are weakly interconnected._
- **Should `Package Manifest` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._