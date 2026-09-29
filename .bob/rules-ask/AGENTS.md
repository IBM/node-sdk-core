# Ask / Research Rules — node-sdk-core

This file provides guidance to agents when working with code in this repository.

## Non-obvious documentation context

- **Test files are `.js`, source files are `.ts`** — the test directory looks like it might contain TypeScript but all files under `test/unit/` are JavaScript.
- **`dist/` is the actual runtime** — the published npm package ships `dist/` (CommonJS) as the main entry. The `es/` directory is the ES module build, used via the `typings` field.
- **`lib/private-helpers.ts` is internal only** — not exported from any index; contains `redactSecrets` and other utilities intentionally hidden from the public API.
- **Two tsconfig files** — `tsconfig.json` compiles to `dist/` (CommonJS, ES5 target); `tsconfig-es6.json` compiles to `es/` (ES modules). Neither covers `test/`.
- **`sdk-test-utilities/`** is a separately published sub-package, not part of the main build.
- **Credential lookup priority:** credentials file (`ibm-credentials.env`) → environment variables → VCAP Services (Cloud Foundry). Documented in [`Authentication.md`](../../Authentication.md).
- **`browser` field in `package.json`** silently swaps `read-credentials-file` for the browser stub — this is the only browser-specific code path.
