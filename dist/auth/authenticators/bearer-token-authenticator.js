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
var utils_1 = require("../utils");
var authenticator_1 = require("./authenticator");
/**
 * The BearerTokenAuthenticator will set a user-provided bearer token
 *   in requests.
 *
 * The bearer token will be sent as an Authorization header in the form:
 *
 *      Authorization: Bearer <bearer-token>
 */
var BearerTokenAuthenticator = /** @class */ (function (_super) {
    __extends(BearerTokenAuthenticator, _super);
    /**
     * Create a new BearerTokenAuthenticator instance.
     *
     * @param {object} options Configuration options for bearer authentication.
     * @param {string} options.bearerToken The bearer token to be added
     *   to requests.
     * @throws {Error} The configuration bearerToken is not valid, or unspecified.
     */
    function BearerTokenAuthenticator(options) {
        var _this = _super.call(this) || this;
        _this.requiredOptions = ['bearerToken'];
        utils_1.validateInput(options, _this.requiredOptions);
        _this.bearerToken = options.bearerToken;
        return _this;
    }
    /**
     * Set a new bearer token to be sent in subsequent requests.
     *
     * @param {string} bearerToken The bearer token that will be sent in service
     *   requests.
     */
    BearerTokenAuthenticator.prototype.setBearerToken = function (bearerToken) {
        this.bearerToken = bearerToken;
    };
    /**
     * Add a bearer token to the `request`. The bearer token information
     * will be set in the Authorization property of`request.headers` in the form:
     *
     *      Authorization: Bearer <bearer-token>
     *
     * @param {object} requestOptions - The request to augment with authentication
     *   information.
     * @param {object.<string, string>} requestOptions.headers - The headers the
     *   authentication information will be added to.
     */
    BearerTokenAuthenticator.prototype.authenticate = function (requestOptions) {
        var _this = this;
        return new Promise(function (resolve) {
            var authHeader = { Authorization: "Bearer " + _this.bearerToken };
            requestOptions.headers = extend(true, {}, requestOptions.headers, authHeader);
            resolve();
        });
    };
    return BearerTokenAuthenticator;
}(authenticator_1.Authenticator));
exports.BearerTokenAuthenticator = BearerTokenAuthenticator;
