# Grimoire Tooling Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Grimoire-managed projects a curated catalog + always-on rule + bootstrap CLI so agents reliably reach for the right skill / plugin / MCP, and so `grimoire init` wires those tools up.

**Architecture:** Add four managed content assets under `.agents/` (`tooling.json`, `skills/catalog.md`, `skills/find-skills/SKILL.md`, `rules/15-skills.md`). Extend `bin/grimoire.mjs` with a `bootstrap` step that (a) enables missing user-level plugins in `~/.claude/settings.json` — additive, backed-up, dry-run by default; (b) prints install hints for installer-based skills (mattpocock via skills.sh); (c) mirrors the vendored `find-skills` into the project `.claude/skills/`; (d) merges MCP servers into project `.mcp.json`. `init` calls bootstrap in dry-run mode; `sync` re-mirrors and prints a reminder.

**Tech Stack:** Node ≥18 (ESM, `node:test`, no deps). Markdown content assets. Cross-platform (Windows/macOS/Linux).

**Spec:** `docs/superpowers/specs/2026-05-30-grimoire-skills-teaching-design.md`

---

## File Structure

- Create `.agents/tooling.json` — bootstrap manifest (plugins / skills / mcp). Managed.
- Create `.agents/skills/catalog.md` — curated `task → capability` table + workflow chains. Managed.
- Create `.agents/skills/find-skills/SKILL.md` — vendored discovery skill. Managed.
- Create `.agents/rules/15-skills.md` — always-on rule pointing at the catalog. Managed.
- Modify `.agents/grimoire.manifest` — add `tooling.json` to managed paths.
- Modify `bin/grimoire.mjs` — add `os` import, `readTooling`, `mirrorProjectSkills`, `bootstrap` (plugins/skills/mcp), wire into `init`/`sync`/`help`/dispatch, `--apply` flag.
- Modify `test/cli.test.mjs` — add bootstrap + mirror + mcp tests (temp HOME, temp project).
- Modify `README.md` — document the tooling layer + `grimoire bootstrap`.

Convention reminders for the engineer:
- `enabledPlugins` keys in `~/.claude/settings.json` are `"<name>@<marketplace>"`, e.g. `"superpowers@claude-plugins-official"`.
- Claude Code discovers **project skills** at `<project>/.claude/skills/<name>/SKILL.md`.
- Claude Code reads **project MCP servers** from `<project>/.mcp.json` under key `mcpServers`.
- mattpocock skills install via skills.sh: `npx skills@latest add mattpocock/skills`, then run `/setup-matt-pocock-skills` once per repo (configures issue tracker, triage labels, doc layout). They are user-scoped, so bootstrap only prints the hint — it does not auto-run the installer.

---

## Task 1: Content assets + manifest entry

**Files:**
- Create: `.agents/tooling.json`
- Create: `.agents/skills/catalog.md`
- Create: `.agents/skills/find-skills/SKILL.md`
- Create: `.agents/rules/15-skills.md`
- Modify: `.agents/grimoire.manifest`
- Test: `test/cli.test.mjs` (extend the existing init test)

- [ ] **Step 1: Write `.agents/tooling.json`**

```json
{
  "plugins": [
    { "name": "superpowers", "marketplace": "claude-plugins-official", "scope": "user" },
    { "name": "skill-creator", "marketplace": "claude-plugins-official", "scope": "user" },
    { "name": "ecc", "marketplace": "ecc", "scope": "user" },
    { "name": "ui-ux-pro-max", "marketplace": "ui-ux-pro-max-skill", "scope": "user" },
    { "name": "andrej-karpathy-skills", "marketplace": "karpathy-skills", "scope": "user" },
    { "name": "pordee", "marketplace": "pordee", "scope": "user" },
    { "name": "caveman", "marketplace": "caveman", "scope": "user" }
  ],
  "skills": [
    { "name": "mattpocock", "install": "npx skills@latest add mattpocock/skills", "setup": "/setup-matt-pocock-skills", "source": "https://github.com/mattpocock/skills", "scope": "user" },
    { "name": "find-skills", "vendored": ".agents/skills/find-skills", "scope": "project" }
  ],
  "mcp": [
    { "name": "playwright", "server": { "command": "npx", "args": ["-y", "@playwright/mcp@latest"] } },
    { "name": "stitch", "server": { "command": "npx", "args": ["-y", "@google/stitch-mcp@latest"], "env": { "STITCH_API_KEY": "${STITCH_API_KEY}" } }, "note": "Google Stitch — needs STITCH_API_KEY" }
  ]
}
```

