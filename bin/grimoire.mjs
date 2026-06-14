#!/usr/bin/env node
// Grimoire CLI — init a project with the agent template, or sync template updates.
// Self-contained, no deps. Node >=18.

import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { execFileSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_ROOT = path.resolve(__dirname, "..");
const TEMPLATE_AGENTS = path.join(TEMPLATE_ROOT, ".agents");
const TEMPLATES_DIR = path.join(TEMPLATE_ROOT, "templates");

function log(msg) { process.stdout.write(msg + "\n"); }
function fail(msg) { process.stderr.write("grimoire: " + msg + "\n"); process.exit(1); }

function parseArgs(argv) {
  const out = { cmd: argv[0], dir: process.cwd(), apply: false, check: false };
  for (let i = 1; i < argv.length; i++) {
    if (argv[i] === "--dir") out.dir = path.resolve(argv[++i]);
    else if (argv[i] === "--apply") out.apply = true;
    else if (argv[i] === "--dry-run") out.apply = false;
    else if (argv[i] === "--check") out.check = true;
  }
  return out;
}

function readTooling() {
  return JSON.parse(fs.readFileSync(path.join(TEMPLATE_AGENTS, "tooling.json"), "utf8"));
}

// Optional project-owned tooling at .agents/local/tooling.json (same shape as the base:
// { plugins, skills, mcp }). Lets a project declare its own plugins / MCP (Linear, Sentry,
// Supabase, Figma, …) without bloating the base. Returns null if absent/invalid (doctor flags it).
function readLocalTooling(dir) {
  const file = path.join(dir, "local", "tooling.json");
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; }
}

// Base ∪ local tooling: base wins on a key conflict; local entries with a new key are added.
function mergedTooling(dir) {
  const base = readTooling();
  const local = readLocalTooling(dir);
  if (!local) return base;
  const merge = (a = [], b = [], key) => {
    const m = new Map();
    for (const x of a) m.set(key(x), x);
    for (const x of b) if (!m.has(key(x))) m.set(key(x), x);
    return [...m.values()];
  };
  return {
    plugins: merge(base.plugins, local.plugins, pluginKey),
    skills: merge(base.skills, local.skills, (s) => s.name),
    mcp: merge(base.mcp, local.mcp, (m) => m.name),
  };
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

function applyPlugins(sp, settings, missing) {
  if (missing.length === 0) return;
  if (fs.existsSync(sp)) fs.copyFileSync(sp, sp + ".bak");
  settings.enabledPlugins = settings.enabledPlugins || {};
  for (const pl of missing) settings.enabledPlugins[pluginKey(pl)] = true; // add only
  fs.mkdirSync(path.dirname(sp), { recursive: true });
  fs.writeFileSync(sp, JSON.stringify(settings, null, 2) + "\n");
}

// Collect unresolved ${ENV} placeholders anywhere in a server definition (env for stdio servers,
// headers/url for http servers, etc.). Recurses over strings so transport shape does not matter.
function unresolvedEnv(node, out) {
  if (typeof node === "string") {
    for (const m of node.matchAll(/\$\{(\w+)\}/g)) if (!process.env[m[1]]) out.push(m[1]);
  } else if (Array.isArray(node)) {
    for (const v of node) unresolvedEnv(v, out);
  } else if (node && typeof node === "object") {
    for (const v of Object.values(node)) unresolvedEnv(v, out);
  }
  return out;
}

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
    unresolvedEnv(m.server, needsEnv);
  }
  if (added.length) fs.writeFileSync(file, JSON.stringify(cur, null, 2) + "\n");
  return { added, needsEnv };
}

// Safety net for adopting a project that already has an .agents/: copy the whole
// tree to a sibling .agents.bak-<stamp>/ before init overwrites managed paths.
// Returns the backup path, or null if there was nothing to back up.
function backupAgents(destAgents) {
  if (!fs.existsSync(destAgents)) return null;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const bak = `${destAgents}.bak-${stamp}`;
  fs.cpSync(destAgents, bak, { recursive: true });
  return bak;
}

