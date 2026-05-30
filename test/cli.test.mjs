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
