# AGENTS.md — node-sdk-core

This file provides guidance to agents when working with code in this repository.

Node.js / TypeScript core runtime library used by IBM Cloud SDKs generated with OpenAPI SDKGen.

- **npm package:** `ibm-cloud-sdk-core`
- **Current version:** `5.1.2` (see [`package.json`](package.json))
- **Language:** TypeScript (compiled to CommonJS in `dist/`, ES modules in `es/`)
- **Minimum Node.js version:** 20

## Directory structure

```
auth/
  authenticators/   Authenticator classes (one file per type)
  token-managers/   Token manager classes (IAM, CP4D, MCSP, VPC, Container, …)
  utils/            Credential file reading, factory helpers
  index.ts          Re-exports all auth symbols
lib/
  base-service.ts   BaseService — Axios-based HTTP client
  request-wrapper.ts  Axios wrapper with retry-axios
  helper.ts         General-purpose helpers
  content-type.ts   MIME-type detection
  build-user-agent.ts  User-Agent header construction
  private-helpers.ts  Internal utilities (not exported)
  logger.ts / get-new-logger.ts  Structured debug logging
  querystring.ts    Query parameter serialisation
  stream-to-promise.ts  Stream helpers
  cookie-support.ts  Cookie jar helpers
index.ts            Root entry point — re-exports all public symbols
dist/               Compiled CommonJS output (generated; do not edit)
es/                 Compiled ES module output (generated; do not edit)
test/
  unit/             Jest unit tests (written in .js, not .ts)
  integration/      Integration tests (require live credentials)
sdk-test-utilities/ Shared test helpers (published separately)
```

## Key files

| File | Purpose |
|---|---|
| [`lib/base-service.ts`](lib/base-service.ts) | `BaseService` class — all generated SDK services extend this |
| [`lib/request-wrapper.ts`](lib/request-wrapper.ts) | Axios configuration, retry logic, streaming |
| [`auth/authenticators/iam-authenticator.ts`](auth/authenticators/iam-authenticator.ts) | IAM token authenticator |
| [`auth/authenticators/iam-assume-authenticator.ts`](auth/authenticators/iam-assume-authenticator.ts) | IAM assume-role |
| [`auth/authenticators/basic-authenticator.ts`](auth/authenticators/basic-authenticator.ts) | HTTP Basic Auth |
| [`auth/authenticators/bearer-token-authenticator.ts`](auth/authenticators/bearer-token-authenticator.ts) | Static bearer token |
| [`auth/authenticators/cloud-pak-for-data-authenticator.ts`](auth/authenticators/cloud-pak-for-data-authenticator.ts) | CP4D |
| [`auth/authenticators/container-authenticator.ts`](auth/authenticators/container-authenticator.ts) | Container / CR token |
| [`auth/authenticators/vpc-instance-authenticator.ts`](auth/authenticators/vpc-instance-authenticator.ts) | VPC Instance Metadata |
| [`auth/authenticators/mcsp-authenticator.ts`](auth/authenticators/mcsp-authenticator.ts) | MCSP v1 |
| [`auth/authenticators/mcspv2-authenticator.ts`](auth/authenticators/mcspv2-authenticator.ts) | MCSP v2 |
| [`auth/authenticators/no-auth-authenticator.ts`](auth/authenticators/no-auth-authenticator.ts) | No-op |
| [`auth/utils/`](auth/utils/) | `get-authenticator-from-environment`, credential file reader |

## Build, test & lint

```bash
npm run build          # compile TypeScript → dist/ and es/ (REQUIRED before running tests)
npm test               # Jest unit tests (test/unit/)
npm run lint           # ESLint check
npm run eslint:fix     # ESLint auto-fix
npm run all            # build + test + lint
```

Run a single test file:
```bash
NODE_OPTIONS=--experimental-vm-modules npx jest test/unit/iam-authenticator.test.js
```

- TypeScript config: [`tsconfig.json`](tsconfig.json) (CommonJS) and [`tsconfig-es6.json`](tsconfig-es6.json) (ES modules)
- Linter config: [`.eslintrc.js`](.eslintrc.js) (Airbnb base + TypeScript)
- Formatter: Prettier ([`.prettierrc`](.prettierrc))
- Test framework: Jest 29 (config in `package.json → jest`)
- Never edit files under `dist/` or `es/` directly — they are generated

## ⚠️ Critical: tests import from `dist/`, not source

**All unit tests use `require('../../dist/...')` — they test the compiled output, not TypeScript source.**
You **must** run `npm run build` after any source change before running tests, otherwise tests silently exercise stale compiled code.

## Adding a new authenticator

1. Create `auth/authenticators/<name>-authenticator.ts` implementing the `Authenticator` interface.
2. If it uses a token, create `auth/token-managers/<name>-token-manager.ts`.
3. Export the new class from `auth/authenticators/index.ts` and `auth/index.ts`.
4. Re-export from the root [`index.ts`](index.ts).
5. Register in `auth/utils/get-authenticator-from-environment.ts`.
6. Add unit tests under `test/unit/` (as `.js` files, importing from `../../dist/`).

## Naming conventions

- Source files: `kebab-case.ts` (TypeScript)
- Test files: `test/unit/<module-name>.test.js` (JavaScript, not TypeScript)
- Class names: `PascalCase`
- Internal (unexported) helpers go in [`lib/private-helpers.ts`](lib/private-helpers.ts)

## Code style

- Prettier: single quotes, print width 100, trailing commas (ES5), 2-space indent, no tabs
- ESLint: Airbnb base (JS) / airbnb-typescript/base (TS) + prettier override
- TS-specific: `no-param-reassign` off, `import/prefer-default-export` off, `no-else-return` off
- TypeScript strict mode is **not** fully enabled — only `alwaysStrict` is set; `noImplicitAny`, `strictNullChecks`, etc. are disabled

## Credentials and config

- Credential file: `ibm-credentials.env` (path from `IBM_CREDENTIALS_FILE` env var, or home dir)
- Browser builds use `auth/utils/read-credentials-file.browser.ts` (no filesystem access) — wired via `package.json "browser"` field override
- Format: `SERVICE_NAME_<PROPERTY>=value` (see [`Authentication.md`](Authentication.md))
- `getAuthenticatorFromEnvironment` defaults to IAM if `apikey` is present, Container auth otherwise (no auth type specified)

## Dependencies

Key runtime dependencies (see [`package.json`](package.json)):

| Package | Use |
|---|---|
| `axios` | HTTP client |
| `retry-axios` | Retry interceptor for Axios |
| `jsonwebtoken` | JWT parsing |
| `form-data` | Multipart form requests |
| `mime-types` / `file-type` | Content-type detection |
| `dotenv` | `.env` file loading |
| `tough-cookie` | Cookie jar support |
| `load-esm` | Dynamic ESM import helper (needed because this package is CJS) |
