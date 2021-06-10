"use strict";
/**
 * Copyright 2014 IBM Corp. All Rights Reserved.
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var auth_1 = require("../auth");
var helper_1 = require("./helper");
var logger_1 = require("./logger");
var request_wrapper_1 = require("./request-wrapper");
/**
 * Common functionality shared by generated service classes.
 *
 * The base service authenticates requests via its authenticator, and sends
 * them to the service endpoint.
 */
var BaseService = /** @class */ (function () {
    /**
     * Configuration values for a service.
     * @param {Authenticator} userOptions.authenticator Object used to authenticate requests to the service.
     * @param {string} [userOptions.serviceUrl] The base url to use when contacting the service.
     *   The base url may differ between IBM Cloud regions.
     * @param {object<string, string>} [userOptions.headers] Default headers that shall be
     *   included with every request to the service.
     * @param {string} [userOptions.version] The API version date to use with the service,
     *   in "YYYY-MM-DD" format.
     * @param {boolean} [userOptions.disableSslVerification] A flag that indicates
     *   whether verification of the token server's SSL certificate should be
     *   disabled or not.
     */
    function BaseService(userOptions) {
        if (!(this instanceof BaseService)) {
            var err = 'the "new" keyword is required to create service instances';
            logger_1.default.error("Error creating an instance of BaseService: " + err);
            throw new Error(err);
        }
        var baseServiceOptions = {};
        var options = __assign({}, userOptions);
        // for compatibility
        if (options.url && !options.serviceUrl) {
            options.serviceUrl = options.url;
        }
        if (options.serviceUrl) {
            baseServiceOptions.serviceUrl = helper_1.stripTrailingSlash(options.serviceUrl);
        }
        // check serviceUrl for common user errors
        var credentialProblems = auth_1.checkCredentials(options, ['serviceUrl']);
        if (credentialProblems) {
            logger_1.default.error(credentialProblems.message);
            throw credentialProblems;
        }
        // if disableSslVerification is not explicity set to the boolean value `true`,
        // force it to be false
        if (options.disableSslVerification !== true) {
            options.disableSslVerification = false;
        }
        var serviceClass = this.constructor;
        this.baseOptions = __assign(__assign({ qs: {}, serviceUrl: serviceClass.DEFAULT_SERVICE_URL }, options), baseServiceOptions);
        this.requestWrapperInstance = new request_wrapper_1.RequestWrapper(this.baseOptions);
        // enforce that an authenticator is set
        if (!options.authenticator) {
            throw new Error('Authenticator must be set.');
        }
        this.authenticator = options.authenticator;
    }
    /**
     * Get the instance of the authenticator set on the service.
     *
     * @returns {Authenticator}
     */
    BaseService.prototype.getAuthenticator = function () {
        return this.authenticator;
    };
    /**
     * Set the service URL to send requests to.
     *
     * @param {string} url The base URL for the service.
     */
    BaseService.prototype.setServiceUrl = function (url) {
        if (url) {
            this.baseOptions.serviceUrl = helper_1.stripTrailingSlash(url);
        }
    };
    /**
     * Turn request body compression on or off.
     *
     * @param {boolean} setting Will turn it on if 'true', off if 'false'.
     */
    BaseService.prototype.setEnableGzipCompression = function (setting) {
        this.requestWrapperInstance.compressRequestData = setting;
        // persist setting so that baseOptions accurately reflects the state of the flag
        this.baseOptions.enableGzipCompression = setting;
    };
    /**
     * Configure the service using external configuration
     *
     * @param {string} serviceName The name of the service. Will be used to read from external
     * configuration.
     */
    BaseService.prototype.configureService = function (serviceName) {
        if (!serviceName) {
            var err = 'Error configuring service. Service name is required.';
            logger_1.default.error(err);
            throw new Error(err);
        }
        Object.assign(this.baseOptions, this.readOptionsFromExternalConfig(serviceName));
        // overwrite the requestWrapperInstance with the new base options if applicable
        this.requestWrapperInstance = new request_wrapper_1.RequestWrapper(this.baseOptions);
    };
    /**
     * Wrapper around `sendRequest` that enforces the request will be authenticated.
     *
     * @param {object} parameters Service request options passed in by user.
     * @param {string} parameters.options.method The http method.
     * @param {string} parameters.options.url The path portion of the URL to be appended to the serviceUrl.
     * @param {object} [parameters.options.path] The path parameters to be inserted into the URL.
     * @param {object} [parameters.options.qs] The querystring to be included in the URL.
     * @param {object} [parameters.options.body] The data to be sent as the request body.
     * @param {object} [parameters.options.form] An object containing the key/value pairs for a www-form-urlencoded request.
     * @param {object} [parameters.options.formData] An object containing the contents for a multipart/form-data request
     * The following processing is performed on formData values:
     * - string: no special processing -- the value is sent as is
     * - object: the value is converted to a JSON string before insertion into the form body
     * - NodeJS.ReadableStream|Buffer|FileWithMetadata: sent as a file, with any associated metadata
     * - array: each element of the array is sent as a separate form part using any special processing as described above
     * @param {object} parameters.defaultOptions
     * @param {string} parameters.defaultOptions.serviceUrl The base URL of the service.
     * @param {OutgoingHttpHeaders} parameters.defaultOptions.headers Additional headers to be passed on the request.
     * @returns {Promise<any>}
     */
    BaseService.prototype.createRequest = function (parameters) {
        var _this = this;
        // validate serviceUrl parameter has been set
        var serviceUrl = parameters.defaultOptions && parameters.defaultOptions.serviceUrl;
        if (!serviceUrl || typeof serviceUrl !== 'string') {
            return Promise.reject(new Error('The service URL is required'));
        }
        return this.authenticator.authenticate(parameters.defaultOptions).then(function () {
            // resolve() handles rejection as well, so resolving the result of sendRequest should allow for proper handling later
            return _this.requestWrapperInstance.sendRequest(parameters);
        });
    };
    // eslint-disable-next-line class-methods-use-this
    BaseService.prototype.readOptionsFromExternalConfig = function (serviceName) {
        var results = {};
        var properties = auth_1.readExternalSources(serviceName);
        if (properties !== null) {
            // the user can define the following client-level variables in the credentials file:
            // - url
            // - disableSsl
            // - enableGzip
            var url = properties.url, disableSsl = properties.disableSsl, enableGzip = properties.enableGzip;
            if (url) {
                results.serviceUrl = helper_1.stripTrailingSlash(url);
            }
            if (disableSsl === true) {
                results.disableSslVerification = disableSsl;
            }
            if (enableGzip === true) {
                results.enableGzipCompression = enableGzip;
            }
        }
        return results;
    };
    return BaseService;
}());
exports.BaseService = BaseService;
