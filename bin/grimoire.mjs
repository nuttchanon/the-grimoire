#!/usr/bin/env node
// grimoire — write a lean AGENTS.md contract into a project and wire the agent tooling.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BLOCK_RE = /<!-- grimoire:start[^>]*-->[\s\S]*?<!-- grimoire:end -->/;
const PROJECT_STUB = "## Project\n\n- Stack:\n- Verify: `<command>`\n- Facts:\n";

// Base = ponytail + caveman; pstack routes workflows (its SessionStart hook is the only router).
const PLUGINS = [
  { name: "ponytail", marketplace: "ponytail", repo: "DietrichGebert/ponytail" },
  { name: "caveman", marketplace: "caveman", repo: "JuliusBrussee/caveman" },
  { name: "pstack", marketplace: "pstack-claude", repo: "michael-denyer/pstack-claude" },
];
// Installed as plain skills (no plugin) so they load on demand and add no always-on hook.
const SKILLS = ["obra/superpowers", "mattpocock/skills"];
// Plugin forms that inject a second SessionStart router alongside pstack.
const CONFLICTS = ["superpowers@claude-plugins-official"];

const log = (m) => process.stdout.write(m + "\n");
const fail = (m) => { process.stderr.write("grimoire: " + m + "\n"); process.exit(1); };
const key = (p) => `${p.name}@${p.marketplace}`;

function managedBlock() {
  return fs.readFileSync(path.join(ROOT, "AGENTS.md"), "utf8").match(BLOCK_RE)[0];
}

function writeIfChanged(file, text) {
  const before = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  if (before === text) return "unchanged";
  fs.writeFileSync(file, text);
  return before === null ? "created" : "updated";
}

// init and sync are the same idempotent operation: refresh the managed block, keep everything else.
function init(dir) {
  const agents = path.join(dir, "AGENTS.md");
  const claude = path.join(dir, "CLAUDE.md");
  const block = managedBlock();
  fs.mkdirSync(dir, { recursive: true });

  let text;
  if (!fs.existsSync(agents)) text = `# AGENTS.md\n\n${block}\n\n${PROJECT_STUB}`;
  else {
    const cur = fs.readFileSync(agents, "utf8");
    text = BLOCK_RE.test(cur) ? cur.replace(BLOCK_RE, () => block) : `${block}\n\n${cur}`;
  }
  log(`  AGENTS.md ${writeIfChanged(agents, text)}`);

  const cur = fs.existsSync(claude) ? fs.readFileSync(claude, "utf8") : null;
  const next = cur === null ? "@AGENTS.md\n" : /^@AGENTS\.md\s*$/m.test(cur) ? cur : `@AGENTS.md\n\n${cur}`;
  log(`  CLAUDE.md ${writeIfChanged(claude, next)}`);

  if (fs.existsSync(path.join(dir, ".agents", "AGENTS.md"))) {
    log("  warning: 0.x layout found (.agents/, local/, journal/, codex/). Move content to the plain v1 names");
    log("  (docs/adr, docs/requirements, docs/runbooks, docs/reference, .claude/rules; table: README \"Upgrading from 0.x\"),");
    log("  then delete those folders and their CLAUDE.md imports.");
  }
}

function bootstrap(apply) {
  const sp = path.join(os.homedir(), ".claude", "settings.json");
  let settings = {};
  if (fs.existsSync(sp)) {
    // Never rewrite a settings file we could not parse: that would drop the user's hand edits.
    try { settings = JSON.parse(fs.readFileSync(sp, "utf8")); } catch (e) { fail(`cannot parse ${sp}: ${e.message}`); }
  }
  const enabled = settings.enabledPlugins || {};
  const missing = PLUGINS.filter((p) => !enabled[key(p)]);

  if (!missing.length) log("  plugins: all enabled.");
  else {
    log("  plugins missing (or paste in Claude Code):");
    for (const p of missing) log(`    /plugin marketplace add ${p.repo} && /plugin install ${key(p)}`);
    if (apply) {
      if (fs.existsSync(sp)) fs.copyFileSync(sp, sp + ".bak");
      settings.enabledPlugins = enabled;
      settings.extraKnownMarketplaces = settings.extraKnownMarketplaces || {};
      for (const p of missing) {
        enabled[key(p)] = true;
        settings.extraKnownMarketplaces[p.marketplace] ??= { source: { source: "github", repo: p.repo } };
      }
      fs.mkdirSync(path.dirname(sp), { recursive: true });
      fs.writeFileSync(sp, JSON.stringify(settings, null, 2) + "\n");
      log(`  enabled ${missing.length} plugin(s) in ${sp} (backup: .bak); restart Claude Code to install.`);
    } else log("  (dry-run) re-run with --apply to enable them.");
  }

  log("  skills (install once, user scope):");
  for (const s of SKILLS) log(`    npx skills@latest add ${s}`);

  for (const c of CONFLICTS.filter((c) => enabled[c])) {
    log(`  warning: ${c} is enabled; its SessionStart hook duplicates pstack routing. Disable it and use the skills install above.`);
  }
}

