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
 * The BasicAuthenticator is used to add basic authentication information to
 *   requests.
 *
 * Basic Authorization will be sent as an Authorization header in the form:
 *
 *     Authorization: Basic <encoded username and password>
 *
 */
var BasicAuthenticator = /** @class */ (function (_super) {
    __extends(BasicAuthenticator, _super);
    /**
     * Create a new BasicAuthenticator instance.
     *
     * @param {object} options Configuration options for basic authentication.
     * @param {string} options.username The username portion of basic authentication.
     * @param {string} options.password The password portion of basic authentication.
     * @throws {Error} The configuration options are not valid.
     */
    function BasicAuthenticator(options) {
        var _this = _super.call(this) || this;
        _this.requiredOptions = ['username', 'password'];
        utils_1.validateInput(options, _this.requiredOptions);
        var username = options.username, password = options.password;
        var authHeaderString = utils_1.computeBasicAuthHeader(username, password);
        _this.authHeader = { Authorization: authHeaderString };
        return _this;
    }
    /**
     * Add basic authentication information to `request`. The basic authentication information
     * will be set in the Authorization property of`request.headers` in the form:
     *
     *     Authorization: Basic <encoded username and password>
     *
     * @param {object} requestOptions - The request to augment with authentication information.
     * @param {object.<string, string>} requestOptions.headers - The headers the
     *   authentication information will be added too.
     */
    BasicAuthenticator.prototype.authenticate = function (requestOptions) {
        var _this = this;
        return new Promise(function (resolve) {
            requestOptions.headers = extend(true, {}, requestOptions.headers, _this.authHeader);
            resolve();
        });
    };
    return BasicAuthenticator;
}(authenticator_1.Authenticator));
exports.BasicAuthenticator = BasicAuthenticator;
