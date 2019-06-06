[![Build Status](https://travis-ci.com/IBM/node-sdk-core.svg?branch=master)](https://travis-ci.com/IBM/node-sdk-core)
[![npm-version](https://img.shields.io/npm/v/ibm-cloud-sdk-core.svg)](https://www.npmjs.com/package/ibm-cloud-sdk-core)
[![codecov](https://codecov.io/gh/IBM/node-sdk-core/branch/master/graph/badge.svg)](https://codecov.io/gh/IBM/node-sdk-core)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

# node-sdk-core
This project contains the core functionality used by Node SDK's generated by the IBM OpenAPI 3 SDK Generator (`openapi-sdkgen`).
Code generated by `openapi-sdkgen` will depend on the functionality contained in this project.

## Installation
`npm install ibm-cloud-sdk-core`

## Usage
This package exports a single object containing a number of modules as top level properties.

Example:
```js
// do some stuff
// this is TypeScript, since the `openapi-sdkgen` project generates TypeScript
import { BaseService } from 'ibm-cloud-sdk-core';

class YourSDK extends BaseService { ... }
```

## Authentication Types
There are several flavors of authentication supported in this package. To specify the intended authentication pattern to use, the user can pass in the parameter `authentication_type`. This parameter is optional, but it may become required in a future major release. The options for this parameter are `basic`, `iam`, and `icp4d`.

### basic
This indicates Basic Auth is to be used. Users will pass in a `username` and `password` and the SDK will generate a Basic Auth header to send with requests to the service.

### iam
This indicates that IAM token authentication is to be used. Users can pass in an `iam_apikey` or an `iam_access_token`. If an API key is used, the SDK will manage the token for the user. In either case, the SDK will generate a Bearer Auth header to send with requests to the service.

### icp4d
This indicates that the service is an instance of ICP4D, which has its own version of token authentication. Users can pass in a `username` and `password`, or an `icp4d_access_token`. If a username and password is given, the SDK will manage the token for the user.
A `url` is **required** for this type. In order to use an SDK-managed token with ICP4D authentication, this option **must** be passed in.

## Available Modules
### BaseService
This Class is the base class that all generated service-specific classes inherit from. It implements credentials handling and other shared behavior.

### IamTokenManagerV1
This Class contains logic for managing an IAM token over its lifetime. Tokens can be requested or set manually. When requested, the token manager will either return the current token or request a new token if one is not saved or the the current token is expired. If a token is manually set, it must be managed by the user.

### Icp4dTokenManagerV1
This Class is similar in function to IamTokenManagerV1. The only difference is that the `url` parameter is required, it takes a `username` and `password` instead of an API key, and manages tokens for instances of ICP4D. To use this token manager in an SDK, the parameter `authentication_type` must be set to `icp4d` in the constructor.

### isFileParam
This function takes an Object and returns `true` if the object is a Stream, a Buffer, has a `value` property, or has a `data` property that is a file param (checked recursively).

### isEmptyObject
This function takes an Object and returns `true` if it is an empty object.

### getContentType
This function attempts to retrieve the content type of the input and returns `null` if not found.

### stripTrailingSlash
This function takes a string and returns an identical string but with a forward slash removed from the end, if present.

### getMissingParams
This function takes in a list of required parameters and a parameters object and returns `null` if all required parameters are present and an Error if any are missing.

### isHTML
This function returns `true` if the given string is HTML.

### getFormat
This function takes a parameters object and a list of "formats". It returns the first match from the formats array that is a key in the parameters object, or `null` if there are no matches.

### buildRequestFileObject
This function builds a "form-data" object for each file parameter.

### toLowerKeys
This function takes an Object and returns the same object with all of the top-level keys converted to lower case. Note: it does not convert nested keys.

### qs
This module includes one function, `stringify`.

#### qs.stringify
This function takes an Object containing query parameters and returns a URI-encoded query String. This function is modified for use with Watson - the query parameter `watson-token` will not be encoded, as the server requires non-encoded tokens for authentication.

### contentType
This module includes two functions, `fromHeader` and `fromFilename`.

#### contentType.fromHeader
This function attempts to use the first bytes of a file to match the file contents with the associated mime type. Returns `undefined` if no matching mime type is found.

#### contentType.fromFilename
This function attempts to parse the extension from a file and return the mime type associated with the file contents. Returns `undefined` if no matching mime type is found. 

### streamToPromise
This function takes a Stream and converts it to a Promise that resolves with the final text, encoded with `utf-8`.
