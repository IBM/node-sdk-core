# Agent Coding Rules — node-sdk-core

This file provides guidance to agents when working with code in this repository.

## Non-obvious coding rules

- **Tests are JavaScript, not TypeScript.** All files under `test/unit/` are `.js` and import via `require('../../dist/...')`. When adding tests, write plain JS, not TS.
- **Build before test, always.** Tests import compiled `dist/` output — running tests after editing source without rebuilding silently tests stale code. Run `npm run build` first.
- **Single test command:** `NODE_OPTIONS=--experimental-vm-modules npx jest test/unit/<name>.test.js`
- **`lib/private-helpers.ts` is not exported** — any internal utility that should not be part of the public API belongs there, not in `helper.ts`.
- **Browser credential file is swapped via `package.json "browser"` field** — `auth/utils/read-credentials-file` is aliased to `read-credentials-file.browser` for browser bundles. Don't add `fs` calls to the browser variant.
- **`getAuthenticatorFromEnvironment` auto-selects auth type** — if no `AUTH_TYPE` is set, it picks IAM when `apikey` is present, Container otherwise. This logic lives in [`auth/utils/get-authenticator-from-environment.ts`](../../auth/utils/get-authenticator-from-environment.ts).
- **New authenticator checklist** — must update 5 places: `auth/authenticators/index.ts`, `auth/index.ts`, root `index.ts`, `auth/utils/get-authenticator-from-environment.ts`, and add `test/unit/<name>-authenticator.test.js`.
- **TypeScript strict mode is partially disabled** — `noImplicitAny` and `strictNullChecks` are off; only `alwaysStrict` is enabled. Don't rely on strict null safety.
- **ESLint `no-param-reassign` is off for TS** — direct mutation of function parameters is permitted and used throughout token managers.
- **`load-esm` is used for dynamic ESM imports** — needed because the package compiles to CommonJS but some dependencies are ESM-only.
