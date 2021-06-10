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
var extend = require("extend");
var token_managers_1 = require("../token-managers");
var authenticator_1 = require("./authenticator");
/**
 * Class for common functionality shared by token-request authenticators.
 * [[TokenRequestBasedAuthenticator]]s use token managers to retrieve, store,
 * and refresh tokens. Not intended to be used as stand-alone authenticator,
 * but as parent class to authenticators that have their own token manager
 * implementations.
 *
 * The tokens will be added as an Authorization headers in the form:
 *
 *      Authorization: Bearer <bearer-token>
 */
var TokenRequestBasedAuthenticator = /** @class */ (function (_super) {
    __extends(TokenRequestBasedAuthenticator, _super);
    /**
     * Create a new [[TokenRequestBasedAuthenticator]] instance with an internal [[JwtTokenManager]].
     *
     * @param {object} options Configuration options.
     * @param {string} options.url for HTTP token requests.
     * @param {boolean} [options.disableSslVerification] A flag that indicates
     *   whether verification of the token server's SSL certificate should be
     *   disabled or not.
     * @param {object<string, string>} [options.headers] to be sent with every
     *   outbound HTTP requests to token services.
     */
    function TokenRequestBasedAuthenticator(options) {
        var _this = _super.call(this) || this;
        _this.disableSslVerification = Boolean(options.disableSslVerification);
        _this.url = options.url;
        // default to empty object
        _this.headers = options.headers || {};
        _this.tokenManager = new token_managers_1.JwtTokenManager(options);
        return _this;
    }
    /**
     * Set the flag that indicates whether verification of the server's SSL
     * certificate should be disabled or not.
     *
     * @param {boolean} value A flag that indicates whether verification of the
     *   token server's SSL certificate should be disabled or not.
     */
    TokenRequestBasedAuthenticator.prototype.setDisableSslVerification = function (value) {
        // if they try to pass in a non-boolean value,
        // use the "truthy-ness" of the value
        this.disableSslVerification = Boolean(value);
        this.tokenManager.setDisableSslVerification(this.disableSslVerification);
    };
    /**
     * Set headers.
     *
     * @param {object<string, string>} headers Default headers to be sent with
     *   every Cloud Pak For Data token request. Overwrites previous default headers.
     */
    TokenRequestBasedAuthenticator.prototype.setHeaders = function (headers) {
        if (typeof headers !== 'object') {
            // do nothing, for now
            return;
        }
        this.headers = headers;
        this.tokenManager.setHeaders(this.headers);
    };
    /**
     * Adds bearer token information to `request`. The bearer token information
     * will be set in the Authorization property of`request.headers` in the form:
     *
     *     Authorization: Bearer <bearer-token>
     *
     * @param {object} requestOptions - The request to augment with authentication
     *   information.
     * @param {object.<string, string>} requestOptions.headers - The headers the
     *   authentication information will be added too. Overrides default headers
     *   where there's conflict.
     */
    TokenRequestBasedAuthenticator.prototype.authenticate = function (requestOptions) {
        return this.tokenManager.getToken().then(function (token) {
            var authHeader = { Authorization: "Bearer " + token };
            requestOptions.headers = extend(true, {}, requestOptions.headers, authHeader);
        });
    };
    return TokenRequestBasedAuthenticator;
}(authenticator_1.Authenticator));
exports.TokenRequestBasedAuthenticator = TokenRequestBasedAuthenticator;