// One-time migration from the old layout (.agents/{memory,backlog,session,local}) to the new root
// layout (journal/{memory,backlog,session}, local/). Backs up the whole .agents/ once, then moves
// each legacy dir only if its new home is absent. On conflict the legacy copy stays in .agents/
// (preserved in the backup) and is reported. Idempotent: a no-op once the legacy dirs are gone.
function migrateLegacyLayout(dir) {
  const destAgents = path.join(dir, ".agents");
  const moves = [
    ["memory", path.join("journal", "memory")],
    ["backlog", path.join("journal", "backlog")],
    ["session", path.join("journal", "session")],
    ["local", "local"],
  ];
  const legacy = moves.filter(([from]) => fs.existsSync(path.join(destAgents, from)));
  if (!legacy.length) return null;
  const bak = backupAgents(destAgents);
  const moved = [];
  const conflicts = [];
  for (const [from, to] of legacy) {
    const dst = path.join(dir, to);
    if (fs.existsSync(dst)) { conflicts.push(from); continue; }
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.renameSync(path.join(destAgents, from), dst);
    moved.push(`${from} -> ${to}`);
  }
  return { bak, moved, conflicts };
}

// Wholesale replace of the managed contract: delete .agents/ and copy the entire template .agents/.
// Safe because nothing project-owned lives under .agents/ anymore (migration moved it to root).
function copyAgentsWholesale(destAgents) {
  fs.rmSync(destAgents, { recursive: true, force: true });
  fs.cpSync(TEMPLATE_AGENTS, destAgents, { recursive: true });
}

