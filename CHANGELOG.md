## [0.3.5](https://github.com/IBM/node-sdk-core/compare/v0.3.4...v0.3.5) (2019-08-07)


### Bug Fixes

* share service request wrapper instance with token managers ([#36](https://github.com/IBM/node-sdk-core/issues/36)) ([e7609e2](https://github.com/IBM/node-sdk-core/commit/e7609e2))

## [0.3.4](https://github.com/IBM/node-sdk-core/compare/v0.3.3...v0.3.4) (2019-08-05)


### Bug Fixes

* extend constructor options type to allow additional properties ([#35](https://github.com/IBM/node-sdk-core/issues/35)) ([70af0c9](https://github.com/IBM/node-sdk-core/commit/70af0c9))

## [0.3.3](https://github.com/IBM/node-sdk-core/compare/v0.3.2...v0.3.3) (2019-07-17)


### Bug Fixes

* add deprecation notice for node versions 6 and 8 ([#32](https://github.com/IBM/node-sdk-core/issues/32)) ([9e3c667](https://github.com/IBM/node-sdk-core/commit/9e3c667))

## [0.3.2](https://github.com/IBM/node-sdk-core/compare/v0.3.1...v0.3.2) (2019-06-23)


### Bug Fixes

* read iam client id and secret from environment variables ([#30](https://github.com/IBM/node-sdk-core/issues/30)) ([2247d0a](https://github.com/IBM/node-sdk-core/commit/2247d0a))

## [0.3.1](https://github.com/IBM/node-sdk-core/compare/v0.3.0...v0.3.1) (2019-06-06)


### Bug Fixes

* expose the body in the detailed response under the field `result` ([f4aa4f9](https://github.com/IBM/node-sdk-core/commit/f4aa4f9))

# [0.3.0](https://github.com/IBM/node-sdk-core/compare/v0.2.8...v0.3.0) (2019-06-05)


### Features

* add `IcpTokenManagerV1` as a top-level export of the package ([cfa3e1b](https://github.com/IBM/node-sdk-core/commit/cfa3e1b))
* add new token manager for ICP4D ([ee1ddad](https://github.com/IBM/node-sdk-core/commit/ee1ddad))
* add new token manager for ICP4D ([#26](https://github.com/IBM/node-sdk-core/issues/26)) ([2097a64](https://github.com/IBM/node-sdk-core/commit/2097a64))
* carry `disable_ssl_verification` through to token managers ([4f2f789](https://github.com/IBM/node-sdk-core/commit/4f2f789))

## [0.2.8](https://github.com/IBM/node-sdk-core/compare/v0.2.7...v0.2.8) (2019-05-30)


### Bug Fixes

* default request body size to Infinity ([6cea2b9](https://github.com/IBM/node-sdk-core/commit/6cea2b9))

## [0.2.7](https://github.com/IBM/node-sdk-core/compare/v0.2.6...v0.2.7) (2019-05-24)


### Bug Fixes

* remove node request objects from detailed response ([9ac5673](https://github.com/IBM/node-sdk-core/commit/9ac5673))
* remove node request objects from detailed response ([#25](https://github.com/IBM/node-sdk-core/issues/25)) ([192d8cf](https://github.com/IBM/node-sdk-core/commit/192d8cf))

## [0.2.6](https://github.com/IBM/node-sdk-core/compare/v0.2.5...v0.2.6) (2019-05-21)


### Bug Fixes

* temporarily disable gzipping until axios bug fix is released ([b26a310](https://github.com/IBM/node-sdk-core/commit/b26a310))

## [0.2.5](https://github.com/IBM/node-sdk-core/compare/v0.2.4...v0.2.5) (2019-05-15)


### Bug Fixes

* allow users to debug axios traffic ([fd41509](https://github.com/IBM/node-sdk-core/commit/fd41509))

## [0.2.4](https://github.com/IBM/node-sdk-core/compare/v0.2.3...v0.2.4) (2019-05-07)


### Bug Fixes

* **IAM:** renamed UserOptions iam_secret to iam_client_secret to be consistent with other cores ([f755c9c](https://github.com/IBM/node-sdk-core/commit/f755c9c))

## [0.2.3](https://github.com/IBM/node-sdk-core/compare/v0.2.2...v0.2.3) (2019-05-07)


### Bug Fixes

* do not read credentials file in webpack override scenario ([9af4567](https://github.com/IBM/node-sdk-core/commit/9af4567))
* do not read credentials file in webpack override scenario ([#19](https://github.com/IBM/node-sdk-core/issues/19)) ([ec64ae1](https://github.com/IBM/node-sdk-core/commit/ec64ae1))

## [0.2.2](https://github.com/IBM/node-sdk-core/compare/v0.2.1...v0.2.2) (2019-05-01)


### Bug Fixes

* carry user options from constructor to axios parameters ([65d55ec](https://github.com/IBM/node-sdk-core/commit/65d55ec))

## [0.2.1](https://github.com/IBM/node-sdk-core/compare/v0.2.0...v0.2.1) (2019-04-29)


### Bug Fixes

* allow iam client id and secret to be read from constructor ([#17](https://github.com/IBM/node-sdk-core/issues/17)) ([3c88edb](https://github.com/IBM/node-sdk-core/commit/3c88edb))

# [0.2.0](https://github.com/IBM/node-sdk-core/compare/v0.1.2...v0.2.0) (2019-04-19)


### Features

* allow IAM clientid/secret to be configured ([#14](https://github.com/IBM/node-sdk-core/issues/14)) ([ff8f2e7](https://github.com/IBM/node-sdk-core/commit/ff8f2e7))
