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
var logger_1 = require("../../lib/logger");
var utils_1 = require("../utils");
var jwt_token_manager_1 = require("./jwt-token-manager");
/**
 * Check for only one of two elements being defined.
 * Returns true if a is defined and b is undefined,
 * or vice versa. Returns false if both are defined
 * or both are undefined.
 *
 * @param {any} a - The first object
 * @param {any} b - The second object
 * @returns {boolean}
 */
function onlyOne(a, b) {
    return Boolean((a && !b) || (b && !a));
}
/**
 * Remove a given suffix if it exists.
 *
 * @param {string} str - The base string to operate on
 * @param {string} suffix - The suffix to remove, if present
 * @returns {string}
 */
function removeSuffix(str, suffix) {
    if (str.endsWith(suffix)) {
        str = str.substring(0, str.lastIndexOf(suffix));
    }
    return str;
}
var CLIENT_ID_SECRET_WARNING = 'Warning: Client ID and Secret must BOTH be given, or the header will not be included.';
var SCOPE = 'scope';
var DEFAULT_IAM_URL = 'https://iam.cloud.ibm.com';
var OPERATION_PATH = '/identity/token';
/**
 * The IAMTokenManager takes an api key and performs the necessary interactions with
 * the IAM token service to obtain and store a suitable bearer token. Additionally, the IAMTokenManager
 * will retrieve bearer tokens via basic auth using a supplied `clientId` and `clientSecret` pair.
 */
var IamTokenManager = /** @class */ (function (_super) {
    __extends(IamTokenManager, _super);
    /**
     *
     * Create a new [[IamTokenManager]] instance.
     *
     * @param {object} options Configuration options.
     * @param {string} options.apikey The IAM api key.
     * @param {string} [options.clientId] The `clientId` and `clientSecret` fields are used to form a "basic"
     *   authorization header for IAM token requests.
     * @param {string} [options.clientSecret] The `clientId` and `clientSecret` fields are used to form a "basic"
     *   authorization header for IAM token requests.
     * @param {string} [url='https://iam.cloud.ibm.com'] The IAM endpoint for token requests.
     * @param {boolean} [options.disableSslVerification] A flag that indicates
     *   whether verification of the token server's SSL certificate should be
     *   disabled or not.
     * @param {object<string, string>} [options.headers] Headers to be sent with every
     *   outbound HTTP requests to token services.
     * @constructor
     */
    function IamTokenManager(options) {
        var _this = _super.call(this, options) || this;
        _this.requiredOptions = ['apikey'];
        utils_1.validateInput(options, _this.requiredOptions);
        _this.apikey = options.apikey;
        // Canonicalize the URL by removing the operation path if it was specified by the user.
        _this.url = _this.url ? removeSuffix(_this.url, OPERATION_PATH) : DEFAULT_IAM_URL;
        if (options.clientId) {
            _this.clientId = options.clientId;
        }
        if (options.clientSecret) {
            _this.clientSecret = options.clientSecret;
        }
        if (options.scope) {
            _this.scope = options.scope;
        }
        if (onlyOne(options.clientId, options.clientSecret)) {
            // tslint:disable-next-line
            logger_1.default.warn(CLIENT_ID_SECRET_WARNING);
        }
        return _this;
    }
    /**
     * Set the IAM `scope` value.
     * This value is the form parameter to use when fetching the bearer token
     * from the IAM token server.
     *
     * @param {string} scope - A space seperated string that makes up the scope parameter.
     * @returns {void}
     */
    IamTokenManager.prototype.setScope = function (scope) {
        this.scope = scope;
    };
    /**
     * Set the IAM `clientId` and `clientSecret` values.
     * These values are used to compute the Authorization header used
     * when retrieving the IAM access token.
     * If these values are not set, no Authorization header will be
     * set on the request (it is not required).
     *
     * @param {string} clientId - The client id.
     * @param {string} clientSecret - The client secret.
     * @returns {void}
     */
    IamTokenManager.prototype.setClientIdAndSecret = function (clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        if (onlyOne(clientId, clientSecret)) {
            // tslint:disable-next-line
            logger_1.default.warn(CLIENT_ID_SECRET_WARNING);
        }
    };
    /**
     * Return the most recently stored refresh token.
     *
     * @public
     * @returns {string}
     */
    IamTokenManager.prototype.getRefreshToken = function () {
        return this.refreshToken;
    };
    /**
     * Extend this method from the parent class to extract the refresh token from
     * the request and save it.
     *
     * @param tokenResponse - Response object from JWT service request
     * @protected
     * @returns {void}
     */
    IamTokenManager.prototype.saveTokenInfo = function (tokenResponse) {
        _super.prototype.saveTokenInfo.call(this, tokenResponse);
        var responseBody = tokenResponse.result || {};
        if (responseBody.refresh_token) {
            this.refreshToken = responseBody.refresh_token;
        }
    };
    /**
     * Request an IAM token using an API key.
     *
     * @returns {Promise}
     */
    IamTokenManager.prototype.requestToken = function () {
        // these cannot be overwritten
        var requiredHeaders = {
            'Content-type': 'application/x-www-form-urlencoded',
        };
        // If both the clientId and secret were specified by the user, then use them.
        if (this.clientId && this.clientSecret) {
            requiredHeaders.Authorization = utils_1.computeBasicAuthHeader(this.clientId, this.clientSecret);
        }
        var parameters = {
            options: {
                url: this.url + OPERATION_PATH,
                method: 'POST',
                headers: extend(true, {}, this.headers, requiredHeaders),
                form: {
                    grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
                    apikey: this.apikey,
                    response_type: 'cloud_iam',
                },
                rejectUnauthorized: !this.disableSslVerification,
            },
        };
        if (this.scope) {
            parameters.options.form[SCOPE] = this.scope;
        }
        return this.requestWrapperInstance.sendRequest(parameters);
    };
    return IamTokenManager;
}(jwt_token_manager_1.JwtTokenManager));
exports.IamTokenManager = IamTokenManager;
