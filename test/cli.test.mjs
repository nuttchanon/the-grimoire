import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.resolve(__dirname, "..", "bin", "grimoire.mjs");
const PKG = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "package.json"), "utf8"));
const VER_RE = new RegExp("grimoire v" + PKG.version.replace(/\./g, "\\."));

function tmpProject() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "grimoire-test-"));
}
function run(args, dir) {
  return execFileSync("node", [CLI, ...args, "--dir", dir], { encoding: "utf8" });
}
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

test("init scaffolds managed paths, pointer, gitignore, VERSION", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    const a = path.join(dir, ".agents");
    for (const p of ["AGENTS.md", "rules/00-always.md", "rules/15-skills.md", "agents/verifier.md", "commands/verify.md", "stack/web-app.md", "skills/catalog.md", "skills/find-skills/SKILL.md", "tooling.json"]) {
      assert.ok(fs.existsSync(path.join(a, p)), `missing ${p}`);
    }
    assert.ok(fs.existsSync(path.join(dir, "CLAUDE.md")));
    assert.match(fs.readFileSync(path.join(dir, "CLAUDE.md"), "utf8"), /@\.agents\/AGENTS\.md/);
    assert.match(fs.readFileSync(path.join(dir, ".gitignore"), "utf8"), /journal\/session\//);
    assert.match(fs.readFileSync(path.join(a, "VERSION"), "utf8"), /sha:/);
    assert.ok(fs.existsSync(path.join(dir, "journal", "memory", "MEMORY.md")), "journal/memory seeded");
    assert.ok(fs.existsSync(path.join(dir, "local", "AGENTS.local.md")), "root local/ seeded");
    for (const gone of ["memory", "backlog", "session", "local"])
      assert.ok(!fs.existsSync(path.join(a, gone)), `.agents/${gone} must not exist (contract-only)`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("--version prints the release semver + build sha", () => {
  for (const flag of ["--version", "-v"]) {
    const out = execFileSync("node", [CLI, flag], { encoding: "utf8" });
    assert.match(out, VER_RE, `${flag} should print the package.json semver`);
    assert.match(out, /\(sha [0-9a-f]+\)|\(sha unknown\)/, `${flag} should print the build sha`);
  }
});

test("--version outside a git checkout reports sha unknown without leaking git stderr", () => {
  // Reproduce an npx/tarball install: the package files present, but no .git — so the
  // build-sha lookup (`git rev-parse` in the template root) fails and must degrade quietly.
  const dir = tmpProject();
  try {
    fs.copyFileSync(path.resolve(__dirname, "..", "package.json"), path.join(dir, "package.json"));
    fs.mkdirSync(path.join(dir, "bin"), { recursive: true });
    fs.copyFileSync(CLI, path.join(dir, "bin", "grimoire.mjs"));
    const r = spawnSync("node", [path.join(dir, "bin", "grimoire.mjs"), "--version"], { encoding: "utf8" });
    assert.match(r.stdout, /grimoire v[\d.]+ \(sha unknown\)/, "should degrade to sha unknown");
    assert.equal(r.stderr.trim(), "", "must not leak git's stderr to the user");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("stamped VERSION derives its semver from package.json (single source)", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    const v = fs.readFileSync(path.join(dir, ".agents", "VERSION"), "utf8");
    assert.match(v, VER_RE, "stamped VERSION must carry the package.json semver");
    assert.match(v, /sha:/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("sync overwrites the contract but never touches project-owned root dirs", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    const local = path.join(dir, "local", "AGENTS.local.md");
    const mem = path.join(dir, "journal", "memory", "MEMORY.md");
    const rule = path.join(dir, ".agents", "rules", "00-always.md");
    fs.appendFileSync(local, "\nKEEP_ME");
    fs.appendFileSync(mem, "\nKEEP_MEM");
    fs.appendFileSync(rule, "\nCLOBBER_ME");
    run(["sync"], dir);
    assert.match(fs.readFileSync(local, "utf8"), /KEEP_ME/, "root local/ must survive");
    assert.match(fs.readFileSync(mem, "utf8"), /KEEP_MEM/, "journal/memory must survive");
    assert.doesNotMatch(fs.readFileSync(rule, "utf8"), /CLOBBER_ME/, "contract must be overwritten");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("sync without init fails", () => {
  const dir = tmpProject();
  try {
    assert.throws(() => run(["sync"], dir));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

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

test("bootstrap surfaces ponytail and prints its marketplace-add + install hints", () => {
  const dir = tmpProject();
  const home = tmpProject();
  try {
    run(["init"], dir);
    writeSettings(home, { enabledPlugins: {} });
    const out = runEnv(["bootstrap", "--dry-run"], dir, home);
    assert.match(out, /ponytail@ponytail/, "ponytail listed as a recommended plugin");
    assert.match(out, /\/plugin marketplace add DietrichGebert\/ponytail/, "ponytail marketplace-add hint printed");
    assert.match(out, /\/plugin install ponytail@ponytail/, "ponytail install command printed");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test("bootstrap --apply enables the ponytail plugin too", () => {
  const dir = tmpProject();
  const home = tmpProject();
  try {
    run(["init"], dir);
    const sp = writeSettings(home, { enabledPlugins: {} });
    runEnv(["bootstrap", "--apply"], dir, home);
    const after = JSON.parse(fs.readFileSync(sp, "utf8"));
    assert.equal(after.enabledPlugins["ponytail@ponytail"], true, "ponytail enabled");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test("bare bootstrap is non-interactive (dry-run) without a TTY and never hangs", () => {
  const dir = tmpProject();
  const home = tmpProject();
  try {
    run(["init"], dir);
    const sp = writeSettings(home, { enabledPlugins: {} });
    const before = fs.readFileSync(sp, "utf8");
    const out = runEnv(["bootstrap"], dir, home); // no flag + no TTY -> must fall back to dry-run, not prompt
    assert.match(out, /dry-run/, "falls back to dry-run when stdin is not a TTY");
    assert.equal(fs.readFileSync(sp, "utf8"), before, "no settings written without a TTY or --apply");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(home, { recursive: true, force: true });
  }
});

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

test("init generates a per-folder INDEX.md with one row per file", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    const idx = path.join(dir, ".agents", "rules", "INDEX.md");
    assert.ok(fs.existsSync(idx), "rules/INDEX.md generated");
    const text = fs.readFileSync(idx, "utf8");
    assert.match(text, /GENERATED by `grimoire index`/, "marked generated");
    assert.match(text, /`00-always\.md`/, "lists a known rule file");
    assert.doesNotMatch(text, /`INDEX\.md`/, "does not index itself");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("index --check passes when fresh and fails on drift", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    run(["index", "--check"], dir); // throws on non-zero — fresh init is current
    // Mutate a managed file's H1 so the regenerated blurb differs from the committed INDEX.
    const rule = path.join(dir, ".agents", "rules", "00-always.md");
    fs.writeFileSync(rule, "# 00 — Changed heading for drift\n\nNew first paragraph.\n");
    assert.throws(() => run(["index", "--check"], dir), /stale INDEX\.md/, "drift must fail --check");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("index --check tolerates CRLF on disk (autocrlf checkout)", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    const idx = path.join(dir, ".agents", "rules", "INDEX.md");
    // Simulate a core.autocrlf=true checkout: committed LF rewritten to CRLF on disk.
    fs.writeFileSync(idx, fs.readFileSync(idx, "utf8").replace(/\n/g, "\r\n"));
    run(["index", "--check"], dir); // must NOT throw — a newline-only diff is not real drift
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("bootstrap --apply wires Stitch as an http MCP and flags its missing key", () => {
  const dir = tmpProject();
  const home = tmpProject();
  try {
    run(["init"], dir);
    const out = runEnv(["bootstrap", "--apply"], dir, home);
    const merged = JSON.parse(fs.readFileSync(path.join(dir, ".mcp.json"), "utf8"));
    assert.equal(merged.mcpServers.stitch.type, "http", "stitch uses http transport");
    assert.match(merged.mcpServers.stitch.url, /stitch\.googleapis\.com\/mcp/, "stitch url");
    assert.ok(merged.mcpServers.stitch.headers["X-Goog-Api-Key"], "stitch api-key header present");
    assert.match(out, /STITCH_API_KEY/, "unresolved header env reported (scans headers, not just env)");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test("init seeds codex/decisions ADR template and is not overwritten by sync", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    const tmpl = path.join(dir, "codex", "decisions", "0000-template.md");
    assert.ok(fs.existsSync(tmpl), "ADR template seeded");
    assert.match(fs.readFileSync(tmpl, "utf8"), /updates-confirmed-values/, "confirmed-values field present");
    const adr = path.join(dir, "codex", "decisions", "0007-keep.md");
    fs.writeFileSync(adr, "project ADR");
    run(["sync"], dir);
    assert.ok(fs.existsSync(adr), "project ADRs survive sync (codex/ is project-owned)");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("init seeds codex/requirements (base + addon/CR templates) and sync never overwrites it", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    const reqDir = path.join(dir, "codex", "requirements");
    assert.ok(fs.existsSync(path.join(reqDir, "base.md")), "requirements base seeded");
    assert.ok(fs.existsSync(path.join(reqDir, "addons", "0000-template.md")), "addon template seeded");
    assert.ok(fs.existsSync(path.join(reqDir, "changes", "0000-template.md")), "change-request template seeded");
    // Project edits the base, then syncs — its requirements must survive (project-owned).
    fs.writeFileSync(path.join(reqDir, "base.md"), "PROJECT_REQS");
    run(["sync"], dir);
    assert.equal(fs.readFileSync(path.join(reqDir, "base.md"), "utf8"), "PROJECT_REQS", "requirements survive sync");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("init seeds codex/runbooks incident template, project-owned", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    const rb = path.join(dir, "codex", "runbooks", "incident-runbook-template.md");
    assert.ok(fs.existsSync(rb), "incident runbook template seeded");
    assert.match(fs.readFileSync(rb, "utf8"), /First 15 minutes/, "runbook has the response section");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("init/sync mirror project-only skills from root local/skills into .claude/skills", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    const localSkill = path.join(dir, "local", "skills", "my-skill");
    fs.mkdirSync(localSkill, { recursive: true });
    fs.writeFileSync(path.join(localSkill, "SKILL.md"), "---\nname: my-skill\ndescription: x\n---\n");
    run(["sync"], dir);
    assert.ok(
      fs.existsSync(path.join(dir, ".claude", "skills", "my-skill", "SKILL.md")),
      "project-only local skill must be mirrored to .claude/skills"
    );
    assert.ok(
      fs.existsSync(path.join(dir, ".claude", "skills", "find-skills", "SKILL.md")),
      "base find-skills still mirrored"
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("init backs up an existing .agents/ before scaffolding", () => {
  const dir = tmpProject();
  try {
    const a = path.join(dir, ".agents");
    fs.mkdirSync(path.join(a, "rules"), { recursive: true });
    fs.writeFileSync(path.join(a, "rules", "legacy.md"), "OLD CUSTOM RULE");
    // A legacy project-owned dir (old location) triggers the migration backup.
    fs.mkdirSync(path.join(a, "local"), { recursive: true });
    fs.writeFileSync(path.join(a, "local", "AGENTS.local.md"), "OLD LOCAL");
    run(["init"], dir);
    const baks = fs.readdirSync(dir).filter((f) => f.startsWith(".agents.bak-"));
    assert.equal(baks.length, 1, "exactly one backup dir created");
    assert.match(
      fs.readFileSync(path.join(dir, baks[0], "rules", "legacy.md"), "utf8"),
      /OLD CUSTOM RULE/,
      "backup preserves the pre-existing content"
    );
    assert.ok(fs.existsSync(path.join(a, "AGENTS.md")), "base still scaffolded after backup");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("init on a clean project writes no backup", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    assert.equal(
      fs.readdirSync(dir).filter((f) => f.startsWith(".agents.bak-")).length,
      0,
      "nothing to back up on a fresh project"
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("init seeds a missing project-owned file even when its root dir pre-exists", () => {
  const dir = tmpProject();
  try {
    fs.mkdirSync(path.join(dir, "journal", "memory"), { recursive: true }); // dir exists, MEMORY.md absent
    run(["init"], dir);
    assert.ok(
      fs.existsSync(path.join(dir, "journal", "memory", "MEMORY.md")),
      "per-file seed fills MEMORY.md into a pre-existing empty journal/memory/"
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("local INDEX is generated and checked alongside base", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    const lr = path.join(dir, "local", "rules");
    fs.mkdirSync(lr, { recursive: true });
    fs.writeFileSync(path.join(lr, "local-10-x.md"), "---\ndescription: Project rule X.\n---\n# X\n");
    run(["index"], dir);
    const idx = path.join(lr, "INDEX.md");
    assert.ok(fs.existsSync(idx), "local/rules/INDEX.md generated");
    assert.match(fs.readFileSync(idx, "utf8"), /local-10-x\.md/, "lists the local rule");
    run(["index", "--check"], dir); // current now
    fs.writeFileSync(path.join(lr, "local-10-x.md"), "---\ndescription: Changed desc.\n---\n# X\n");
    assert.throws(() => run(["index", "--check"], dir), /local\/rules\/INDEX\.md/, "local drift fails --check");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("doctor passes on a fresh init", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    const out = run(["doctor"], dir); // execFileSync throws on non-zero — fresh init has no errors
    assert.match(out, /0 error\(s\)/, "no errors on fresh init");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("doctor fails when CLAUDE.md does not import the contract", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    fs.writeFileSync(path.join(dir, "CLAUDE.md"), "# no imports here\n");
    assert.throws(() => run(["doctor"], dir), "missing @.agents/AGENTS.md import must be an error (exit 1)");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("doctor fails on a local skill missing description", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    const sk = path.join(dir, "local", "skills", "bad");
    fs.mkdirSync(sk, { recursive: true });
    fs.writeFileSync(path.join(sk, "SKILL.md"), "---\nname: bad\n---\n# bad\n");
    assert.throws(() => run(["doctor"], dir), "skill without description: must be an error (exit 1)");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("init seeds codex/ seed-once — an existing codex/ is left untouched", () => {
  const dir = tmpProject();
  try {
    // Project already has a codex/ — seedCodex must not clobber it (seed-once, project-owned).
    fs.mkdirSync(path.join(dir, "codex"), { recursive: true });
    fs.writeFileSync(path.join(dir, "codex", "INDEX.md"), "PROJECT_KB");
    run(["init"], dir);
    assert.equal(fs.readFileSync(path.join(dir, "codex", "INDEX.md"), "utf8"), "PROJECT_KB", "existing codex/ untouched");
    assert.ok(!fs.existsSync(path.join(dir, "codex", "decisions")), "no template subdirs seeded over an existing codex/");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("bootstrap merges plugins + MCP declared in local/tooling.json with the base", () => {
  const dir = tmpProject();
  const home = tmpProject();
  try {
    run(["init"], dir);
    writeSettings(home, { enabledPlugins: {} });
    fs.writeFileSync(
      path.join(dir, "local", "tooling.json"),
      JSON.stringify({
        plugins: [{ name: "linear", marketplace: "acme" }],
        mcp: [{ name: "supabase", server: { command: "x" } }],
      })
    );
    runEnv(["bootstrap", "--apply"], dir, home);
    const settings = JSON.parse(fs.readFileSync(path.join(home, ".claude", "settings.json"), "utf8"));
    assert.equal(settings.enabledPlugins["linear@acme"], true, "local-declared plugin enabled");
    assert.equal(settings.enabledPlugins["ecc@ecc"], true, "base plugin still enabled");
    const mcp = JSON.parse(fs.readFileSync(path.join(dir, ".mcp.json"), "utf8"));
    assert.ok(mcp.mcpServers.supabase, "local-declared MCP merged");
    assert.ok(mcp.mcpServers.playwright, "base MCP still merged");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test("sync auto-migrates an old-layout project to root journal/ + local/", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    // Simulate the OLD layout: move root dirs back under .agents/ with sentinel content.
    const a = path.join(dir, ".agents");
    fs.rmSync(path.join(dir, "journal"), { recursive: true, force: true });
    fs.rmSync(path.join(dir, "local"), { recursive: true, force: true });
    fs.mkdirSync(path.join(a, "memory"), { recursive: true });
    fs.writeFileSync(path.join(a, "memory", "MEMORY.md"), "LEGACY_MEM");
    fs.mkdirSync(path.join(a, "local"), { recursive: true });
    fs.writeFileSync(path.join(a, "local", "AGENTS.local.md"), "LEGACY_LOCAL");

    run(["sync"], dir);

    assert.equal(fs.readFileSync(path.join(dir, "journal", "memory", "MEMORY.md"), "utf8"), "LEGACY_MEM", "memory moved to journal/");
    assert.equal(fs.readFileSync(path.join(dir, "local", "AGENTS.local.md"), "utf8"), "LEGACY_LOCAL", "local moved to root");
    assert.ok(!fs.existsSync(path.join(a, "memory")), ".agents/memory removed after migration");
    assert.ok(!fs.existsSync(path.join(a, "local")), ".agents/local removed after migration");
    const baks = fs.readdirSync(dir).filter((f) => f.startsWith(".agents.bak-"));
    assert.equal(baks.length, 1, "exactly one backup created during migration");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("migration is idempotent and conflict-safe", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    // A newer root copy already exists; a legacy .agents/memory must NOT overwrite it.
    fs.writeFileSync(path.join(dir, "journal", "memory", "MEMORY.md"), "ROOT_WINS");
    const a = path.join(dir, ".agents");
    fs.mkdirSync(path.join(a, "memory"), { recursive: true });
    fs.writeFileSync(path.join(a, "memory", "MEMORY.md"), "LEGACY_LOSES");

    run(["sync"], dir);

    assert.equal(fs.readFileSync(path.join(dir, "journal", "memory", "MEMORY.md"), "utf8"), "ROOT_WINS", "existing root copy not overwritten");
    const baks = fs.readdirSync(dir).filter((f) => f.startsWith(".agents.bak-"));
    assert.equal(baks.length, 1, "conflict still triggers one backup");
    assert.equal(
      fs.readFileSync(path.join(dir, baks[0], "memory", "MEMORY.md"), "utf8"),
      "LEGACY_LOSES",
      "legacy copy preserved in backup"
    );

    // Second sync: no legacy dirs left -> no new backup.
    run(["sync"], dir);
    assert.equal(fs.readdirSync(dir).filter((f) => f.startsWith(".agents.bak-")).length, 1, "second sync is a no-op (no new backup)");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("sync rewrites CLAUDE.md imports from .agents/local to root local (A)", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    const a = path.join(dir, ".agents");
    // OLD layout + OLD pointer importing the pre-migration path.
    fs.rmSync(path.join(dir, "local"), { recursive: true, force: true });
    fs.mkdirSync(path.join(a, "local"), { recursive: true });
    fs.writeFileSync(path.join(a, "local", "AGENTS.local.md"), "LEGACY_LOCAL");
    fs.writeFileSync(
      path.join(dir, "CLAUDE.md"),
      "# CLAUDE.md\n\n@.agents/AGENTS.md\n@.agents/local/AGENTS.local.md\n\nSee `.agents/local/reference/x.md`.\n"
    );
    run(["sync"], dir);
    const claude = fs.readFileSync(path.join(dir, "CLAUDE.md"), "utf8");
    assert.match(claude, /@local\/AGENTS\.local\.md/, "import rewritten to @local/");
    assert.doesNotMatch(claude, /@\.agents\/local\//, "no stale @.agents/local import");
    assert.match(claude, /`local\/reference\/x\.md`/, "inline .agents/local ref rewritten");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("sync refreshes .gitignore: journal/session + bak, drops stale .agents/session (B)", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    // Simulate an old-layout .gitignore (ignored .agents/session/, no journal/session/).
    fs.writeFileSync(
      path.join(dir, ".gitignore"),
      "node_modules/\n\n# --- Grimoire: session ---\n.agents/session/\n.agents/session/archive/\n"
    );
    run(["sync"], dir);
    const gi = fs.readFileSync(path.join(dir, ".gitignore"), "utf8");
    assert.match(gi, /journal\/session\//, "journal/session/ added");
    assert.match(gi, /\.agents\.bak-\*\//, ".agents.bak-*/ ignored");
    assert.doesNotMatch(gi, /^\.agents\/session\//m, "stale .agents/session/ stripped");
    assert.match(gi, /node_modules\//, "existing entries preserved");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("gitignore snippet ignores graphify-out wholesale, not commit-the-graph (C)", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    const gi = fs.readFileSync(path.join(dir, ".gitignore"), "utf8");
    assert.match(gi, /^graphify-out\/\s*$/m, "graphify-out/ fully ignored");
    assert.doesNotMatch(gi, /!graphify-out\//, "no commit-the-graph whitelist");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("doctor warns on a stale @.agents/local import (D)", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    fs.writeFileSync(
      path.join(dir, "CLAUDE.md"),
      "# CLAUDE.md\n\n@.agents/AGENTS.md\n@.agents/local/AGENTS.local.md\n"
    );
    const out = run(["doctor"], dir);
    assert.match(out, /old layout/, "doctor flags the old-layout import");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("init appends Grimoire imports to an existing CLAUDE.md (E)", () => {
  const dir = tmpProject();
  try {
    fs.writeFileSync(path.join(dir, "CLAUDE.md"), "# My project\n\n@AGENTS.md\n");
    run(["init"], dir);
    const claude = fs.readFileSync(path.join(dir, "CLAUDE.md"), "utf8");
    assert.match(claude, /@AGENTS\.md/, "existing import preserved");
    assert.match(claude, /@\.agents\/AGENTS\.md/, "grimoire contract import appended");
    assert.match(claude, /@local\/AGENTS\.local\.md/, "local import appended");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