> NOTE on the `stitch` entry: confirm the real package/command via the Google Stitch MCP docs (WebFetch its setup page) and replace `server.command`/`server.args` with the confirmed values before shipping. Keep the `env`/`note` shape. `frontend-design` is intentionally absent (deprecated).

- [ ] **Step 2: Write `.agents/rules/15-skills.md`**

```markdown
# 15 — Use the right tool (skills / plugins / MCP)

Before improvising any non-trivial task, **consult `skills/catalog.md`** and invoke the primary
capability for the trigger. If the catalog does not cover it, run **`find-skills`** before
hand-rolling a solution. For multi-step work, run the matching **workflow chain** end to end — do
not stop early.

Precedence: this rule defers to `local/`. A project may swap a primary (e.g. pin
`superpowers:test-driven-development` instead of `tdd`) or disable a tool in `local/AGENTS.local.md`.

## Workflow chains

- **Feature:** `brainstorming → writing-plans → [using-git-worktrees] → tdd → verifier → ecc:code-review → ecc:pr`
- **Bugfix:** `diagnose → tdd (reproduce) → verifier → ecc:pr`
- **UI:** `stitch (mockup) → ui-ux-pro-max → react-test → ecc:frontend-a11y → playwright (visual) → verifier`
- **Architecture:** `improve-codebase-architecture → grill-with-docs → writing-plans → …`
- **Research-first:** `ecc:deep-research → brainstorming → …`

The required tools for this project are declared in `tooling.json`; run `grimoire bootstrap` to
install/enable them. The mattpocock engineering skills (`tdd`, `diagnose`, `to-prd`, `to-issues`,
`triage`, `improve-codebase-architecture`, `zoom-out`) require running `/setup-matt-pocock-skills`
once per repo first.
```

- [ ] **Step 3: Write `.agents/skills/catalog.md`**

