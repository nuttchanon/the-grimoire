import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const BIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "bin", "grimoire.mjs");

function tmp() { return fs.mkdtempSync(path.join(os.tmpdir(), "grimoire-")); }
function run(args, env = {}) {
  return execFileSync(process.execPath, [BIN, ...args], { encoding: "utf8", env: { ...process.env, ...env } });
}
const read = (...p) => fs.readFileSync(path.join(...p), "utf8");

test("init writes AGENTS.md with managed block + project stub, and CLAUDE.md import", () => {
  const d = tmp();
  run(["init", "--dir", d]);
  const agents = read(d, "AGENTS.md");
  assert.match(agents, /<!-- grimoire:start[^>]*-->[\s\S]*<!-- grimoire:end -->/);
  assert.match(agents, /## Project\n\n- Stack:/);
  // Prettier-stable: headings and markers are followed by a blank line, or a project formatter fights sync.
  assert.doesNotMatch(agents, /^(#+ .*|<!-- grimoire:start.*-->)\n(?!\n)/m);
  assert.doesNotMatch(agents, /[^\n]\n<!-- grimoire:end -->/);
  assert.doesNotMatch(agents, /zero-dependency Node ESM CLI/, "this repo's own Project section must not leak");
  assert.equal(read(d, "CLAUDE.md"), "@AGENTS.md\n");
  assert.deepEqual(fs.readdirSync(d).sort(), ["AGENTS.md", "CLAUDE.md"]);
});

test("init is idempotent", () => {
  const d = tmp();
  run(["init", "--dir", d]);
  const a = read(d, "AGENTS.md"), c = read(d, "CLAUDE.md");
  run(["init", "--dir", d]);
  assert.equal(read(d, "AGENTS.md"), a);
  assert.equal(read(d, "CLAUDE.md"), c);
});

test("sync replaces only the managed block, keeps project content", () => {
  const d = tmp();
  fs.writeFileSync(path.join(d, "AGENTS.md"),
    "# AGENTS.md\n\n<!-- grimoire:start old -->\nSTALE RULE\n<!-- grimoire:end -->\n\n## Project\n- Verify: `make check`\n");
  run(["sync", "--dir", d]);
  const agents = read(d, "AGENTS.md");
  assert.doesNotMatch(agents, /STALE RULE/);
  assert.match(agents, /## Rules/);
  assert.match(agents, /- Verify: `make check`/);
});

test("init on an existing AGENTS.md without markers keeps it below the block", () => {
  const d = tmp();
  fs.writeFileSync(path.join(d, "AGENTS.md"), "My existing notes\n");
  fs.writeFileSync(path.join(d, "CLAUDE.md"), "# Claude notes\n");
  run(["init", "--dir", d]);
  const agents = read(d, "AGENTS.md");
  assert.ok(agents.indexOf("<!-- grimoire:end -->") < agents.indexOf("My existing notes"));
  assert.equal(read(d, "CLAUDE.md"), "@AGENTS.md\n\n# Claude notes\n");
});

test("init warns about a 0.x layout", () => {
  const d = tmp();
  fs.mkdirSync(path.join(d, ".agents"));
  fs.writeFileSync(path.join(d, ".agents", "AGENTS.md"), "old");
  assert.match(run(["init", "--dir", d]), /0\.x layout/);
});

test("bootstrap dry-run lists plugins and never writes settings", () => {
  const home = tmp();
  const out = run(["bootstrap"], { HOME: home, USERPROFILE: home });
  assert.match(out, /pstack@pstack-claude/);
  assert.match(out, /npx skills@latest add obra\/superpowers/);
  assert.ok(!fs.existsSync(path.join(home, ".claude", "settings.json")));
});

test("bootstrap --apply enables plugins + marketplaces, keeps other settings", () => {
  const home = tmp();
  fs.mkdirSync(path.join(home, ".claude"));
  const sp = path.join(home, ".claude", "settings.json");
  fs.writeFileSync(sp, JSON.stringify({ theme: "dark", enabledPlugins: { "x@y": true } }));
  run(["bootstrap", "--apply"], { HOME: home, USERPROFILE: home });
  const s = JSON.parse(fs.readFileSync(sp, "utf8"));
  assert.equal(s.theme, "dark");
  assert.equal(s.enabledPlugins["x@y"], true);
  assert.equal(s.enabledPlugins["ponytail@ponytail"], true);
  assert.deepEqual(s.extraKnownMarketplaces["pstack-claude"], { source: { source: "github", repo: "michael-denyer/pstack-claude" } });
  assert.ok(fs.existsSync(sp + ".bak"));
});

test("bootstrap --apply refuses to overwrite an unparseable settings.json", () => {
  const home = tmp();
  fs.mkdirSync(path.join(home, ".claude"));
  const sp = path.join(home, ".claude", "settings.json");
  fs.writeFileSync(sp, "{ broken, // hand edit");
  assert.throws(() => run(["bootstrap", "--apply"], { HOME: home, USERPROFILE: home }));
  assert.equal(fs.readFileSync(sp, "utf8"), "{ broken, // hand edit");
});

test("init creates a missing --dir", () => {
  const d = path.join(tmp(), "new", "proj");
  run(["init", "--dir", d]);
  assert.ok(fs.existsSync(path.join(d, "AGENTS.md")));
});

test("bootstrap warns when the superpowers plugin (SessionStart hook) is enabled", () => {
  const home = tmp();
  fs.mkdirSync(path.join(home, ".claude"));
  fs.writeFileSync(path.join(home, ".claude", "settings.json"),
    JSON.stringify({ enabledPlugins: { "superpowers@claude-plugins-official": true } }));
  assert.match(run(["bootstrap"], { HOME: home, USERPROFILE: home }), /superpowers@claude-plugins-official/);
});

function runStatus(args) {
  try { return { code: 0, out: run(args) }; } catch (e) { return { code: e.status, out: String(e.stdout) }; }
}

test("check passes on a fresh init and counts eager-loaded files", () => {
  const d = tmp();
  run(["init", "--dir", d]);
  const { code, out } = runStatus(["check", "--dir", d]);
  assert.equal(code, 0);
  assert.match(out, /CLAUDE\.md/);
  assert.match(out, /AGENTS\.md/);
});

test("check follows @imports and fails over the 200-line budget", () => {
  const d = tmp();
  run(["init", "--dir", d]);
  fs.mkdirSync(path.join(d, "ref"));
  fs.writeFileSync(path.join(d, "ref", "big.md"), "line\n".repeat(250));
  fs.appendFileSync(path.join(d, "AGENTS.md"), "\nSee @ref/big.md\n");
  const { code, out } = runStatus(["check", "--dir", d]);
  assert.equal(code, 1);
  assert.match(out, /ref[\\/]big\.md/);
});

test("check counts unscoped .claude/rules but skips paths:-scoped ones", () => {
  const d = tmp();
  run(["init", "--dir", d]);
  const rules = path.join(d, ".claude", "rules");
  fs.mkdirSync(rules, { recursive: true });
  fs.writeFileSync(path.join(rules, "scoped.md"), "---\npaths:\n  - \"src/**\"\n---\n" + "x\n".repeat(500));
  fs.writeFileSync(path.join(rules, "global.md"), "always\n");
  const { code, out } = runStatus(["check", "--dir", d]);
  assert.equal(code, 0);
  assert.match(out, /global\.md/);
  assert.doesNotMatch(out, /scoped\.md/);
});

test("--version prints the package version", () => {
  const { version } = JSON.parse(read(path.dirname(BIN), "..", "package.json"));
  assert.match(run(["--version"]), new RegExp(`grimoire v${version.replace(/\./g, "\\.")}`));
});
