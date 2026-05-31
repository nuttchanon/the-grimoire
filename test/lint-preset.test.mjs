import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LINT = path.resolve(__dirname, "..", "templates", "lint");

test("eslint preset is syntactically valid and encodes the clean-code limits", () => {
  const file = path.join(LINT, "eslint.config.mjs");
  // `node --check` validates syntax without resolving the project-only plugin imports.
  execFileSync("node", ["--check", file]);
  const text = fs.readFileSync(file, "utf8");
  for (const rule of [
    "complexity",
    "max-depth",
    "max-params",
    "max-lines-per-function",
    "no-explicit-any",
    "no-non-null-assertion",
    "no-floating-promises",
    "switch-exhaustiveness-check",
  ]) {
    assert.match(text, new RegExp(rule), `eslint preset missing ${rule}`);
  }
});

test("tsconfig base is parseable JSON with strict options on", () => {
  const json = JSON.parse(fs.readFileSync(path.join(LINT, "tsconfig.base.json"), "utf8"));
  const co = json.compilerOptions;
  assert.equal(co.strict, true);
  assert.equal(co.noUncheckedIndexedAccess, true);
  assert.equal(co.exactOptionalPropertyTypes, true);
});
