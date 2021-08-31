## [2.14.1](https://github.com/IBM/node-sdk-core/compare/v2.14.0...v2.14.1) (2021-08-31)


### Performance Improvements

* use maxContentLength -1 instead of Infinity ([#158](https://github.com/IBM/node-sdk-core/issues/158)) ([adbbb3b](https://github.com/IBM/node-sdk-core/commit/adbbb3bceb388b34753f9fe3579eec3f0520ddb3))

# [2.14.0](https://github.com/IBM/node-sdk-core/compare/v2.13.0...v2.14.0) (2021-08-27)


### Features

* add enableRetries and disableRetries ([#156](https://github.com/IBM/node-sdk-core/issues/156)) ([d6f12e7](https://github.com/IBM/node-sdk-core/commit/d6f12e76c91f9f0ddce4fef09f5ff024ca3947bc))

# [2.13.0](https://github.com/IBM/node-sdk-core/compare/v2.12.2...v2.13.0) (2021-08-18)


### Features

* add method `getHttpClient` to get underlying axios instance of base service ([#155](https://github.com/IBM/node-sdk-core/issues/155)) ([2aede01](https://github.com/IBM/node-sdk-core/commit/2aede013cd398a2605fd67c0412e6ca5669c415e))

## [2.12.2](https://github.com/IBM/node-sdk-core/compare/v2.12.1...v2.12.2) (2021-08-13)


### Bug Fixes

* support 'AUTHTYPE' as alias for 'AUTH_TYPE' config property ([#153](https://github.com/IBM/node-sdk-core/issues/153)) ([fccf209](https://github.com/IBM/node-sdk-core/commit/fccf2093874835d9c77c08843809b79e57fb0e78))

## [2.12.1](https://github.com/IBM/node-sdk-core/compare/v2.12.0...v2.12.1) (2021-08-11)


### Bug Fixes

* use typescript 3.8.x to build the published code ([#152](https://github.com/IBM/node-sdk-core/issues/152)) ([4362a37](https://github.com/IBM/node-sdk-core/commit/4362a376b3419baa5e7e428b03490bf021d0a295))

# [2.12.0](https://github.com/IBM/node-sdk-core/compare/v2.11.3...v2.12.0) (2021-08-10)


### Features

* add support for new ContainerAuthenticator ([#151](https://github.com/IBM/node-sdk-core/issues/151)) ([b01c011](https://github.com/IBM/node-sdk-core/commit/b01c011021671ebeb3c49de84fb17315eae3629f))

## [2.11.3](https://github.com/IBM/node-sdk-core/compare/v2.11.2...v2.11.3) (2021-06-14)


### Bug Fixes

* **build:** revert inadvertently-committed directories ([#147](https://github.com/IBM/node-sdk-core/issues/147)) ([1fb6295](https://github.com/IBM/node-sdk-core/commit/1fb62955e74e73c805b6221ca85e22517335f273))

## [2.11.2](https://github.com/IBM/node-sdk-core/compare/v2.11.1...v2.11.2) (2021-06-10)


### Bug Fixes

* remove default limit on request body length ([#145](https://github.com/IBM/node-sdk-core/issues/145)) ([abf604a](https://github.com/IBM/node-sdk-core/commit/abf604a10483194d0e46e3a1d2e4c27c20331867))

## [2.11.1](https://github.com/IBM/node-sdk-core/compare/v2.11.0...v2.11.1) (2021-06-07)


### Bug Fixes

* change constructServiceURL from method to function ([#141](https://github.com/IBM/node-sdk-core/issues/141)) ([cd2d28c](https://github.com/IBM/node-sdk-core/commit/cd2d28ce12b5189ab9de240d6b6d86aa77d33a73))

# [2.11.0](https://github.com/IBM/node-sdk-core/compare/v2.10.4...v2.11.0) (2021-05-27)


### Features

* add `BaseService.constructServiceURL` method ([#138](https://github.com/IBM/node-sdk-core/issues/138)) ([0e73bde](https://github.com/IBM/node-sdk-core/commit/0e73bde12df3cfab0b9243d0064ef40d93c1072a))

## [2.10.4](https://github.com/IBM/node-sdk-core/compare/v2.10.3...v2.10.4) (2021-05-10)


### Bug Fixes

* upgrade package-lock.json ([#136](https://github.com/IBM/node-sdk-core/issues/136)) ([1780894](https://github.com/IBM/node-sdk-core/commit/1780894d05cd8ba9dca9dd6040ee54ceb91275b5))

## [2.10.3](https://github.com/IBM/node-sdk-core/compare/v2.10.2...v2.10.3) (2021-04-01)


### Bug Fixes

* stub sdk-test-helpers in browser environments ([#132](https://github.com/IBM/node-sdk-core/issues/132)) ([006991b](https://github.com/IBM/node-sdk-core/commit/006991bfe89c0671f9c053457cebe52cec924fed))

## [2.10.2](https://github.com/IBM/node-sdk-core/compare/v2.10.1...v2.10.2) (2021-03-31)


### Bug Fixes

* **deps:** update dependencies to avoid vulnerabilities ([#131](https://github.com/IBM/node-sdk-core/issues/131)) ([b931472](https://github.com/IBM/node-sdk-core/commit/b931472d458b370af2132d387b70aedb067b3fb2))

## [2.10.1](https://github.com/IBM/node-sdk-core/compare/v2.10.0...v2.10.1) (2021-03-16)


### Bug Fixes

* enable symbolic-link credentials files ([#129](https://github.com/IBM/node-sdk-core/issues/129)) ([4b87d42](https://github.com/IBM/node-sdk-core/commit/4b87d423e320163bf34c9126ca06f848355f2ad4))

# [2.10.0](https://github.com/IBM/node-sdk-core/compare/v2.9.0...v2.10.0) (2021-03-13)


### Features

* add getQueryParam utility method to support pagination ([#128](https://github.com/IBM/node-sdk-core/issues/128)) ([d4f067a](https://github.com/IBM/node-sdk-core/commit/d4f067a8607fd10e0ea064e939b9c7f4e49108ce))

# [2.9.0](https://github.com/IBM/node-sdk-core/compare/v2.8.2...v2.9.0) (2021-03-12)


### Features

* support username/apikey use-case in CloudPakForDataAuthenticator ([#126](https://github.com/IBM/node-sdk-core/issues/126)) ([a7ca3a0](https://github.com/IBM/node-sdk-core/commit/a7ca3a083b3580b1776544a2958c90c1608fcc7c))

## [2.8.2](https://github.com/IBM/node-sdk-core/compare/v2.8.1...v2.8.2) (2021-03-12)


### Bug Fixes

* persist `enableGzipCompression` setting on the base service ([#127](https://github.com/IBM/node-sdk-core/issues/127)) ([1398044](https://github.com/IBM/node-sdk-core/commit/13980441fad3e0e71eb5e58ce33d66d63782308e))

## [2.8.1](https://github.com/IBM/node-sdk-core/compare/v2.8.0...v2.8.1) (2021-03-09)


### Bug Fixes

* canonicalize iam url ([#125](https://github.com/IBM/node-sdk-core/issues/125)) ([7ce6588](https://github.com/IBM/node-sdk-core/commit/7ce6588c8d0967d13bc3d548a30787360aae6205))

# [2.8.0](https://github.com/IBM/node-sdk-core/compare/v2.7.2...v2.8.0) (2021-02-19)


### Features

* **iam-authenticator:** expose refresh token with a getter - `getRefreshToken()` ([#122](https://github.com/IBM/node-sdk-core/issues/122)) ([d3c4611](https://github.com/IBM/node-sdk-core/commit/d3c46116e42ae6aff9e4a686e9ae4212635e46f2))

## [2.7.2](https://github.com/IBM/node-sdk-core/compare/v2.7.1...v2.7.2) (2021-02-10)


### Bug Fixes

* **build:** main migration ([#121](https://github.com/IBM/node-sdk-core/issues/121)) ([1919510](https://github.com/IBM/node-sdk-core/commit/19195104395ef830c020c36a0f36b60dce0c8eff))

## [2.7.1](https://github.com/IBM/node-sdk-core/compare/v2.7.0...v2.7.1) (2021-01-07)


### Bug Fixes

* **build:** upgrade semantic-release to latest (17.3.1) ([#120](https://github.com/IBM/node-sdk-core/issues/120)) ([3e3c099](https://github.com/IBM/node-sdk-core/commit/3e3c099ccb2b28d92dfa6d9bc975978aa461f5f7))
* change description inside package.json ([#119](https://github.com/IBM/node-sdk-core/issues/119)) ([30aeda9](https://github.com/IBM/node-sdk-core/commit/30aeda9a413087c351d43a500c336bff7c2fcec8))

# [2.7.0](https://github.com/IBM/node-sdk-core/compare/v2.6.0...v2.7.0) (2020-10-06)


### Features

* add support for compressing request bodies ([#111](https://github.com/IBM/node-sdk-core/issues/111)) ([7692d71](https://github.com/IBM/node-sdk-core/commit/7692d710fc2fb4f2c1cdfb3045d943c15d13bf1d))

# [2.6.0](https://github.com/IBM/node-sdk-core/compare/v2.5.0...v2.6.0) (2020-09-25)


### Features

* upgrade axios and re-enable gzipping responses ([#110](https://github.com/IBM/node-sdk-core/issues/110)) ([9e94251](https://github.com/IBM/node-sdk-core/commit/9e94251fd23cb60517022455017ed34d3a419362))

# [2.5.0](https://github.com/IBM/node-sdk-core/compare/v2.4.5...v2.5.0) (2020-09-18)


### Features

* **IAM Authenticator:** add support for optional 'scope' property ([#109](https://github.com/IBM/node-sdk-core/issues/109)) ([1c258b7](https://github.com/IBM/node-sdk-core/commit/1c258b71470c0228e021c959984cc887d849887b))

## [2.4.5](https://github.com/IBM/node-sdk-core/compare/v2.4.4...v2.4.5) (2020-08-12)


### Bug Fixes

* pin typescript dependency to 3.8.3 ([#107](https://github.com/IBM/node-sdk-core/issues/107)) ([ef27bc9](https://github.com/IBM/node-sdk-core/commit/ef27bc94b7626880cb4ab21c5c711bb98b34272d))

## [2.4.4](https://github.com/IBM/node-sdk-core/compare/v2.4.3...v2.4.4) (2020-08-06)


### Bug Fixes

* use `extend` with deep copy where necessary ([#106](https://github.com/IBM/node-sdk-core/issues/106)) ([566b81f](https://github.com/IBM/node-sdk-core/commit/566b81ffea3e88d148d1a7471b01e436432efb75))

## [2.4.3](https://github.com/IBM/node-sdk-core/compare/v2.4.2...v2.4.3) (2020-08-05)


### Bug Fixes

* support `disableSslVerification` when user provides custom httpsAgent ([#104](https://github.com/IBM/node-sdk-core/issues/104)) ([ef39327](https://github.com/IBM/node-sdk-core/commit/ef39327947a42ed357f19fa0db7f5edd063698c4))

## [2.4.2](https://github.com/IBM/node-sdk-core/compare/v2.4.1...v2.4.2) (2020-07-22)


### Bug Fixes

* move test utilities to lib/ and rely directly on `expect` ([#101](https://github.com/IBM/node-sdk-core/issues/101)) ([57ca4c2](https://github.com/IBM/node-sdk-core/commit/57ca4c2edba31a39bae479a041b974ffd94f31a3))

## [2.4.1](https://github.com/IBM/node-sdk-core/compare/v2.4.0...v2.4.1) (2020-05-14)


### Bug Fixes

* Remove trailing slash from url for extra cases ([#95](https://github.com/IBM/node-sdk-core/issues/95)) ([bcaa168](https://github.com/IBM/node-sdk-core/commit/bcaa168b4717b5921d33f72287f8bfbe7ce812f7))

# [2.4.0](https://github.com/IBM/node-sdk-core/compare/v2.3.2...v2.4.0) (2020-05-05)


### Features

* **token-manager:** Introduce a token-manager class for token handling ([#89](https://github.com/IBM/node-sdk-core/issues/89)) ([23c5f3f](https://github.com/IBM/node-sdk-core/commit/23c5f3ff26ec2c9ae58c47163c93a9a1532998b0))

## [2.3.2](https://github.com/IBM/node-sdk-core/compare/v2.3.1...v2.3.2) (2020-05-04)


### Bug Fixes

* flag required params as missing when explicitly undefined, null, or an empty string ([#90](https://github.com/IBM/node-sdk-core/issues/90)) ([414b674](https://github.com/IBM/node-sdk-core/commit/414b674d607e6dec73a163b0445c1854245f69b2))

## [2.3.1](https://github.com/IBM/node-sdk-core/compare/v2.3.0...v2.3.1) (2020-05-01)


### Bug Fixes

* Strip trailing slashes in sendRequest ([#92](https://github.com/IBM/node-sdk-core/issues/92)) ([3d8f568](https://github.com/IBM/node-sdk-core/commit/3d8f568e3911d3d17811e37c5e701db0508a251e))

# [2.3.0](https://github.com/IBM/node-sdk-core/compare/v2.2.0...v2.3.0) (2020-03-23)


### Features

* add optional cookie jar support ([#85](https://github.com/IBM/node-sdk-core/issues/85)) ([27e0060](https://github.com/IBM/node-sdk-core/commit/27e00606046c77d3060e1b62b9e46d1d25d0dceb))

# [2.2.0](https://github.com/IBM/node-sdk-core/compare/v2.1.0...v2.2.0) (2020-03-05)


### Features

* Pace requests to token server for new auth tokens ([#83](https://github.com/IBM/node-sdk-core/issues/83)) ([b14dc4e](https://github.com/IBM/node-sdk-core/commit/b14dc4eea3a629e66c1aa584a3909b29bf12c7b1))

# [2.1.0](https://github.com/IBM/node-sdk-core/compare/v2.0.4...v2.1.0) (2020-02-14)


### Features

* Pace token refresh requests to avoid rate-limiting ([#79](https://github.com/IBM/node-sdk-core/issues/79)) ([d908c0d](https://github.com/IBM/node-sdk-core/commit/d908c0d16ca9d16803b010ee3311c8589983e6c8))

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
