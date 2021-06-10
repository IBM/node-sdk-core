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
var authenticator_1 = require("./authenticator");
exports.Authenticator = authenticator_1.Authenticator;
var basic_authenticator_1 = require("./basic-authenticator");
exports.BasicAuthenticator = basic_authenticator_1.BasicAuthenticator;
var bearer_token_authenticator_1 = require("./bearer-token-authenticator");
exports.BearerTokenAuthenticator = bearer_token_authenticator_1.BearerTokenAuthenticator;
var cloud_pak_for_data_authenticator_1 = require("./cloud-pak-for-data-authenticator");
exports.CloudPakForDataAuthenticator = cloud_pak_for_data_authenticator_1.CloudPakForDataAuthenticator;
var iam_authenticator_1 = require("./iam-authenticator");
exports.IamAuthenticator = iam_authenticator_1.IamAuthenticator;
var no_auth_authenticator_1 = require("./no-auth-authenticator");
exports.NoAuthAuthenticator = no_auth_authenticator_1.NoAuthAuthenticator;
var token_request_based_authenticator_1 = require("./token-request-based-authenticator");
exports.TokenRequestBasedAuthenticator = token_request_based_authenticator_1.TokenRequestBasedAuthenticator;
