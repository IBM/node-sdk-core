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
 * @module ibm-cloud-sdk-core
 */
var unitTestUtils = require("./lib/sdk-test-helpers");
exports.unitTestUtils = unitTestUtils;
var base_service_1 = require("./lib/base-service");
exports.BaseService = base_service_1.BaseService;
__export(require("./auth"));
__export(require("./lib/helper"));
var querystring_1 = require("./lib/querystring");
exports.qs = querystring_1.default;
var content_type_1 = require("./lib/content-type");
exports.contentType = content_type_1.default;
__export(require("./lib/stream-to-promise"));
