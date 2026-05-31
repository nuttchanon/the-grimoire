import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanBlurb } from "../bin/grimoire.mjs";

test("cleanBlurb strips a leading list marker", () => {
  assert.equal(cleanBlurb("- **Small files.** Split when long"), "Small files. Split when long");
});
test("cleanBlurb strips emphasis and code markers", () => {
  assert.equal(cleanBlurb("**`strict: true`.** No implicit any"), "strict true. No implicit any");
});
test("cleanBlurb drops a trailing colon", () => {
  assert.equal(cleanBlurb("routes to exactly one of:"), "routes to exactly one of");
});
