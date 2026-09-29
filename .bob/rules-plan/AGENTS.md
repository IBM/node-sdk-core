# Plan / Architecture Rules — node-sdk-core

This file provides guidance to agents when working with code in this repository.

## Non-obvious architectural constraints

- **Dual-output build is mandatory** — the package must compile to both `dist/` (CommonJS, ES5) and `es/` (ES modules). Any change must be compatible with both targets. The `tsconfig.json` targets ES5 specifically for `dist/`.
- **Tests are decoupled from TypeScript compilation** — `tsconfig.json` does not include `test/`. Tests are plain JS importing `dist/` output. This means type errors in tests are not caught by the TypeScript compiler.
- **`strict: true` is intentionally disabled** — only `alwaysStrict` is enabled. Design around this: don't assume null-safety or implicit-any errors will be caught at compile time.
- **Authenticator auto-selection fallback** — `getAuthenticatorFromEnvironment` silently falls back to Container auth (not an error) when no auth type or apikey is provided. Plan for this in environment-based configuration flows.
- **Browser path uses package.json field substitution** — the `"browser"` field in `package.json` remaps `read-credentials-file` to its browser stub at bundle time. There is no runtime detection; bundlers must support the `browser` field.
- **`no-param-reassign` is disabled** — the token manager pattern mutates config parameters passed into constructors. New token managers follow this same pattern.
- **`sdk-test-utilities/` has its own `node_modules`** — it is a separate package and must be installed independently (see `npm run clean` script which cleans both).
- **`load-esm` bridges ESM-only deps** — because the package is CJS, any ESM-only dependency (currently `file-type`) must go through `load-esm`. Do not add new ESM-only deps without this wrapper.
