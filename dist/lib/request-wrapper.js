"use strict";
/* eslint-disable class-methods-use-this */
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
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
var axios_1 = require("axios");
var axios_cookiejar_support_1 = require("axios-cookiejar-support");
var extend = require("extend");
var FormData = require("form-data");
var https = require("https");
var isStream = require("isstream");
var querystring = require("querystring");
var zlib = require("zlib");
var helper_1 = require("./helper");
var logger_1 = require("./logger");
var stream_to_promise_1 = require("./stream-to-promise");
var RequestWrapper = /** @class */ (function () {
    function RequestWrapper(axiosOptions) {
        axiosOptions = axiosOptions || {};
        this.compressRequestData = Boolean(axiosOptions.enableGzipCompression);
        // override several axios defaults
        // axios sets the default Content-Type for `post`, `put`, and `patch` operations
        // to 'application/x-www-form-urlencoded'. This causes problems, so overriding the
        // defaults here
        var axiosConfig = {
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            headers: {
                post: {
                    'Content-Type': 'application/json',
                },
                put: {
                    'Content-Type': 'application/json',
                },
                patch: {
                    'Content-Type': 'application/json',
                },
            },
        };
        // merge axios config into default
        extend(true, axiosConfig, axiosOptions);
        // if the user explicitly sets `disableSslVerification` to true,
        // `rejectUnauthorized` must be set to false in the https agent
        if (axiosOptions.disableSslVerification === true) {
            // the user may have already provided a custom agent. if so, update it
            if (axiosConfig.httpsAgent) {
                // check for presence of `options` field for "type safety"
                if (axiosConfig.httpsAgent.options) {
                    axiosConfig.httpsAgent.options.rejectUnauthorized = false;
                }
            }
            else {
                // if no agent is present, create a new one
                axiosConfig.httpsAgent = new https.Agent({
                    rejectUnauthorized: false,
                });
            }
        }
        this.axiosInstance = axios_1.default.create(axiosConfig);
        // if a cookie jar is provided, wrap the axios instance and update defaults
        if (axiosOptions.jar) {
            axios_cookiejar_support_1.default(this.axiosInstance);
            this.axiosInstance.defaults.withCredentials = true;
            this.axiosInstance.defaults.jar = axiosOptions.jar;
        }
        // set debug interceptors
        if (process.env.NODE_DEBUG === 'axios' || process.env.DEBUG) {
            this.axiosInstance.interceptors.request.use(function (config) {
                logger_1.default.debug('Request:');
                try {
                    logger_1.default.debug(JSON.stringify(config, null, 2));
                }
                catch (_a) {
                    logger_1.default.error(config);
                }
                return config;
            }, function (error) {
                logger_1.default.error('Error: ');
                try {
                    logger_1.default.error(JSON.stringify(error, null, 2));
                }
                catch (_a) {
                    logger_1.default.error(error);
                }
                return Promise.reject(error);
            });
            this.axiosInstance.interceptors.response.use(function (response) {
                logger_1.default.debug('Response:');
                try {
                    logger_1.default.debug(JSON.stringify(response, null, 2));
                }
                catch (_a) {
                    logger_1.default.error(response);
                }
                return response;
            }, function (error) {
                logger_1.default.error('Error: ');
                try {
                    logger_1.default.error(JSON.stringify(error, null, 2));
                }
                catch (_a) {
                    logger_1.default.error(error);
                }
                return Promise.reject(error);
            });
        }
    }
    /**
     * Creates the request.
     * 1. Merge default options with user provided options
     * 2. Checks for missing parameters
     * 3. Encode path and query parameters
     * 4. Call the api
     * @private
     * @returns {ReadableStream|undefined}
     * @throws {Error}
     */
    RequestWrapper.prototype.sendRequest = function (parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var options, path, body, form, formData, qs, method, serviceUrl, headers, url, multipartForm, data, requestParams;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = extend(true, {}, parameters.defaultOptions, parameters.options);
                        path = options.path, body = options.body, form = options.form, formData = options.formData, qs = options.qs, method = options.method, serviceUrl = options.serviceUrl;
                        headers = options.headers, url = options.url;
                        multipartForm = new FormData();
                        // Form params
                        if (formData) {
                            Object.keys(formData).forEach(function (key) {
                                var values = Array.isArray(formData[key]) ? formData[key] : [formData[key]];
                                // Skip keys with undefined/null values or empty object value
                                values
                                    .filter(function (v) { return v != null && !helper_1.isEmptyObject(v); })
                                    .forEach(function (value) {
                                    // Special case of empty file object
                                    if (Object.prototype.hasOwnProperty.call(value, 'contentType') &&
                                        !Object.prototype.hasOwnProperty.call(value, 'data')) {
                                        return;
                                    }
                                    if (helper_1.isFileWithMetadata(value)) {
                                        var fileObj = helper_1.buildRequestFileObject(value);
                                        multipartForm.append(key, fileObj.value, fileObj.options);
                                    }
                                    else {
                                        if (typeof value === 'object' && !helper_1.isFileData(value)) {
                                            value = JSON.stringify(value);
                                        }
                                        multipartForm.append(key, value);
                                    }
                                });
                            });
                        }
                        // Path params
                        url = parsePath(url, path);
                        // Headers
                        options.headers = __assign({}, options.headers);
                        // Convert array-valued query params to strings
                        if (qs && Object.keys(qs).length > 0) {
                            Object.keys(qs).forEach(function (key) {
                                if (Array.isArray(qs[key])) {
                                    qs[key] = qs[key].join(',');
                                }
                            });
                        }
                        // Add service default endpoint if options.url start with /
                        if (url && url.charAt(0) === '/') {
                            url = helper_1.stripTrailingSlash(serviceUrl) + url;
                        }
                        url = helper_1.stripTrailingSlash(url);
                        data = body;
                        if (form) {
                            data = querystring.stringify(form);
                            headers['Content-type'] = 'application/x-www-form-urlencoded';
                        }
                        if (formData) {
                            data = multipartForm;
                            // form-data generates headers that MUST be included or the request will fail
                            headers = extend(true, {}, headers, multipartForm.getHeaders());
                        }
                        // accept gzip encoded responses if Accept-Encoding is not already set
                        headers['Accept-Encoding'] = headers['Accept-Encoding'] || 'gzip';
                        if (!this.compressRequestData) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.gzipRequestBody(data, headers)];
                    case 1:
                        data = _a.sent();
                        _a.label = 2;
                    case 2:
                        requestParams = {
                            url: url,
                            method: method,
                            headers: headers,
                            params: qs,
                            data: data,
                            responseType: options.responseType || 'json',
                            paramsSerializer: function (params) { return querystring.stringify(params); },
                        };
                        return [2 /*return*/, this.axiosInstance(requestParams).then(function (res) {
                                // sometimes error responses will still trigger the `then` block - escape that behavior here
                                if (!res) {
                                    return undefined;
                                }
                                // these objects contain circular json structures and are not always relevant to the user
                                // if the user wants them, they can be accessed through the debug properties
                                delete res.config;
                                delete res.request;
                                // the other sdks use the interface `result` for the body
                                res.result = res.data;
                                delete res.data;
                                // return another promise that resolves with 'res' to be handled in generated code
                                return res;
                            }, function (err) {
                                // return another promise that rejects with 'err' to be handled in generated code
                                throw _this.formatError(err);
                            })];
                }
            });
        });
    };
    /**
     * Format error returned by axios
     * @param  {object} the object returned by axios via rejection
     * @private
     * @returns {Error}
     */
    RequestWrapper.prototype.formatError = function (axiosError) {
        // return an actual error object,
        // but make it flexible so we can add properties like 'body'
        var error = new Error();
        // axios specific handling
        // this branch is for an error received from the service
        if (axiosError.response) {
            axiosError = axiosError.response;
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            delete axiosError.config;
            delete axiosError.request;
            error.statusText = axiosError.statusText;
            error.name = axiosError.statusText; // ** deprecated **
            error.status = axiosError.status;
            error.code = axiosError.status; // ** deprecated **
            error.message = parseServiceErrorMessage(axiosError.data) || axiosError.statusText;
            // some services bury the useful error message within 'data'
            // adding it to the error under the key 'body' as a string or object
            var errorBody = void 0;
            try {
                // try/catch to handle objects with circular references
                errorBody = JSON.stringify(axiosError.data);
            }
            catch (e) {
                // ignore the error, use the object, and tack on a warning
                errorBody = axiosError.data;
                errorBody.warning = 'Body contains circular reference';
                logger_1.default.error("Failed to stringify axiosError: " + e);
            }
            error.body = errorBody;
            // attach headers to error object
            error.headers = axiosError.headers;
            // print a more descriptive error message for auth issues
            if (isAuthenticationError(axiosError)) {
                error.message = 'Access is denied due to invalid credentials.';
            }
        }
        else if (axiosError.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            error.message = axiosError.message;
            error.statusText = axiosError.code;
            error.body = 'Response not received - no connection was made to the service.';
            // when a request to a private cloud instance has an ssl problem, it never connects and follows this branch of the error handling
            if (isSelfSignedCertificateError(axiosError)) {
                error.message =
                    "The connection failed because the SSL certificate is not valid. " +
                        "To use a self-signed certificate, set the `disableSslVerification` parameter in the constructor options.";
            }
        }
        else {
            // Something happened in setting up the request that triggered an Error
            error.message = axiosError.message;
        }
        return error;
    };
    RequestWrapper.prototype.gzipRequestBody = function (data, headers) {
        return __awaiter(this, void 0, void 0, function () {
            var contentSetToGzip, reqBuffer, _a, _b, err_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        contentSetToGzip = headers['Content-Encoding'] && headers['Content-Encoding'].toString().includes('gzip');
                        if (!data || contentSetToGzip) {
                            return [2 /*return*/, data];
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 5, , 6]);
                        if (!isStream(data)) return [3 /*break*/, 3];
                        _b = (_a = Buffer).from;
                        return [4 /*yield*/, stream_to_promise_1.streamToPromise(data)];
                    case 2:
                        reqBuffer = _b.apply(_a, [_c.sent()]);
                        return [3 /*break*/, 4];
                    case 3:
                        if (data.toString && data.toString() !== '[object Object]' && !Array.isArray(data)) {
                            // this handles pretty much any primitive that isnt a JSON object or array
                            reqBuffer = Buffer.from(data.toString());
                        }
                        else {
                            reqBuffer = Buffer.from(JSON.stringify(data));
                        }
                        _c.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        err_1 = _c.sent();
                        logger_1.default.error('Error converting request body to a buffer - data will not be compressed.');
                        logger_1.default.debug(err_1);
                        return [2 /*return*/, data];
                    case 6:
                        try {
                            data = zlib.gzipSync(reqBuffer);
                            // update the headers by reference - only if the data was actually compressed
                            headers['Content-Encoding'] = 'gzip';
                        }
                        catch (err) {
                            // if an exception is caught, `data` will still be in its original form
                            // we can just proceed with the request uncompressed
                            logger_1.default.error('Error compressing request body - data will not be compressed.');
                            logger_1.default.debug(err);
                        }
                        return [2 /*return*/, data];
                }
            });
        });
    };
    return RequestWrapper;
}());
exports.RequestWrapper = RequestWrapper;
/**
 * @private
 * @param {string} path
 * @param {Object} params
 * @returns {string}
 */
