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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var token_managers_1 = require("../token-managers");
var utils_1 = require("../utils");
var token_request_based_authenticator_1 = require("./token-request-based-authenticator");
/**
 * The [[IamAuthenticator]] will use the user-supplied `apikey`
 * values to obtain a bearer token from a token server.  When the bearer token
 * expires, a new token is obtained from the token server. If specified, the
 * optional, mutually inclusive `clientId` and`clientSecret` pair can be used to
 * influence rate-limiting for requests to the IAM token server.
 *
 * The bearer token will be sent as an Authorization header in the form:
 *
 *      Authorization: Bearer <bearer-token>
 */
var IamAuthenticator = /** @class */ (function (_super) {
    __extends(IamAuthenticator, _super);
    /**
     *
     * Create a new [[IamAuthenticator]] instance.
     *
     * @param {object} options Configuration options for IAM authentication.
     * @param {boolean} options.disableSslVerification A flag that indicates
     *   whether verification of the token server's SSL certificate should be
     *   disabled or not
     * @param {string} options.url for HTTP token requests.
     * @param {object<string, string>} options.headers to be sent with every
     * @param {string} options.apikey The IAM api key.
     * @param {string} [options.clientId] The `clientId` and `clientSecret` fields are used to form a "basic"
     *   authorization header for IAM token requests.
     * @param {string} [options.clientSecret] The `clientId` and `clientSecret` fields are used to form a "basic"
     *   authorization header for IAM token requests.
     * @param {string} [options.scope] The "scope" parameter to use when fetching the bearer token from the
     *   IAM token server.
     * @throws {Error} When the configuration options are not valid.
     */
    function IamAuthenticator(options) {
        var _this = _super.call(this, options) || this;
        _this.requiredOptions = ['apikey'];
        utils_1.validateInput(options, _this.requiredOptions);
        _this.apikey = options.apikey;
        _this.clientId = options.clientId;
        _this.clientSecret = options.clientSecret;
        _this.scope = options.scope;
        // the param names are shared between the authenticator and the token
        // manager so we can just pass along the options object
        _this.tokenManager = new token_managers_1.IamTokenManager(options);
        return _this;
    }
    /**
     * Setter for the mutually inclusive `clientId` and the `clientSecret`.
     * @param {string} clientId The `clientId` and `clientSecret` fields are used to form a "basic"
     *   authorization header for IAM token requests.
     * @param {string} clientSecret The `clientId` and `clientSecret` fields are used to form a "basic"
     *   authorization header for IAM token requests.
     */
    IamAuthenticator.prototype.setClientIdAndSecret = function (clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        // update properties in token manager
        this.tokenManager.setClientIdAndSecret(clientId, clientSecret);
    };
    /**
     * Setter for the "scope" parameter to use when fetching the bearer token from the IAM token server.
     * @param {string} scope A space seperated string that makes up the scope parameter
     */
    IamAuthenticator.prototype.setScope = function (scope) {
        this.scope = scope;
        // update properties in token manager
        this.tokenManager.setScope(scope);
    };
    /**
     * Return the most recently stored refresh token.
     *
     * @public
     * @returns {string}
     */
    IamAuthenticator.prototype.getRefreshToken = function () {
        return this.tokenManager.getRefreshToken();
    };
    return IamAuthenticator;
}(token_request_based_authenticator_1.TokenRequestBasedAuthenticator));
exports.IamAuthenticator = IamAuthenticator;
