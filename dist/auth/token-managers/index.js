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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module token-managers
 * The ibm-cloud-sdk-core module supports the following types of token authentication:
 *
 * Identity and Access Management (IAM)
 * Cloud Pak for Data
 *
 * The token managers sit inside of an authenticator and do the work to retrieve
 * tokens where as the authenticators add these tokens to the actual request.
 *
 * classes:
 *   IamTokenManager: Token Manager of CloudPak for data.
 *   Cp4dTokenManager: Authenticator for passing IAM authentication information to service endpoint.
 *   JwtTokenManager: A class for shared functionality for parsing, storing, and requesting JWT tokens.
 */
var iam_token_manager_1 = require("./iam-token-manager");
exports.IamTokenManager = iam_token_manager_1.IamTokenManager;
var cp4d_token_manager_1 = require("./cp4d-token-manager");
exports.Cp4dTokenManager = cp4d_token_manager_1.Cp4dTokenManager;
var jwt_token_manager_1 = require("./jwt-token-manager");
exports.JwtTokenManager = jwt_token_manager_1.JwtTokenManager;
var token_manager_1 = require("./token-manager");
exports.TokenManager = token_manager_1.TokenManager;