```markdown
# Capability catalog

What to reach for, by trigger. **Primary** = default choice. **Alternates** = equivalents when the
primary is unavailable or you want a second opinion. Anything not here → run `find-skills`.

> The mattpocock engineering skills below require `/setup-matt-pocock-skills` once per repo
> (configures the issue tracker, triage label vocabulary, and doc layout they consume).

## Process & engineering

| When you are… | Primary | Alternates | Layer |
|---|---|---|---|
| starting a new feature | `superpowers:brainstorming` | — | skill |
| aligning before a change | `grill-me` / `grill-with-docs` | — | skill |
| writing the implementation plan | `superpowers:writing-plans` | `ecc:plan` | skill |
| writing code test-first | `tdd` | `superpowers:test-driven-development` | skill |
| chasing a hard bug / perf regression | `diagnose` | `superpowers:systematic-debugging` | skill |
| improving architecture (ball of mud) | `improve-codebase-architecture` | — | skill |
| understanding unfamiliar code | `zoom-out` | — | skill |
| compacting the session for handoff | `handoff` | — | skill |
| throwaway prototype to flesh out a design | `prototype` | — | skill |
| turning context into a PRD | `to-prd` | `ecc:plan-prd` | skill |
| breaking a plan into issues | `to-issues` | — | skill |
| triaging incoming issues | `triage` | — | skill |
| writing a new skill | `write-a-skill` | `skill-creator` | skill |
| isolating parallel work | `superpowers:using-git-worktrees` | `superpowers:dispatching-parallel-agents` | skill |

## Review, security, quality

| When you are… | Primary | Alternates | Layer |
|---|---|---|---|
| reviewing before merge | `ecc:code-review` | `superpowers:requesting-code-review`, `/code-review` | skill |
| auditing security-sensitive code | `ecc:security-review` | `ecc:security-scan` | skill |
| confirming work is done | `verifier` (Grimoire) | `superpowers:verification-before-completion` | subagent |
| cleaning dead code | `ecc:refactor-clean` | — | skill |
| running the quality gate | `ecc:quality-gate` | — | skill |

## Web / Next.js (pharmaceutical-hub)

| When you are… | Primary | Alternates | Layer |
|---|---|---|---|
| building a React component | `ecc:react-patterns` | `ecc:react-performance` | skill |
| reviewing React/TSX | `ecc:react-review` | — | skill |
| writing React tests | `ecc:react-test` | `tdd` | skill |
| fixing a React/Next build | `ecc:react-build` | `ecc:build-fix` | skill |
| Next.js / Turbopack specifics | `ecc:nextjs-turbopack` | — | skill |
| accessibility pass | `ecc:frontend-a11y` | `web-design-guidelines` | skill |
| designing an API | `ecc:api-design` | `ecc:backend-patterns` | skill |
| DB schema / queries | `ecc:postgres-patterns` | `ecc:prisma-patterns` | skill |
| DB migration | `ecc:database-migrations` | — | skill |

## Healthcare (both repos are medical)

| When you are… | Primary | Alternates | Layer |
|---|---|---|---|
| handling PHI / privacy | `ecc:healthcare-phi-compliance` | `ecc:hipaa-compliance` | skill |
| EMR/EHR data patterns | `ecc:healthcare-emr-patterns` | — | skill |
| clinical decision support | `ecc:healthcare-cdss-patterns` | — | skill |
| evaluating a health-AI feature | `ecc:healthcare-eval-harness` | — | skill |

## Design / UI

| When you are… | Primary | Alternates | Layer |
|---|---|---|---|
| designing UI/UX | `ui-ux-pro-max` | `andrej-karpathy` | skill |
| turning a mockup into UI code | `stitch` (MCP) | — | mcp |

> **Deprecated — do not use:** `frontend-design` (replaced by `ui-ux-pro-max`).

## Research, docs, MCP

| When you are… | Primary | Alternates | Layer |
|---|---|---|---|
| researching an unknown topic | `ecc:deep-research` | `exa` (MCP) | skill |
| looking up a library / API | `context7` (MCP) | `ecc:documentation-lookup` | mcp |
| browser QA / e2e / visual check | `playwright` (MCP) | `ecc:e2e-testing` | mcp |
| repo / PR operations | `ecc:pr` | `github` (MCP), `/pr` | skill |
| need a capability you lack | `find-skills` | — | skill |

## Communication

`pordee` (Thai-compressed) and `caveman` (terse) are session-level toggles set by the user.
```

- [ ] **Step 4: Write `.agents/skills/find-skills/SKILL.md`**

Vendor the upstream skill. Run:

Run: `node -e "fetch('https://raw.githubusercontent.com/vercel-labs/skills/main/skills/find-skills/SKILL.md').then(r=>r.text()).then(t=>require('fs').writeFileSync('.agents/skills/find-skills/SKILL.md',t)).catch(e=>{console.error('FETCH FAILED',e.message);process.exit(1)})"`

If the fetch fails (offline / URL moved), write this minimal wrapper instead so the path is never empty:

```markdown
---
name: find-skills
description: Use when the user asks "how do I do X", "find a skill for X", "is there a skill that can…", or wants to extend capabilities. Discovers and installs agent skills that may already exist.
---

# Find skills

When the user wants functionality that might exist as an installable skill:

1. Search the available skills list (and the plugin marketplaces) for the capability.
2. If a matching skill exists but is not installed, tell the user the exact install command.
3. If none exists, say so plainly before hand-rolling a solution.

Upstream source: https://github.com/vercel-labs/skills (skills/find-skills). Re-vendor with
`grimoire sync` when the template updates.
```

- [ ] **Step 5: Add `tooling.json` to the manifest**

In `.agents/grimoire.manifest`, add a line `tooling.json` to the managed-paths block (after `commands/`):

```
AGENTS.md
rules/
standards/
stack/
agents/
skills/
commands/
tooling.json
```

- [ ] **Step 6: Extend the init test to assert the new assets copy**

In `test/cli.test.mjs`, inside the existing `"init scaffolds…"` test, extend the loop array to include the new files:

```js
for (const p of ["AGENTS.md", "rules/00-always.md", "rules/15-skills.md", "agents/verifier.md", "commands/verify.md", "stack/web-app.md", "skills/catalog.md", "skills/find-skills/SKILL.md", "tooling.json"]) {
  assert.ok(fs.existsSync(path.join(a, p)), `missing ${p}`);
}
```

