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
var jwt_token_manager_1 = require("./jwt-token-manager");
/**
 * Token Manager of CloudPak for data.
 *
 * The Token Manager performs basic auth with a username and password
 * to acquire CP4D tokens.
 */
var Cp4dTokenManager = /** @class */ (function (_super) {
    __extends(Cp4dTokenManager, _super);
    /**
     * Create a new [[Cp4dTokenManager]] instance.
     *
     * @param {object} options Configuration options.
     * @param {string} options.username The username used to obtain a bearer token.
     * @param {string} options.password The password used to obtain a bearer token [required if apikey not specified].
     * @param {string} options.apikey The API key used to obtain a bearer token [required if password not specified].
     * @param {string} options.url The endpoint for CP4D token requests.
     * @param {boolean} [options.disableSslVerification] A flag that indicates
     *   whether verification of the token server's SSL certificate should be
     *   disabled or not.
     * @param {object<string, string>} [options.headers] Headers to be sent with every
     *   outbound HTTP requests to token services.
     * @constructor
     */
    function Cp4dTokenManager(options) {
        var _this = _super.call(this, options) || this;
        _this.requiredOptions = ['username', 'url'];
        _this.tokenName = 'token';
        if ((!options.password && !options.apikey) || (options.password && options.apikey)) {
            throw new Error('Exactly one of `apikey` or `password` must be specified.');
        }
        utils_1.validateInput(options, _this.requiredOptions);
        var tokenApiPath = '/v1/authorize';
        // do not append the path if user already has
        if (_this.url && !_this.url.endsWith(tokenApiPath)) {
            _this.url += tokenApiPath;
        }
        _this.username = options.username;
        _this.password = options.password;
        _this.apikey = options.apikey;
        return _this;
    }
    Cp4dTokenManager.prototype.requestToken = function () {
        // these cannot be overwritten
        var requiredHeaders = {
            'Content-Type': 'application/json',
        };
        var parameters = {
            options: {
                url: this.url,
                body: {
                    username: this.username,
                    password: this.password,
                    api_key: this.apikey,
                },
                method: 'POST',
                headers: extend(true, {}, this.headers, requiredHeaders),
                rejectUnauthorized: !this.disableSslVerification,
            },
        };
        return this.requestWrapperInstance.sendRequest(parameters);
    };
    return Cp4dTokenManager;
}(jwt_token_manager_1.JwtTokenManager));
exports.Cp4dTokenManager = Cp4dTokenManager;
