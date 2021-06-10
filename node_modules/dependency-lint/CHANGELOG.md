# Changelog

### 5.0.0 (2017-03-18)

* add formatters: minimal (the new default), json, summary (the previous default)

---

### 4.3.1 (2016-12-27)

* do not auto correct ignored errors

----
### 4.3.0 (2016-11-30)

* fix transpiler support to only use on files matching the extension
* fix installed module validation when module is listed as dependency and devDependency

----

### 4.2.0 (2016-10-18)

* extend transpiler configuration to support [babel](http://babeljs.io/)

----
### 4.1.5 (2016-10-11)

* fix `--auto-correct` indentation of `package.json`

----

### 4.1.4 (2016-10-11)

* fix missing built in modules by using npm package: `builtin-modules`

----

### 4.1.3 (2016-08-27)

* update dependencies

----

### 4.1.2 (2016-08-27)

* Add CLI option `--auto-correct` to automatically remove unused dependencies and move mislabeled dependencies.

----

### 4.1.1 (2016-08-25)

* respect word boundaries when searching scripts for use of a module's executables

----

### 4.1.0 (2016-07-20)

* find module executables by parsing `package.json` files
  * previously found them by reading the symbolic links in `node_modules/.bin`
  * adds support for other package managers like [ied](https://github.com/alexanderGugel/ied)
    and [pnpm](https://github.com/rstacruz/pnpm)

----

### 4.0.2 (2016-06-24)

* update dependencies

---

### 4.0.1 (2016-03-27)

* report dependency-lint as used when listed as a devDependency and unused

---
### 4.0.0 (2016-03-27)

**BREAKING CHANGES**
* add `ignoreErrors` configuration option
  * moved `allowUnused` to `ignoreErrors.unused`
* update configuration structure, see the configuration documentation for the new structure
  * `devFilePatterns` -> `requiredModules.files.dev`
  * `devScripts` -> `executedModules.npmScripts.dev`
  * `filePattern` -> `requiredModules.files.root`
  * `ignoreFilePatterns` -> `requiredModules.files.ignore`
  * `stripLoaders` -> `requiredModules.stripLoaders`
  * `transpilers` -> `requiredModules.transpilers`

**Updates**
* add `version` as to default `devScripts`
* expand `devFilePatterns`
* when validating the versions of installed modules,
  ignore modules not installed from an `npm` registry
* add support for searching for module executables in shell scripts, see the configuration documentation

---
### 3.1.2 (2016-02-16)

* move configuration documentation from default configuration file to docs folder

---
### 3.1.1 (2016-02-13)

* move configuration documentation from README to default configuration file

---
### 3.1.0 (2016-02-13)

* check that each module listed in `package.json` is installed with the correct semantic version

---
### 3.0.0 (2016-02-09)

* remove support for configuration files with extensions: cson, coffee, js, json, yaml
  * please convert to dependency-lint.yml
* remove built in support for coffee-script
* add `transpilers` configuration option
* add `filePattern` configuration option

----
### 2.4.0 (2015-12-03)

* add option to ignore webpack loaders in requires

---
### 2.3.0 (2015-10-22)

* add filename to javascript syntax error messages

---
### 2.2.1 (2015-07-28)

* update documentation

---
### 2.2.0 (2015-07-14)

* add support for config as ```.yaml```, ```.yml```

---
### 2.1.0 (2015-07-06)

* add error if module is listed as a dependency and a devDependency
* update dependencies

---
### 2.0.0 (2015-06-11)

* add support for config as ```.coffee```, ```.cson```, ```.js```
* update ```devFiles``` to ```devFilePatterns``` using glob patterns instead of regular expressions
* update ```ignoreFiles``` to ```ignoreFilePatterns``` using glob patterns instead of regular expressions
* ```node_modules``` is no longer ignored by default

---
### 1.4.2 (2015-05-26)

* update dependencies

---
### 1.4.1 (2015-05-12)

* more informative message when modules are not installed

---
### 1.4.0 (2015-05-08)

* add support for scoped modules
* update dependencies

---
### 1.3.2 (2015-03-28)

* ignore ```node_modules``` folder by default

---
### 1.3.1 (2015-03-15)

* update ```npm``` errors
  * list as unused when executable used
  * act like normal module when required as globally installed modules cannot be required

---
### 1.3.0 (2015-03-14)

* expect ```npm``` to be globally installed
  * always require removing it from your package

---
### 1.2.1 (2015-03-14)

* update dependencies

---
### 1.2.0 (2015-02-17)

* print where a module is used when it has an error

---
### 1.1.3 (2015-02-16)

* expose executable

---
### 1.1.2 (2015-02-16)

* add ```.npmignore```
* update documentation

---
### 1.1.1 (2015-02-16)

* catch coffeescript compilation errors

---
### 1.1.0 (2015-02-16)

* rename ```ignoreUnused``` to ```allowUnused```

---
### 1.0.0 (2015-02-16)

* initial implementation