- [ ] **Step 7: Run tests**

Run: `node --test`
Expected: PASS (3 tests). The init test now also proves the new assets are managed + copied.

- [ ] **Step 8: Commit**

```bash
git add .agents/tooling.json .agents/skills .agents/rules/15-skills.md .agents/grimoire.manifest test/cli.test.mjs
git commit -m "feat: add tooling.json, capability catalog, find-skills, 15-skills rule"
```

---

## Task 2: Mirror vendored find-skills into project `.claude/skills/`

**Files:**
- Modify: `bin/grimoire.mjs` (add `mirrorProjectSkills`, call from `init`)
- Test: `test/cli.test.mjs`

- [ ] **Step 1: Write the failing test**

Add to `test/cli.test.mjs`:

```js
test("init mirrors find-skills into .claude/skills", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    const mirrored = path.join(dir, ".claude", "skills", "find-skills", "SKILL.md");
    assert.ok(fs.existsSync(mirrored), "find-skills must be mirrored for Claude Code discovery");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern="mirrors find-skills"`
Expected: FAIL — mirrored path does not exist.

- [ ] **Step 3: Implement `mirrorProjectSkills`**

In `bin/grimoire.mjs`, add after `copyInto` (around line 48):

```js
// Mirror vendored project-scoped skills into .claude/skills/ so Claude Code discovers them.
// Source is the project's own .agents/ (post-copy), so it works for both init and sync.
function mirrorProjectSkills(target) {
  const src = path.join(target, ".agents", "skills", "find-skills");
  if (!fs.existsSync(src)) return;
  const dest = path.join(target, ".claude", "skills", "find-skills");
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}
```

- [ ] **Step 4: Call it from `init`**

In `init`, after `ensureGitignore(dir);` (line 96), add:

```js
  mirrorProjectSkills(dir);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test --test-name-pattern="mirrors find-skills"`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add bin/grimoire.mjs test/cli.test.mjs
