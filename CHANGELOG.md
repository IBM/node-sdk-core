## [2.0.4](https://github.com/IBM/node-sdk-core/compare/v2.0.3...v2.0.4) (2020-01-30)


### Bug Fixes

* use consistent fields between success and error response objects ([#78](https://github.com/IBM/node-sdk-core/issues/78)) ([902d712](https://github.com/IBM/node-sdk-core/commit/902d712f3623edbec606a3223fb366971532346d))

## [2.0.3](https://github.com/IBM/node-sdk-core/compare/v2.0.2...v2.0.3) (2020-01-16)


### Bug Fixes

* use constant defined by generated sdks for url ([#77](https://github.com/IBM/node-sdk-core/issues/77)) ([cb3cc81](https://github.com/IBM/node-sdk-core/commit/cb3cc810d1a7b40a8471271b239f5158b91b0ce6))

## [2.0.2](https://github.com/IBM/node-sdk-core/compare/v2.0.1...v2.0.2) (2020-01-09)


### Bug Fixes

* export unitTestUtils functions as a module ([#76](https://github.com/IBM/node-sdk-core/issues/76)) ([a148da9](https://github.com/IBM/node-sdk-core/commit/a148da9ad882c97c1c4f1c5417c43958db584e3e))

## [2.0.1](https://github.com/IBM/node-sdk-core/compare/v2.0.0...v2.0.1) (2019-12-06)


### Bug Fixes

* convert test utils to .ts ([#74](https://github.com/IBM/node-sdk-core/issues/74)) ([ceec376](https://github.com/IBM/node-sdk-core/commit/ceec3760d50f8e958d35d4c0ca292f99a58bf795)), closes [#993](https://github.com/IBM/node-sdk-core/issues/993)

# [2.0.0](https://github.com/IBM/node-sdk-core/compare/v1.3.0...v2.0.0) (2019-11-19)


### Features

* changes to node-sdk-core to work with service factory feature ([#72](https://github.com/IBM/node-sdk-core/issues/72)) ([cde4cd6](https://github.com/IBM/node-sdk-core/commit/cde4cd68e5a9910fb4f8abacd90a5a3b44b3f8f5))


### BREAKING CHANGES

* The `BaseService` will no longer look for configurations externally by default. A new factory method is provided to create an instance from external configuration.

* feat: changes to node-sdk-core to work with service factory feature

* `BaseService` constructor will no longer call `configureService`. 

* updated test to reflect base service constructor does not call configureService

* added test for getting credentials from vcap

* removed `name` and `serviceVersion` because they are not referenced anymore

* added comment for vcap parsing function. removed vcap_services dependency

* added debug messages for when returning empty credential

# [1.3.0](https://github.com/IBM/node-sdk-core/compare/v1.2.0...v1.3.0) (2019-10-22)


### Features

* adding configureService method for external config options ([#66](https://github.com/IBM/node-sdk-core/issues/66)) ([7324919](https://github.com/IBM/node-sdk-core/commit/7324919))

# [1.2.0](https://github.com/IBM/node-sdk-core/compare/v1.1.0...v1.2.0) (2019-10-15)


### Features

* export unit test utility methods to be used in SDKs ([#65](https://github.com/IBM/node-sdk-core/issues/65)) ([0305974](https://github.com/IBM/node-sdk-core/commit/0305974))

# [1.1.0](https://github.com/IBM/node-sdk-core/compare/v1.0.0...v1.1.0) (2019-10-14)


### Features

* adding debug logger ([#64](https://github.com/IBM/node-sdk-core/issues/64)) ([6079ca0](https://github.com/IBM/node-sdk-core/commit/6079ca0))

# [1.0.0](https://github.com/IBM/node-sdk-core/compare/v0.3.6...v1.0.0) (2019-10-03)


### Bug Fixes

* Move check for serviceUrl to createRequest ([#47](https://github.com/IBM/node-sdk-core/issues/47)) ([6f04739](https://github.com/IBM/node-sdk-core/commit/6f04739))
* parse result from response in token managers ([6bbe423](https://github.com/IBM/node-sdk-core/commit/6bbe423))
* provide bundlers alternate file for browser support ([#58](https://github.com/IBM/node-sdk-core/issues/58)) ([88a9d16](https://github.com/IBM/node-sdk-core/commit/88a9d16))


### Build System

* drop support for Node versions 6 and 8 ([#33](https://github.com/IBM/node-sdk-core/issues/33)) ([d47c737](https://github.com/IBM/node-sdk-core/commit/d47c737))


### Code Refactoring

* look for credentials file in working dir before home dir ([#46](https://github.com/IBM/node-sdk-core/issues/46)) ([c5556de](https://github.com/IBM/node-sdk-core/commit/c5556de))
* return detailed response as second callback argument ([#34](https://github.com/IBM/node-sdk-core/issues/34)) ([dc24154](https://github.com/IBM/node-sdk-core/commit/dc24154))


### Features

* add `setServiceUrl` method as a setter for the `serviceUrl` property ([#41](https://github.com/IBM/node-sdk-core/issues/41)) ([cfb188f](https://github.com/IBM/node-sdk-core/commit/cfb188f))
* add specific error handling for SSL errors with cloud private instances ([#54](https://github.com/IBM/node-sdk-core/issues/54)) ([056ec9a](https://github.com/IBM/node-sdk-core/commit/056ec9a))
* export `UserOptions` interface from the BaseService ([#50](https://github.com/IBM/node-sdk-core/issues/50)) ([4f0075a](https://github.com/IBM/node-sdk-core/commit/4f0075a))
* implement new authenticators to handle sdk authentication ([#37](https://github.com/IBM/node-sdk-core/issues/37)) ([f876b6d](https://github.com/IBM/node-sdk-core/commit/f876b6d))
* refactor core to use Promises instead of callbacks ([#55](https://github.com/IBM/node-sdk-core/issues/55)) ([9ec8afd](https://github.com/IBM/node-sdk-core/commit/9ec8afd))


### BREAKING CHANGES

* None of the authenticators or request methods take callbacks as arguments anymore - they return Promises instead.
* Users that have credential files in both the working directory and the home directory will see a change in which one is used.
* The internal property `url` no longer exists on the `baseOptions` object, it has been renamed to `serviceUrl`
* The old style of passing credentials to the base service will no longer work. An Authenticator instance MUST be passed in to the base service constructor.
* token managers no longer support user access tokens. use BearerTokenAuthenticator instead
* The class names of the token managers have changed.
* `Icp4dTokenManagerV1` renamed to `Cp4dTokenManager`
* `IamTokenManagerV1` renamed to `IamTokenManager`
* `JwtTokenManagerV1` renamed to `JwtTokenManager`
* The public method `setAuthorizationInfo` is renamed to `setClientIdAndSecret`
* The response body is no longer the 2nd callback argument, the detailed response is. The body is located under the `result` property. The `data` property is removed.
* This SDK may no longer work with applications running on Node 6 or 8.

## [0.3.6](https://github.com/IBM/node-sdk-core/compare/v0.3.5...v0.3.6) (2019-09-16)


### Bug Fixes

* Fix handling of array form parameters. ([#43](https://github.com/IBM/node-sdk-core/issues/43)) ([bad8960](https://github.com/IBM/node-sdk-core/commit/bad8960))

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