// What Claude Code loads at session start: CLAUDE.md files (else AGENTS.md), their @imports
// (recursive, max depth 5), and .claude/rules/**/*.md without `paths:` frontmatter.
// ponytail: import parsing strips code spans/fences and takes `@path` tokens that resolve to a file.
const BUDGET = 200;

function eagerFiles(dir) {
  const roots = ["CLAUDE.md", ".claude/CLAUDE.md", "CLAUDE.local.md"].map((f) => path.join(dir, f)).filter((f) => fs.existsSync(f));
  if (!roots.length && fs.existsSync(path.join(dir, "AGENTS.md"))) roots.push(path.join(dir, "AGENTS.md"));
  const seen = new Set();
  const visit = (file, depth) => {
    if (seen.has(file) || depth > 5) return;
    seen.add(file);
    const text = fs.readFileSync(file, "utf8").replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
    for (const [, ref] of text.matchAll(/(?:^|\s)@([^\s]+)/g)) {
      const target = ref.startsWith("~/") ? path.join(os.homedir(), ref.slice(2)) : path.resolve(path.dirname(file), ref);
      if (fs.existsSync(target) && fs.statSync(target).isFile()) visit(target, depth + 1);
    }
  };
  roots.forEach((f) => visit(f, 0));
  const walk = (d) => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith(".md") ? [path.join(d, e.name)] : []) : [];
  for (const f of walk(path.join(dir, ".claude", "rules"))) {
    if (!/^---\r?\n[\s\S]*?^paths:/m.test(fs.readFileSync(f, "utf8"))) seen.add(f);
  }
  return [...seen];
}

function check(dir) {
  let total = 0;
  for (const f of eagerFiles(dir)) {
    const lines = fs.readFileSync(f, "utf8").split("\n").length;
    total += lines;
    log(`  ${String(lines).padStart(5)}  ${path.relative(dir, f)}`);
  }
  log(`  ${String(total).padStart(5)}  total loaded every session (budget ${BUDGET})`);
  if (total > BUDGET) {
    log("  over budget: move file-specific rules to .claude/rules/ with paths:, and big docs to docs/reference/ (grep, don't import).");
    process.exit(1);
  }
}

function version() {
  let sha = "unknown";
  try {
    sha = execFileSync("git", ["-C", ROOT, "rev-parse", "--short", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {}
  const v = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8")).version;
  return `grimoire v${v} (${sha})`;
}

const HELP = `grimoire — lean agent contract

  grimoire init [--dir <path>]   write/refresh AGENTS.md (managed block) + CLAUDE.md (@AGENTS.md)
  grimoire sync [--dir <path>]   alias of init: refresh the managed block, keep the Project section
  grimoire check [--dir <path>]  count lines Claude Code loads every session; exit 1 over the 200-line budget
  grimoire bootstrap [--apply]   enable ponytail, caveman, pstack; print superpowers + mattpocock skill installs
  grimoire --version`;

const [cmd, ...rest] = process.argv.slice(2);
const dirAt = rest.indexOf("--dir");
const dir = path.resolve(dirAt >= 0 ? rest[dirAt + 1] ?? fail("--dir needs a path") : ".");

if (cmd === "init" || cmd === "sync") { log(`grimoire ${cmd} → ${dir}`); init(dir); }
else if (cmd === "check") { log(`grimoire check → ${dir}`); check(dir); }
else if (cmd === "bootstrap") { log(`grimoire bootstrap${rest.includes("--apply") ? " (apply)" : ""}`); bootstrap(rest.includes("--apply")); }
else if (cmd === "--version" || cmd === "-v") log(version());
else if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") log(HELP);
else fail(`unknown command: ${cmd}\n${HELP}`);
