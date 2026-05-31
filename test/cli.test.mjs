import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.resolve(__dirname, "..", "bin", "grimoire.mjs");

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
    assert.match(fs.readFileSync(path.join(dir, ".gitignore"), "utf8"), /\.agents\/session\//);
    assert.match(fs.readFileSync(path.join(a, "VERSION"), "utf8"), /sha:/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("sync overwrites managed paths but never touches project-owned", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    const local = path.join(dir, ".agents", "local", "AGENTS.local.md");
    const rule = path.join(dir, ".agents", "rules", "00-always.md");
    fs.appendFileSync(local, "\nKEEP_ME");
    fs.appendFileSync(rule, "\nCLOBBER_ME");
    run(["sync"], dir);
    assert.match(fs.readFileSync(local, "utf8"), /KEEP_ME/, "project-owned must survive");
    assert.doesNotMatch(fs.readFileSync(rule, "utf8"), /CLOBBER_ME/, "managed must be overwritten");
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

test("init seeds docs/adr template and is not overwritten by sync", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    const tmpl = path.join(dir, "docs", "adr", "0000-template.md");
    assert.ok(fs.existsSync(tmpl), "ADR template seeded");
    assert.match(fs.readFileSync(tmpl, "utf8"), /updates-confirmed-values/, "confirmed-values field present");
    const adr = path.join(dir, "docs", "adr", "0007-keep.md");
    fs.writeFileSync(adr, "project ADR");
    run(["sync"], dir);
    assert.ok(fs.existsSync(adr), "project ADRs survive sync (docs/adr is project-owned)");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("init seeds docs/requirements (base + addon/CR templates) and sync never overwrites it", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    const reqDir = path.join(dir, "docs", "requirements");
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

test("init seeds docs/runbooks incident template, project-owned", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    const rb = path.join(dir, "docs", "runbooks", "incident-runbook-template.md");
    assert.ok(fs.existsSync(rb), "incident runbook template seeded");
    assert.match(fs.readFileSync(rb, "utf8"), /First 15 minutes/, "runbook has the response section");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("init/sync mirror project-only skills from local/skills into .claude/skills", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    const localSkill = path.join(dir, ".agents", "local", "skills", "my-skill");
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

test("init seeds a missing project-owned file even when its dir pre-exists", () => {
  const dir = tmpProject();
  try {
    fs.mkdirSync(path.join(dir, ".agents", "memory"), { recursive: true }); // dir exists, MEMORY.md absent
    run(["init"], dir);
    assert.ok(
      fs.existsSync(path.join(dir, ".agents", "memory", "MEMORY.md")),
      "per-file seed fills MEMORY.md into a pre-existing empty memory/"
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("local INDEX is generated and checked alongside base", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    const lr = path.join(dir, ".agents", "local", "rules");
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

test("local/owned protects a managed path from sync", () => {
  const dir = tmpProject();
  try {
    run(["init"], dir);
    fs.writeFileSync(path.join(dir, ".agents", "local", "owned"), "skills\n");
    const sentinel = path.join(dir, ".agents", "skills", "PROJECT_OWNED_MARKER.md");
    fs.writeFileSync(sentinel, "mine");
    run(["sync"], dir);
    assert.ok(fs.existsSync(sentinel), "a managed path listed in local/owned is not clobbered by sync");
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
    const sk = path.join(dir, ".agents", "local", "skills", "bad");
    fs.mkdirSync(sk, { recursive: true });
    fs.writeFileSync(path.join(sk, "SKILL.md"), "---\nname: bad\n---\n# bad\n");
    assert.throws(() => run(["doctor"], dir), "skill without description: must be an error (exit 1)");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
