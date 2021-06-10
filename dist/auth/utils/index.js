"use strict";
/**
 * Copyright 2019 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module utils
 * Helper functions used by generated SDKs.
 *
 * functions:
 *   getAuthenticatorFromEnvironment: Get authenticator from external sources.
 *   readExternalSources: Get config object from external sources.
 */
__export(require("./helpers"));
__export(require("./read-credentials-file"));
var get_authenticator_from_environment_1 = require("./get-authenticator-from-environment");
exports.getAuthenticatorFromEnvironment = get_authenticator_from_environment_1.getAuthenticatorFromEnvironment;
var read_external_sources_1 = require("./read-external-sources");
exports.readExternalSources = read_external_sources_1.readExternalSources;
