# typescript-publish

[![Build Status](https://travis-ci.com/MasterOdin/tsc-publish.svg?branch=master)](https://travis-ci.com/MasterOdin/tsc-publish)

Utility package to handle publishing standard TypeScript packages.

This utility helps to ensure that various steps are run before publishing as well to aim to create a minimal
distributed package, which only contains the compiled code, README, LICENSE, and other necessary files in a
flat structure as specified by the tsconfig.json. This allows one to specify a build directory separate from
the source code (keeping the working repo nice and clean), and that the end-user will see a flat structure for
easier importing.

For example, assume you have the following directory structure:
```
dist/
  foo.js
  foo.d.ts
  index.js
  index.d.ts
src/
  src_files
package.json
README.md
tsconfig.json
```

The "normal" way of doing this is to build your typescript files in `src/` to `dist/` and then specify just `dist/`
in the files directive in `package.json` and that the main should point at `dist/index.js`. While this works fine if
everything the user would want to import is exposed in `./dist/index.js`, this can be very cumbersome and lead to
bloated files. Additionally, if the user wants to import something from `foo.js`, they will have to do something like
`import {bar} from 'your-package/dist/foo'` which is cumbersome at best. This package helps to alleviate these pain
points such that running it will produce the following directory structure:
```
dist/
  foo.js
  foo.d.ts
  index.js
  index.d.ts
  README.md
  package.json
```
where `tsc` handles publishing to your `outDir` and `tsc-publish` handles copying all of the other metadata files, using
the `.npmignore` file if it exists, else just copying in `package.json` and `README`, `LICEN[CS]E`, and `CHANGELOG`.

From there, it publishes directly within the `dist/` directory, meaning you can minimize the amount of imports in `index.js`
and that consumers can more cleanly import other sources doing `import {bar} from 'your-package/foo`.

Additionally, tsc-publish will help ensure that all steps of the build/publish lifecycle are hit to help ensure
that no steps are missed. By default, it will run:
* lint
* build
* test

and if any of those fail, the publish is cancelled.

## Installation
```bash
npm install --save-dev tsc-publish
```

## Usage
```bash
$ tsc-publish --help
Usage: tsc-publish [options]

Options:
  -V, --version                  output the version number
  --dryrun, --dry-run            Do a dry-run of tsc-publish without publishing
  --postinstall, --post-install  Run post-install step for tsc-publish
  --no-checks                    Will not run lint or test steps
  -h, --help                     output usage information
```

## package.json
It's recommended to add `"prepublishOnly": "echo \"Run tsc-publish instead!\" && exit 1"` to the
`scripts` object in the `package.json` to prevent any accidential `npm publish` usage.

Add to the package.json `scripts`:
```json
"scripts" {
    "tsc-publish-bugfix": "tsc-publish --bugfix",
    "tsc-publish-minor": "tsc-publish --minor",
    "tsc-publish-major": "tsc-public --major"
}
```
