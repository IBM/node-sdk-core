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
var token_request_based_authenticator_1 = require("./token-request-based-authenticator");
/**
 * The [[CloudPakForDataAuthenticator]] will either use a username/password pair or a username/apikey pair to obtain
 * a bearer token from a token server.  When the bearer token expires, a new token is obtained from the token server.
 *
 * The bearer token will be sent as an Authorization header in the form:
 *
 *      Authorization: Bearer <bearer-token>
 */
var CloudPakForDataAuthenticator = /** @class */ (function (_super) {
    __extends(CloudPakForDataAuthenticator, _super);
    /**
     * Create a new [[CloudPakForDataAuthenticator]] instance.
     *
     * @param {object} options Configuration options for CloudPakForData authentication.
     * @param {string} options.url For HTTP token requests.
     * @param {string} options.username The username used to obtain a bearer token.
     * @param {string} [options.password] The password used to obtain a bearer token [required if apikey not specified].
     * @param {string} [options.apikey] The API key used to obtain a bearer token [required if password not specified].
     * @param {boolean} [options.disableSslVerification] A flag that indicates
     *   whether verification of the token server's SSL certificate should be
     *   disabled or not
     * @param {object<string, string>} [options.headers] to be sent with every.
     * @throws `Error` The username, password, and/or url are not valid, or unspecified, for Cloud Pak For Data token
     *   requests.
     */
    function CloudPakForDataAuthenticator(options) {
        var _this = _super.call(this, options) || this;
        _this.requiredOptions = ['username', 'url'];
        _this.username = options.username;
        _this.password = options.password;
        _this.apikey = options.apikey;
        // the param names are shared between the authenticator and the token
        // manager so we can just pass along the options object.
        // also, the token manager will handle input validation
        _this.tokenManager = new token_managers_1.Cp4dTokenManager(options);
        return _this;
    }
    return CloudPakForDataAuthenticator;
}(token_request_based_authenticator_1.TokenRequestBasedAuthenticator));
exports.CloudPakForDataAuthenticator = CloudPakForDataAuthenticator;
