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

// Project-owned dirs: seeded on init only if absent, NEVER overwritten by sync.
const PROJECT_OWNED = ["local", "memory", "backlog", "session"];

function log(msg) { process.stdout.write(msg + "\n"); }
function fail(msg) { process.stderr.write("grimoire: " + msg + "\n"); process.exit(1); }

function parseArgs(argv) {
  const out = { cmd: argv[0], dir: process.cwd(), apply: false };
  for (let i = 1; i < argv.length; i++) {
    if (argv[i] === "--dir") out.dir = path.resolve(argv[++i]);
    else if (argv[i] === "--apply") out.apply = true;
    else if (argv[i] === "--dry-run") out.apply = false;
  }
  return out;
}

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

// Managed (overwritable) paths from the manifest, relative to .agents/.
function readManifest() {
  const file = path.join(TEMPLATE_AGENTS, "grimoire.manifest");
  const text = fs.readFileSync(file, "utf8");
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => l.replace(/\/+$/, ""));
}

function copyInto(srcRel, destAgents) {
  const src = path.join(TEMPLATE_AGENTS, srcRel);
  if (!fs.existsSync(src)) return false;
  const dest = path.join(destAgents, srcRel);
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
  return true;
}

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
  if (cur.includes(".agents/session/")) return;
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

function init({ dir }) {
  const destAgents = path.join(dir, ".agents");
  fs.mkdirSync(destAgents, { recursive: true });

  for (const p of readManifest()) copyInto(p, destAgents);
  copyInto("grimoire.manifest", destAgents);

  for (const owned of PROJECT_OWNED) {
    if (!fs.existsSync(path.join(destAgents, owned))) copyInto(owned, destAgents);
  }

  stampVersion(destAgents);
  writePointer(dir);
  ensureGitignore(dir);
  mirrorProjectSkills(dir);

  log("grimoire init: scaffolded .agents/ + CLAUDE.md");
  log("  managed: " + readManifest().join(" "));
  log("  project-owned (seeded if absent): " + PROJECT_OWNED.join(" "));
  log("  next: set the active stack profile + testing policy in .agents/local/AGENTS.local.md");
}

function sync({ dir }) {
  const destAgents = path.join(dir, ".agents");
  if (!fs.existsSync(destAgents)) fail("no .agents/ here — run `grimoire init` first.");

  const oldVersion = (() => {
    try { return fs.readFileSync(path.join(destAgents, "VERSION"), "utf8").trim(); }
    catch { return "(none)"; }
  })();

  const managed = readManifest();
  for (const p of managed) copyInto(p, destAgents);
  copyInto("grimoire.manifest", destAgents);
  stampVersion(destAgents);

  log("grimoire sync: refreshed managed paths from template.");
  log("  overwritten: " + managed.join(" "));
  log("  untouched (project-owned): " + PROJECT_OWNED.join(" "));
  log("  VERSION: " + oldVersion.split(/\r?\n/)[0] + "  ->  sha " + templateSha());
}

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

function help() {
  log("grimoire <command> [--dir <path>]\n");
  log("  init        scaffold .agents/ + CLAUDE.md into a project");
  log("  sync        overwrite managed paths from the template (local/ memory/ backlog/ session/ untouched)");
  log("  bootstrap   enable required plugins / MCP / skills (dry-run; --apply to write)");
}

const args = parseArgs(process.argv.slice(2));
switch (args.cmd) {
  case "init": init(args); break;
  case "sync": sync(args); break;
  case "bootstrap": bootstrap(args); break;
  case "--help": case "-h": case undefined: help(); break;
  default: fail(`unknown command "${args.cmd}" (try --help)`);
}
