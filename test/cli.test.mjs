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