git commit -m "feat: mirror vendored find-skills into project .claude/skills"
```

---

## Task 3: `bootstrap` — plugin dry-run + skill install hints (read-only)

**Files:**
- Modify: `bin/grimoire.mjs` (add `os` import, `readTooling`, `claudeSettingsPath`, `readSettings`, `pluginKey`, `missingPlugins`, `bootstrap`, `--apply` parse, dispatch, help)
- Test: `test/cli.test.mjs`

- [ ] **Step 1: Write the failing test**

Add helpers near the top of `test/cli.test.mjs` (after the existing `run`):

```js
function runEnv(args, dir, home) {
  return execFileSync("node", [CLI, ...args, "--dir", dir], {
    encoding: "utf8",
    env: { ...process.env, HOME: home, USERPROFILE: home },
  });
}
function writeSettings(home, obj) {
  const p = path.join(home, ".claude", "settings.json");
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
  return p;
}
```

Then the test:

```js
test("bootstrap --dry-run lists missing plugins + skill hint and does not modify settings", () => {
  const dir = tmpProject();
  const home = tmpProject();
  try {
    run(["init"], dir);
    const sp = writeSettings(home, { enabledPlugins: { "pordee@pordee": true } });
    const before = fs.readFileSync(sp, "utf8");
    const out = runEnv(["bootstrap", "--dry-run"], dir, home);
    assert.match(out, /ecc@ecc/, "missing plugin reported");
    assert.match(out, /skills@latest add mattpocock/, "mattpocock install hint printed");
    assert.equal(fs.readFileSync(sp, "utf8"), before, "dry-run must not write settings");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(home, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern="bootstrap --dry-run"`
Expected: FAIL — `unknown command "bootstrap"`.

- [ ] **Step 3: Add the `os` import**

In `bin/grimoire.mjs`, the import block becomes:

```js
import fs from "node:fs";
import os from "node:os";
import { execFileSync } from "node:child_process";
```

- [ ] **Step 4: Add tooling + settings helpers**

After `readManifest` (around line 38), add:

```js
function readTooling() {
  return JSON.parse(fs.readFileSync(path.join(TEMPLATE_AGENTS, "tooling.json"), "utf8"));
}

function claudeSettingsPath() {
  return path.join(os.homedir(), ".claude", "settings.json");
}

function readSettings(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return {}; }
}

function pluginKey(pl) { return `${pl.name}@${pl.marketplace}`; }

function missingPlugins(tooling, settings) {
  const enabled = settings.enabledPlugins || {};
  return (tooling.plugins || []).filter((pl) => !enabled[pluginKey(pl)]);
}
```

- [ ] **Step 5: Add `parseArgs` flag**

Replace `parseArgs` (line 21-27) with:

```js
function parseArgs(argv) {
  const out = { cmd: argv[0], dir: process.cwd(), apply: false };
  for (let i = 1; i < argv.length; i++) {
    if (argv[i] === "--dir") out.dir = path.resolve(argv[++i]);
    else if (argv[i] === "--apply") out.apply = true;
    else if (argv[i] === "--dry-run") out.apply = false;
  }
  return out;
}
```

- [ ] **Step 6: Add the `bootstrap` function (dry-run plugins + skill hints)**

Add before `help` (around line 124):

```js
function bootstrap({ dir, apply }) {
  const tooling = readTooling();
  const sp = claudeSettingsPath();
  const settings = readSettings(sp);
  const missing = missingPlugins(tooling, settings);

  log(`grimoire bootstrap (${apply ? "apply" : "dry-run"})`);

  if (missing.length === 0) {
    log("  plugins: all required plugins already enabled.");
  } else {
    log("  plugins missing:");
    for (const pl of missing) log(`    - ${pluginKey(pl)}`);
    if (!apply) log(`  (dry-run) re-run with --apply to enable them in ${sp}`);
  }

  // Installer-based skills (e.g. mattpocock) are user-scoped — print the hint, never auto-run.
  for (const sk of tooling.skills || []) {
    if (sk.install) {
      log(`  skill ${sk.name}: install via \`${sk.install}\`` + (sk.setup ? `, then run ${sk.setup}` : ""));
    }
  }
}
```

- [ ] **Step 7: Wire dispatch + help**

In the dispatch switch add a case:

```js
  case "bootstrap": bootstrap(args); break;
```

In `help` add:

```js
  log("  bootstrap   enable required plugins / MCP / skills (dry-run; --apply to write)");
```

- [ ] **Step 8: Run test to verify it passes**

Run: `node --test --test-name-pattern="bootstrap --dry-run"`
Expected: PASS — output lists `ecc@ecc`, prints the mattpocock install hint, settings file unchanged.

- [ ] **Step 9: Commit**

```bash
git add bin/grimoire.mjs test/cli.test.mjs
git commit -m "feat: grimoire bootstrap (dry-run) reports missing plugins + skill hints"
```

---

## Task 4: `bootstrap --apply` — additive, backed-up, idempotent plugin enable

**Files:**
- Modify: `bin/grimoire.mjs` (`applyPlugins`, call from `bootstrap`)
- Test: `test/cli.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
test("bootstrap --apply enables missing plugins, backs up, is additive + idempotent", () => {
  const dir = tmpProject();
  const home = tmpProject();
  try {
    run(["init"], dir);
    const sp = writeSettings(home, { enabledPlugins: { "pordee@pordee": true } });

    runEnv(["bootstrap", "--apply"], dir, home);
    const after = JSON.parse(fs.readFileSync(sp, "utf8"));
    assert.equal(after.enabledPlugins["pordee@pordee"], true, "pre-existing entry preserved");
    assert.equal(after.enabledPlugins["ecc@ecc"], true, "missing entry added");
    assert.ok(fs.existsSync(sp + ".bak"), "a backup was written");

    const snapshot = fs.readFileSync(sp, "utf8");
    runEnv(["bootstrap", "--apply"], dir, home);
    assert.equal(fs.readFileSync(sp, "utf8"), snapshot, "second apply is a no-op");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(home, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern="bootstrap --apply enables"`
Expected: FAIL — `ecc@ecc` not added (apply branch not implemented).

- [ ] **Step 3: Implement `applyPlugins`**

Add after `missingPlugins`:

```js
function applyPlugins(sp, settings, missing) {
  if (missing.length === 0) return;
  if (fs.existsSync(sp)) fs.copyFileSync(sp, sp + ".bak");
  settings.enabledPlugins = settings.enabledPlugins || {};
  for (const pl of missing) settings.enabledPlugins[pluginKey(pl)] = true; // add only
  fs.mkdirSync(path.dirname(sp), { recursive: true });
  fs.writeFileSync(sp, JSON.stringify(settings, null, 2) + "\n");
}
```

- [ ] **Step 4: Call it from `bootstrap`**

In `bootstrap`, replace the `if (!apply) log(...)` line inside the plugins `else` block with:

```js
    if (apply) {
      applyPlugins(sp, settings, missing);
      log(`  enabled ${missing.length} plugin(s); backup at ${sp}.bak`);
    } else {
      log(`  (dry-run) re-run with --apply to enable them in ${sp}`);
    }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test --test-name-pattern="bootstrap --apply enables"`
Expected: PASS — `ecc@ecc` added, `pordee@pordee` preserved, `.bak` exists, second run no-op.

- [ ] **Step 6: Run the full suite**

Run: `node --test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add bin/grimoire.mjs test/cli.test.mjs
git commit -m "feat: bootstrap --apply enables plugins (additive, backed-up, idempotent)"
```

---

## Task 5: MCP merge into project `.mcp.json`

**Files:**
- Modify: `bin/grimoire.mjs` (`mergeMcp`, call from `bootstrap`)
- Test: `test/cli.test.mjs`

- [ ] **Step 1: Write the failing tests**

```js
test("bootstrap merges MCP servers into .mcp.json without clobbering existing", () => {
  const dir = tmpProject();
  const home = tmpProject();
  try {
    run(["init"], dir);
    const mcpPath = path.join(dir, ".mcp.json");
    fs.writeFileSync(mcpPath, JSON.stringify({ mcpServers: { custom: { command: "x" } } }, null, 2));

    runEnv(["bootstrap", "--apply"], dir, home);
    const merged = JSON.parse(fs.readFileSync(mcpPath, "utf8"));
    assert.ok(merged.mcpServers.custom, "existing server preserved");
    assert.ok(merged.mcpServers.playwright, "playwright server added");
    assert.ok(merged.mcpServers.stitch, "stitch server added");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test("bootstrap creates .mcp.json when absent", () => {
  const dir = tmpProject();
  const home = tmpProject();
  try {
    run(["init"], dir);
    runEnv(["bootstrap", "--apply"], dir, home);
    const created = JSON.parse(fs.readFileSync(path.join(dir, ".mcp.json"), "utf8"));
    assert.ok(created.mcpServers.playwright, "playwright present in fresh .mcp.json");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(home, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test --test-name-pattern="MCP|creates .mcp"`
Expected: FAIL — `.mcp.json` not created / servers absent.

- [ ] **Step 3: Implement `mergeMcp`**

Add after `applyPlugins`:

```js
// Additively merge MCP servers from tooling.json into the project .mcp.json. Never clobbers
// an existing server definition. Returns the names added + any unresolved ${ENV} placeholders.
function mergeMcp(target, tooling) {
  const file = path.join(target, ".mcp.json");
  const cur = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
  cur.mcpServers = cur.mcpServers || {};
  const added = [];
  const needsEnv = [];
  for (const m of tooling.mcp || []) {
    if (cur.mcpServers[m.name]) continue;
    cur.mcpServers[m.name] = m.server;
    added.push(m.name);
    for (const v of Object.values(m.server.env || {})) {
      const hit = String(v).match(/\$\{(\w+)\}/);
      if (hit && !process.env[hit[1]]) needsEnv.push(hit[1]);
    }
  }
  if (added.length) fs.writeFileSync(file, JSON.stringify(cur, null, 2) + "\n");
  return { added, needsEnv };
}
```

- [ ] **Step 4: Call it from `bootstrap`**

At the end of `bootstrap`, after the skills-hint loop, add:

```js
  if (apply) {
    const { added, needsEnv } = mergeMcp(dir, tooling);
    if (added.length) log(`  mcp: added ${added.join(", ")} to .mcp.json`);
    else log("  mcp: all servers already present.");
    for (const e of [...new Set(needsEnv)]) log(`  mcp: set ${e} in your environment before use.`);
  } else {
    const names = (tooling.mcp || []).map((m) => m.name).join(", ");
    log(`  (dry-run) mcp servers to ensure: ${names}`);
  }
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test --test-name-pattern="MCP|creates .mcp"`
Expected: PASS — custom server preserved, playwright + stitch added, fresh file created.

- [ ] **Step 6: Commit**

```bash
git add bin/grimoire.mjs test/cli.test.mjs
git commit -m "feat: bootstrap merges MCP servers into project .mcp.json"
```

---

## Task 6: Wire bootstrap into `init` (dry-run) and update `sync`

**Files:**
- Modify: `bin/grimoire.mjs` (`init` calls bootstrap dry-run; `sync` re-mirrors + reminder)
- Test: `test/cli.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
test("sync re-mirrors find-skills and reminds to run bootstrap", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    fs.rmSync(path.join(dir, ".claude"), { recursive: true, force: true }); // simulate drift
    const out = run(["sync"], dir);
    assert.ok(
      fs.existsSync(path.join(dir, ".claude", "skills", "find-skills", "SKILL.md")),
      "sync must re-mirror find-skills"
    );
    assert.match(out, /grimoire bootstrap/, "sync reminds to run bootstrap");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern="sync re-mirrors"`
Expected: FAIL — `.claude` not recreated / no reminder in output.

- [ ] **Step 3: Make `init` run a dry-run bootstrap**

In `init`, after `mirrorProjectSkills(dir);`, add:

```js
  bootstrap({ dir, apply: false });
```

(Function declarations hoist, so `bootstrap` being defined lower in the file is fine.)

- [ ] **Step 4: Update `sync` to re-mirror + remind**

In `sync`, after `stampVersion(destAgents);` (line 116), add:

```js
  mirrorProjectSkills(dir);
```

And append a reminder after the final `VERSION` log line:

```js
  log("  tooling.json may have changed; run `grimoire bootstrap` to apply plugin/MCP updates.");
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test --test-name-pattern="sync re-mirrors"`
Expected: PASS.

- [ ] **Step 6: Run the full suite**

Run: `node --test`
Expected: PASS (all tests green).

- [ ] **Step 7: Commit**

```bash
git add bin/grimoire.mjs test/cli.test.mjs
git commit -m "feat: init runs bootstrap dry-run; sync re-mirrors + reminds"
```

---

## Task 7: Document the tooling layer in README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add a "Tooling" section**

After the "Verification" section in `README.md`, add:

```markdown
## Tooling — skills, plugins & MCP

`.agents/tooling.json` declares the plugins, skills, and MCP servers a project relies on, and
`.agents/skills/catalog.md` maps `task → capability` (primary + alternates). The always-on rule
`rules/15-skills.md` makes consulting the catalog reflexive; anything uncovered is found via the
vendored `find-skills` skill.

```sh
# enable required plugins / MCP / skills (prints a plan; nothing is written)
npx github:<user>/grimoire bootstrap

# actually apply (additive, backs up ~/.claude/settings.json, never disables anything)
npx github:<user>/grimoire bootstrap --apply
```

`init` runs `bootstrap` in dry-run automatically and mirrors `find-skills` into `.claude/skills/`.
The mattpocock engineering skills install separately via `npx skills@latest add mattpocock/skills`
followed by `/setup-matt-pocock-skills`. Editing `~/.claude/settings.json` is a machine-wide change —
bootstrap defaults to dry-run, backs up first, and only adds.
```

- [ ] **Step 2: Sanity-run the suite**

Run: `node --test`
Expected: PASS (no code change).

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: document the tooling layer + grimoire bootstrap"
```

---

## Final verification

- [ ] **Run the full suite**

Run: `node --test`
Expected: all tests PASS (init+assets, mirror, bootstrap dry-run, apply, MCP merge ×2, sync).

- [ ] **Manual smoke (optional, real machine — read-only)**

Run: `node bin/grimoire.mjs init --dir <throwaway>` then `node bin/grimoire.mjs bootstrap --dir <throwaway>`.
Expected: prints missing plugins + mattpocock hint + MCP plan, writes nothing (dry-run).

- [ ] **Dispatch the verifier**

Spawn the `verifier` subagent on fresh context with: the spec, the diff, and the Definition-of-Done
checklist (every spec section has a passing test). Require `pass` before calling this done.
```