// Mirror project-discoverable skills into .claude/skills/ so Claude Code finds them: the vendored
// base skill (find-skills, under .agents/) plus every project-only skill under root local/skills/.
// Runs for both init and sync.
function mirrorProjectSkills(target) {
  const sources = [path.join(target, ".agents", "skills", "find-skills")];
  const localSkills = path.join(target, "local", "skills");
  if (fs.existsSync(localSkills)) {
    for (const e of fs.readdirSync(localSkills, { withFileTypes: true })) {
      if (e.isDirectory()) sources.push(path.join(localSkills, e.name));
    }
  }
  for (const src of sources) {
    if (!fs.existsSync(src)) continue;
    const dest = path.join(target, ".claude", "skills", path.basename(src));
    fs.rmSync(dest, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.cpSync(src, dest, { recursive: true });
  }
}

function templateSha() {
  try {
    return execFileSync("git", ["-C", TEMPLATE_ROOT, "rev-parse", "--short", "HEAD"], {
      encoding: "utf8",
    }).trim();
  } catch {
    return "unknown";
  }
}

function stampVersion(destAgents) {
  const base = fs.readFileSync(path.join(TEMPLATE_AGENTS, "VERSION"), "utf8").split(/\r?\n/)[0];
  const stamp = `${base}\nsha: ${templateSha()}\n`;
  fs.writeFileSync(path.join(destAgents, "VERSION"), stamp);
}

function ensureGitignore(target) {
  const snippet = fs.readFileSync(path.join(TEMPLATES_DIR, "gitignore-snippet.txt"), "utf8").trimEnd();
  const file = path.join(target, ".gitignore");
  const cur = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  if (cur.includes("journal/session/")) return;
  fs.writeFileSync(file, (cur ? cur.replace(/\s*$/, "") + "\n\n" : "") + snippet + "\n");
}

function writePointer(target) {
  const dest = path.join(target, "CLAUDE.md");
  if (fs.existsSync(dest)) {
    log("  skip CLAUDE.md (exists) — ensure it imports @.agents/AGENTS.md");
    return;
  }
  fs.copyFileSync(path.join(TEMPLATES_DIR, "CLAUDE.md"), dest);
}

// Seed a project-owned root folder from templates/, filling only ABSENT files (never overwrites
// a file the project already has). Generalizes the old per-file seed; used for journal/ and local/.
// Unlike seedCodex (dir-level seed-once), this fills gaps — e.g. journal/ exists but lacks MEMORY.md.
function seedRoot(name, target) {
  const src = path.join(TEMPLATES_DIR, name);
  if (!fs.existsSync(src)) return;
  const walk = (s, d) => {
    fs.mkdirSync(d, { recursive: true });
    for (const e of fs.readdirSync(s, { withFileTypes: true })) {
      const sp = path.join(s, e.name);
      const dp = path.join(d, e.name);
      if (e.isDirectory()) walk(sp, dp);
      else if (!fs.existsSync(dp)) fs.copyFileSync(sp, dp);
    }
  };
  walk(src, path.join(target, name));
}

// Seed the project's knowledge base once: copy templates/codex/ → <target>/codex/ (at the repo
// ROOT, not under .agents/) only when the destination is absent. codex/ is project-owned — it holds
// domain, requirements, decisions, evidence, resources, reference, and runbooks — and lives outside
// every managed path, so `grimoire sync` never touches it. Seed-once, like the old doc trees.
function seedCodex(target) {
  const dest = path.join(target, "codex");
  const src = path.join(TEMPLATES_DIR, "codex");
  if (fs.existsSync(dest) || !fs.existsSync(src)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

function init({ dir }) {
  const destAgents = path.join(dir, ".agents");

  // Auto-migrate an old-layout project before touching .agents/.
  const mig = migrateLegacyLayout(dir);

  copyAgentsWholesale(destAgents);

  stampVersion(destAgents);
  writePointer(dir);
  ensureGitignore(dir);
  seedCodex(dir);            // codex/ at repo ROOT — project-owned, seed-once
  seedRoot("journal", dir);  // journal/{memory,backlog,session} — project-owned, per-file seed
  seedRoot("local", dir);    // local/ override config — project-owned, per-file seed
  mirrorProjectSkills(dir);
  generateIndexes(dir);      // after all mutations, so a freshly-seeded local/ is indexed

  if (mig && mig.bak) log("  migrated old layout; backed up .agents/ -> " + path.basename(mig.bak) + "/");
  if (mig && mig.moved.length) log("  moved: " + mig.moved.join(", "));
  if (mig && mig.conflicts.length) log("  conflict (kept in backup, not moved): " + mig.conflicts.join(", "));
  log("grimoire init: scaffolded .agents/ (read-only contract) + CLAUDE.md + codex/ + journal/ + local/");
  log("  contract (managed, wholesale-synced): .agents/");
  log("  project-owned (seeded if absent): codex/ journal/ local/");
  log("  next: set the active stack profile + testing policy in local/AGENTS.local.md");

  bootstrap({ dir, apply: false });
}

function sync({ dir }) {
  const destAgents = path.join(dir, ".agents");
  if (!fs.existsSync(destAgents)) fail("no .agents/ here — run `grimoire init` first.");

  const oldVersion = (() => {
    try { return fs.readFileSync(path.join(destAgents, "VERSION"), "utf8").trim(); }
    catch { return "(none)"; }
  })();

  // Migrate an old-layout project first, then wholesale-replace the contract.
  const mig = migrateLegacyLayout(dir);
  copyAgentsWholesale(destAgents);
  stampVersion(destAgents);
  // Fill any newly-introduced project-owned scaffolding without clobbering existing files.
  seedCodex(dir);
  seedRoot("journal", dir);
  seedRoot("local", dir);
  mirrorProjectSkills(dir);
  generateIndexes(dir);      // after all mutations, so newly-seeded files are indexed

  if (mig && mig.bak) log("  migrated old layout; backed up .agents/ -> " + path.basename(mig.bak) + "/");
  if (mig && mig.moved.length) log("  moved: " + mig.moved.join(", "));
  if (mig && mig.conflicts.length) log("  conflict (kept in backup, not moved): " + mig.conflicts.join(", "));
  log("grimoire sync: wholesale-replaced the .agents/ contract from template.");
  log("  untouched (project-owned): codex/ journal/ local/");
  log("  VERSION: " + oldVersion.split(/\r?\n/)[0] + "  ->  sha " + templateSha());
  log("  tooling.json may have changed; run `grimoire bootstrap` to apply plugin/MCP updates.");
}

function bootstrap({ dir, apply }) {
  const tooling = mergedTooling(dir); // base ∪ .agents/local/tooling.json
  const sp = claudeSettingsPath();
  const settings = readSettings(sp);
  const missing = missingPlugins(tooling, settings);

  log(`grimoire bootstrap (${apply ? "apply" : "dry-run"})`);

  if (missing.length === 0) {
    log("  plugins: all required plugins already enabled.");
  } else {
    log("  plugins missing:");
    for (const pl of missing) log(`    - ${pluginKey(pl)}`);
    if (apply) {
      applyPlugins(sp, settings, missing);
      log(`  enabled ${missing.length} plugin(s); backup at ${sp}.bak`);
    } else {
      log(`  (dry-run) re-run with --apply to enable them in ${sp}`);
    }
  }

  // Installer-based skills (e.g. mattpocock) are user-scoped — print the hint, never auto-run.
  for (const sk of tooling.skills || []) {
    if (sk.install) {
      log(`  skill ${sk.name}: install via \`${sk.install}\`` + (sk.setup ? `, then run ${sk.setup}` : ""));
    }
  }

  if (apply) {
    const { added, needsEnv } = mergeMcp(dir, tooling);
    if (added.length) log(`  mcp: added ${added.join(", ")} to .mcp.json`);
    else log("  mcp: all servers already present.");
    for (const e of [...new Set(needsEnv)]) log(`  mcp: set ${e} in your environment before use.`);
  } else {
    const names = (tooling.mcp || []).map((m) => m.name).join(", ");
    log(`  (dry-run) mcp servers to ensure: ${names}`);
  }
}

// --- index: per-folder INDEX.md (a generated table of contents) ----------------------------------
// Two-level progressive disclosure: AGENTS.md map -> folder INDEX.md (one line per file) -> file.
// Generated, never hand-edited, so it cannot drift; `grimoire index --check` fails CI on staleness.
const INDEX_FOLDERS = ["rules", "standards", "stack", "commands", "agents", "skills"];
// Same INDEX tooling for the project's own customization layer under local/.
const LOCAL_INDEX_FOLDERS = ["rules", "standards", "stack", "commands", "skills", "reference"];

function firstSentence(s) {
  const m = s.match(/^[\s\S]*?[.!?](\s|$)/);
  let out = (m ? m[0] : s).replace(/\s+/g, " ").trim();
  if (out.length > 140) out = out.slice(0, 139).trimEnd() + "…";
  return out;
}

// Normalize a blurb fragment to clean plain text: drop a leading list marker, emphasis/code
// markers, and a trailing colon. Pure + exported for unit testing.
export function cleanBlurb(s) {
  return s
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/, "")   // drop a leading list marker
    .replace(/\*\*|__|[*_`]/g, "")            // drop emphasis/code markers
    .replace(/\s*:\s*$/, "")                  // drop a trailing colon only (keep inner ones, e.g. "Modes: NORMAL")
    .replace(/\s+/g, " ")
    .trim();
}

// One-line blurb for a file: frontmatter `description:` if present, else H1 title (minus any
// leading "NN — " numbering) joined with the first sentence of the first paragraph.
function blurbFor(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fm) {
    const d = fm[1].match(/^description:\s*(.+)$/m);
    if (d) return cleanBlurb(firstSentence(d[1].trim().replace(/^["']|["']$/g, "")));
  }
  const lines = text.split(/\r?\n/);
  let title = "";
  let i = 0;
  for (; i < lines.length; i++) {
    const h = lines[i].match(/^#\s+(.+)$/);
    if (h) { title = cleanBlurb(h[1].replace(/^\d+\s*[—-]\s*/, "").trim()); i++; break; }
  }
  let para = "";
  for (; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l) { if (para) break; else continue; }
    if (l.startsWith("#")) break;
    para += (para ? " " : "") + l;
  }
  const sent = para ? cleanBlurb(firstSentence(para)) : "";
  if (title && sent) return `${title} — ${sent}`;
  return title || sent || "(no description)";
}

function indexEntries(dir) {
  const out = [];
  const ents = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  for (const e of ents) {
    if (e.isFile() && e.name.endsWith(".md") && !/^(INDEX|README)\.md$/i.test(e.name)) {
      out.push({ label: e.name, blurb: blurbFor(path.join(dir, e.name)) });
    } else if (e.isDirectory()) {
      const sub = path.join(dir, e.name);
      const mds = fs.readdirSync(sub).filter((f) => f.endsWith(".md"));
      if (!mds.length) continue;
      const main = mds.find((f) => /^SKILL\.md$/i.test(f)) || mds.find((f) => f === e.name + ".md") || mds.sort()[0];
      out.push({ label: e.name + "/", blurb: blurbFor(path.join(sub, main)) });
    }
  }
  return out;
}

function renderIndex(folder, entries) {
  const rows = entries.map((e) => `| \`${e.label}\` | ${e.blurb.replace(/\|/g, "\\|")} |`).join("\n");
  return (
    `# ${folder} — index\n\n` +
    "<!-- GENERATED by `grimoire index`; do not edit by hand. Re-run after adding/renaming files here. -->\n\n" +
    "| File | What it covers |\n|---|---|\n" +
    rows +
    "\n"
  );
}

// Write (or, in check mode, just diff) INDEX.md for every indexed folder. Returns stale folders.
function generateIndexes(dir, { check } = {}) {
  const stale = [];
  // Two groups: the managed base at .agents/<folder>, and the project's own
  // customization layer at <root>/local/<folder>. Same renderer + drift rules.
  const groups = [
    { base: path.join(dir, ".agents"), folders: INDEX_FOLDERS, prefix: "" },
    { base: path.join(dir, "local"), folders: LOCAL_INDEX_FOLDERS, prefix: "local/" },
  ];
  for (const g of groups) {
    for (const folder of g.folders) {
      const dir = path.join(g.base, folder);
      if (!fs.existsSync(dir)) continue;
      const entries = indexEntries(dir);
      if (!entries.length) continue;
      const content = renderIndex(g.prefix + folder, entries);
      const file = path.join(dir, "INDEX.md");
      // Compare newline-agnostically: a git checkout with core.autocrlf=true rewrites committed LF to
      // CRLF on disk, but renderIndex emits LF — a raw compare would report false drift on Windows.
      // Strip every CR (not just \r\n) so a doubled \r\r\n never leaves a stray CR behind.
      const cur = fs.existsSync(file) ? fs.readFileSync(file, "utf8").replace(/\r/g, "") : "";
      if (cur === content) continue;
      if (check) stale.push(g.prefix + folder + "/INDEX.md");
      else fs.writeFileSync(file, content);
    }
  }
  return stale;
}

// Drift guard: every MCP server wired in tooling.json must be documented in skills/catalog.md.
function catalogDrift(destAgents) {
  const catalogFile = path.join(destAgents, "skills", "catalog.md");
  if (!fs.existsSync(catalogFile)) return [];
  const tooling = readTooling();
  const catalog = fs.readFileSync(catalogFile, "utf8");
  return (tooling.mcp || [])
    .map((m) => m.name)
    .filter((n) => !new RegExp("`" + n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "`").test(catalog));
}

function index({ dir, check }) {
  const destAgents = path.join(dir, ".agents");
  if (!fs.existsSync(destAgents)) fail("no .agents/ here — run `grimoire init` first.");
  const stale = generateIndexes(dir, { check });
  const drift = catalogDrift(destAgents);
  if (check) {
    const probs = [];
    if (stale.length) probs.push("stale INDEX.md (run `grimoire index`): " + stale.join(", "));
    if (drift.length) probs.push("skills/catalog.md missing tooling MCP: " + drift.join(", "));
    if (probs.length) fail(probs.join("; "));
    log("grimoire index --check: all INDEX.md current; catalog covers tooling MCP.");
    return;
  }
  log("grimoire index: refreshed INDEX.md under " + INDEX_FOLDERS.join("/ ") + "/");
  if (drift.length) log("  warning: skills/catalog.md does not mention tooling MCP: " + drift.join(", "));
}

// Read-only health check: verify a project is correctly wired. Aggregates
// findings, prints one line each, exits 1 if any error (CI-friendly).
function doctor({ dir }) {
  const destAgents = path.join(dir, ".agents");
  if (!fs.existsSync(destAgents)) fail("no .agents/ here — run `grimoire init` first.");
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(m);
  const warn = (m) => warnings.push(m);

  // 1. wiring — CLAUDE.md imports the contract.
  const claude = path.join(dir, "CLAUDE.md");
  if (!fs.existsSync(claude)) {
    err("CLAUDE.md missing — the agent entry point is not wired.");
  } else {
    const t = fs.readFileSync(claude, "utf8");
    if (!t.includes("@.agents/AGENTS.md")) err("CLAUDE.md does not import @.agents/AGENTS.md.");
    if (!t.includes("@local/AGENTS.local.md"))
      warn("CLAUDE.md does not import @local/AGENTS.local.md (local overrides won't load).");
  }

  // 2. skill frontmatter — mirrored skills need name: + description: to be discoverable.
  const skillDirs = [
    { rel: "skills", base: destAgents },
    { rel: path.join("local", "skills"), base: dir },
  ];
  for (const { rel, base } of skillDirs) {
    const sdir = path.join(base, rel);
    if (!fs.existsSync(sdir)) continue;
    for (const e of fs.readdirSync(sdir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const sk = path.join(sdir, e.name, "SKILL.md");
      if (!fs.existsSync(sk)) continue;
      const fm = fs.readFileSync(sk, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
      const body = fm ? fm[1] : "";
      if (!/^name:\s*\S/m.test(body) || !/^description:\s*\S/m.test(body))
        err(`${rel.replace(/\\/g, "/")}/${e.name}/SKILL.md needs name: + description: (Claude Code can't discover it otherwise).`);
    }
  }

  // 3. INDEX + catalog drift (root + local).
  for (const s of generateIndexes(dir, { check: true }))
    err(`stale INDEX.md (run \`grimoire index\`): ${s}`);
  for (const m of catalogDrift(destAgents)) err(`skills/catalog.md missing tooling MCP: ${m}`);

  // 4. AGENTS.local filled — stack profile + testing policy set, not placeholders.
  const localEntry = path.join(dir, "local", "AGENTS.local.md");
  if (fs.existsSync(localEntry)) {
    const t = fs.readFileSync(localEntry, "utf8");
    const val = (label) => (t.match(new RegExp(label + ":\\*\\*\\s*(.*)")) || [])[1];
    const unset = (v) => !v || v.trim() === "" || v.trim().startsWith("<!--");
    if (unset(val("Active stack profile")))
      warn("local/AGENTS.local.md: Active stack profile not set (still the seeded placeholder).");
    if (unset(val("Testing policy")))
      warn("local/AGENTS.local.md: Testing policy not set (still the seeded placeholder).");
  }

  // 5. entry-file size ceiling (rules/35-context-economy.md).
  for (const rel of ["CLAUDE.md", path.join(".agents", "AGENTS.md"), path.join("local", "AGENTS.local.md")]) {
    const f = path.join(dir, rel);
    if (!fs.existsSync(f)) continue;
    const n = fs.readFileSync(f, "utf8").split(/\r?\n/).length;
    if (n > 300) warn(`${rel.replace(/\\/g, "/")} is ${n} lines (>300 — keep entry files lean).`);
  }

  // 7. knowledge base scaffolded — codex/INDEX.md is the read-first project knowledge home.
  if (!fs.existsSync(path.join(dir, "codex", "INDEX.md")))
    warn("codex/INDEX.md missing — the project knowledge base isn't scaffolded (run `grimoire init`).");

  // 8. local/tooling.json (if present) must be valid JSON — bootstrap reads it.
  const lt = path.join(dir, "local", "tooling.json");
  if (fs.existsSync(lt)) {
    try { JSON.parse(fs.readFileSync(lt, "utf8")); }
    catch { err("local/tooling.json is not valid JSON (grimoire bootstrap can't read it)."); }
  }

  log(`grimoire doctor: ${errors.length} error(s), ${warnings.length} warning(s)`);
  for (const e of errors) log("  error: " + e);
  for (const w of warnings) log("  warn:  " + w);
  if (!errors.length && !warnings.length) log("  all checks passed.");
  if (errors.length) process.exit(1);
}

function help() {
  log("grimoire <command> [--dir <path>]\n");
  log("  init        scaffold .agents/ + CLAUDE.md + codex/ journal/ local/ (migrates an old layout; backs up first)");
  log("  sync        wholesale-replace the .agents/ contract from the template (codex/ journal/ local/ untouched)");
  log("  bootstrap   enable required plugins / MCP / skills (dry-run; --apply to write)");
  log("  index       regenerate per-folder INDEX.md (--check fails on drift, for CI)");
  log("  doctor      health-check the project's wiring (exits non-zero on error, for CI)");
}

// Only dispatch the CLI when invoked directly (so importing this module — e.g. from tests —
// does not execute commands or call process.exit).
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("grimoire.mjs")) {
  const args = parseArgs(process.argv.slice(2));
  switch (args.cmd) {
    case "init": init(args); break;
    case "sync": sync(args); break;
    case "bootstrap": bootstrap(args); break;
    case "index": index(args); break;
    case "doctor": doctor(args); break;
    case "--help": case "-h": case undefined: help(); break;
    default: fail(`unknown command "${args.cmd}" (try --help)`);
  }
}