function parsePath(path, params) {
    if (!path || !params) {
        return path;
    }
    return Object.keys(params).reduce(function (parsedPath, param) {
        var value = encodeURIComponent(params[param]);
        return parsedPath.replace(new RegExp("{" + param + "}"), value);
    }, path);
}
/**
 * Determine if the error is due to bad credentials
 * @private
 * @param {Object} error - error object returned from axios
 * @returns {boolean} true if error is due to authentication
 */
function isAuthenticationError(error) {
    var isAuthErr = false;
    var code = error.status || null;
    var body = error.data || {};
    // handle specific error from iam service, should be relevant across platforms
    var isIamServiceError = body.context && body.context.url && body.context.url.indexOf('iam') > -1;
    if (code === 401 || code === 403 || isIamServiceError) {
        isAuthErr = true;
    }
    return isAuthErr;
}
/**
 * Determine if the error is due to a bad self signed certificate
 * @private
 * @param {Object} error - error object returned from axios
 * @returns {boolean} true if error is due to an SSL error
 */
function isSelfSignedCertificateError(error) {
    var result = false;
    var sslCode = 'DEPTH_ZERO_SELF_SIGNED_CERT';
    var sslMessage = 'self signed certificate';
    var hasSslCode = error.code === sslCode;
    var hasSslMessage = hasStringProperty(error, 'message') && error.message.includes(sslMessage);
    if (hasSslCode || hasSslMessage) {
        result = true;
    }
    return result;
}
/**
 * Return true if object has a specified property that is a string
 * @private
 * @param {Object} obj - object to look for property in
 * @param {string} property - name of the property to look for
 * @returns {boolean} true if property exists and is string
 */
function hasStringProperty(obj, property) {
    return Boolean(obj[property] && typeof obj[property] === 'string');
}
/**
 * Look for service error message in common places, by priority
 * first look in `errors[0].message`, then in `error`, then in
 * `message`, then in `errorMessage`
 * @private
 * @param {Object} response - error response body received from service
 * @returns {string | undefined} the error message if is was found, undefined otherwise
 */
function parseServiceErrorMessage(response) {
    var message;
    if (Array.isArray(response.errors) &&
        response.errors.length > 0 &&
        hasStringProperty(response.errors[0], 'message')) {
        message = response.errors[0].message;
    }
    else if (hasStringProperty(response, 'error')) {
        message = response.error;
    }
    else if (hasStringProperty(response, 'message')) {
        message = response.message;
    }
    else if (hasStringProperty(response, 'errorMessage')) {
        message = response.errorMessage;
    }
    logger_1.default.info("Parsing service error message: " + message);
    return message;
}
