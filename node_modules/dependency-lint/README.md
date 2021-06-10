# dependency-lint
[![Build Status](https://img.shields.io/circleci/project/charlierudolph/dependency-lint/master.svg)](https://circleci.com/gh/charlierudolph/dependency-lint?)
[![Dependency Status](https://img.shields.io/david/charlierudolph/dependency-lint.svg)](https://david-dm.org/charlierudolph/dependency-lint)
[![NPM Version](https://img.shields.io/npm/v/dependency-lint.svg)](https://www.npmjs.com/package/dependency-lint)

Lints your NPM `dependencies` and `devDependencies` reporting which node modules are
* **missing** and should be added to your `dependencies` or `devDependencies`
* **unused** and should be removed from your `dependencies` or `devDependencies`
* **mislabeled** and should be moved from `dependencies` to `devDependencies` or vice versa

## Installation

Supported on [Node.js](https://nodejs.org/en) versions 4, 5, and 6

```
$ npm install dependency-lint
```

## Usage

```
$ dependency-lint
```

To automatically remove unused dependencies and move mislabeled dependencies:
```
$ dependency-lint --auto-correct
```

## How it works
`dependency-lint` compares the node modules listed in your `package.json` and
the node modules it determines are used. A node module is used if:

* it is required in a javascript file (or a file that transpiles to javascript)
* one of its executables is used in a script in your `package.json` or in a shell script

Since this does not cover all the possible ways that a node module can be used,
`dependency-lint` can be [configured](docs/configuration.md#ignoreerrors)
to ignore specific errors. Please create an
[issue](https://github.com/charlierudolph/dependency-lint/issues)
anytime you need to use this, so we can discuss new ways to determine if and
how a node module is used.

## Configuration
Please see [here](docs/configuration.md) for an explanation of all the options.
Custom configuration should be placed at `dependency-lint.yml` in your project directory.
You can create a configuration file by running
```
dependency-lint --generate-config
```
Any options not set in your configuration file will be given there default value.

## Formatters
Three formatters are available and can be switched between with the `--format` option
```
dependency-lint --format <format>
```

* `minimal` (default) - prints only the modules with errors
* `summary` - prints all modules
* `json` - prints JSON of the form `{dependencies, devDependencies}` where each is array of objects with the keys
  * `name` - name of the module
  * `files` - list of the files that require the module or execute the module
  * `scripts` - list of scripts in your `package.json` that execute the module
  * `error` - null or one of the following strings: "missing", "should be dependency", "should be dev dependency", "unused"
  * `errorIgnored` - if dependency lint has been configured to ignore this error.
