// Grimoire clean-code ESLint preset (flat config). Copy to your project root as eslint.config.mjs
// (or import + extend it). Install peers: `npm i -D eslint @eslint/js typescript-eslint`.
// Encodes standards/clean-code.md limits. Override any rule in your own config block — yours wins.
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true },
    },
    rules: {
      // --- complexity / size limits (warn: guide, do not block early) ---
      complexity: ["warn", 10],
      "max-depth": ["warn", 3],
      "max-params": ["warn", 4],
      "max-lines-per-function": ["warn", { max: 50, skipBlankLines: true, skipComments: true }],
      "max-lines": ["warn", { max: 300, skipBlankLines: true, skipComments: true }],
      "no-nested-ternary": "warn",

      // --- safety (error: never ship) ---
      "no-console": ["error", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/prefer-readonly": "error",
    },
  },
);
