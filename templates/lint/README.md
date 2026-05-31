# Clean-code lint preset

Mechanical enforcement of `standards/clean-code.md`. **Copy into your project** and extend — do not
edit in place (the project owns its lint config).

## Use

```sh
npm i -D eslint @eslint/js typescript-eslint
cp templates/lint/eslint.config.mjs ./eslint.config.mjs
```

Extend the tsconfig from your `tsconfig.json`:

```json
{ "extends": "./tsconfig.base.json" }
```

## Severities

`warn` for size/complexity limits (guidance while a codebase stabilizes); `error` for safety rules
(`any`, floating promises, non-null assertions, console). Tighten `warn`→`error` per project once
clean. Any rule can be overridden in your own config block — it wins.

`tsconfig.base.json` is intentionally comment-free so tooling can parse it as plain JSON.
