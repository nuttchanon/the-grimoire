// Guardrail test — structural invariants (standards/guardrail-tests.md).
// Copy into the project's test dir and adapt the scanners. Runs under the existing `verify` gate
// (Vitest shown; the pattern is runner-agnostic). Fail CLOSED: a scan that returns nothing because
// it could not read its source is a failure, not a pass.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve(__dirname, "..", "src");

function walk(dir: string, ext = ".ts"): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, ext));
    else if (e.name.endsWith(ext)) out.push(p);
  }
  return out;
}

function scan(re: RegExp): Set<string> {
  const hits = new Set<string>();
  for (const f of walk(SRC)) {
    const text = fs.readFileSync(f, "utf8");
    for (const m of text.matchAll(re)) hits.add(m[1]);
  }
  return hits;
}

function diff(a: Set<string>, b: Set<string>): string[] {
  return [...a].filter((x) => !b.has(x)).sort();
}

describe("guardrail: IPC channels are allow-listed", () => {
  // EXAMPLE — replace with the project's real registry/allow-list source of truth.
  const ALLOW_LIST: string[] = require("../src/ipc/allow-list").CHANNELS; // declared truth
  const used = scan(/ipcMain\.handle\(\s*["']([^"']+)["']/g); // live call sites

  it("every registered channel is declared (fail closed on undeclared)", () => {
    expect(used.size).toBeGreaterThan(0); // scanner found something — not a silent empty
    expect(diff(used, new Set(ALLOW_LIST))).toEqual([]); // used but undeclared
  });

  it("no stale allow-list entries", () => {
    expect(diff(new Set(ALLOW_LIST), used)).toEqual([]); // declared but unused
  });
});

describe("guardrail: thrown error codes exist in the catalog", () => {
  // EXAMPLE — replace catalog source + throw pattern with the project's.
  const catalog = fs.readFileSync(path.resolve(__dirname, "../.agents/standards/error-codes.md"), "utf8");
  const declared = new Set([...catalog.matchAll(/`([A-Z]+_[A-Z0-9_]+)`/g)].map((m) => m[1]));
  const thrown = scan(/AppError\(\s*["']([A-Z]+_[A-Z0-9_]+)["']/g);

  it("every thrown code is catalogued", () => {
    expect(declared.size).toBeGreaterThan(0); // catalog readable — fail closed, not a silent skip
    expect(diff(thrown, declared)).toEqual([]);
  });
});
