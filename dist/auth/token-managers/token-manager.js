"use strict";
/* eslint-disable @typescript-eslint/no-unused-vars, class-methods-use-this */
Object.defineProperty(exports, "__esModule", { value: true });
var helper_1 = require("../../lib/helper");
var logger_1 = require("../../lib/logger");
var request_wrapper_1 = require("../../lib/request-wrapper");
var utils_1 = require("../utils");
/**
 * A class for shared functionality for storing, and requesting tokens.
 * Intended to be used as a parent to be extended for token request management.
 * Child classes should implement `requestToken()` to retrieve the token
 * from intended sources and `saveTokenInfo(tokenResponse)` to parse and save
 * token information from the response.
 */
var TokenManager = /** @class */ (function () {
    /**
     * Create a new [[TokenManager]] instance.
     * @constructor
     * @param {object} options Configuration options.
     * @param {string} options.url for HTTP token requests.
     * @param {boolean} [options.disableSslVerification] A flag that indicates
     *   whether verification of the token server's SSL certificate should be
     *   disabled or not.
     * @param {object<string, string>} [options.headers] Headers to be sent with every
     *   outbound HTTP requests to token services.
     */
    function TokenManager(options) {
        // all parameters are optional
        options = options || {};
        if (options.url) {
            this.url = helper_1.stripTrailingSlash(options.url);
        }
        // request options
        this.disableSslVerification = Boolean(options.disableSslVerification);
        this.headers = options.headers || {};
        // any config options for the internal request library, like `proxy`, will be passed here
        this.requestWrapperInstance = new request_wrapper_1.RequestWrapper(options);
        // Array of requests pending completion of an active token request -- initially empty
        this.pendingRequests = [];
    }
    /**
     * Retrieve a new token using `requestToken()` in the case there is not a
     *   currently stored token from a previous call, or the previous token
     *   has expired.
     */
    TokenManager.prototype.getToken = function () {
        var _this = this;
        if (!this.accessToken || this.isTokenExpired()) {
            // 1. request a new token
            return this.pacedRequestToken().then(function () { return _this.accessToken; });
        }
        // If refresh needed, kick one off
        if (this.tokenNeedsRefresh()) {
            this.requestToken().then(function (tokenResponse) {
                _this.saveTokenInfo(tokenResponse);
            });
        }
        // 2. use valid, managed token
        return Promise.resolve(this.accessToken);
    };
    /**
     * Setter for the disableSslVerification property.
     *
     * @param {boolean} value - the new value for the disableSslVerification
     *   property
     * @returns {void}
     */
    TokenManager.prototype.setDisableSslVerification = function (value) {
        // if they try to pass in a non-boolean value,
        // use the "truthy-ness" of the value
        this.disableSslVerification = Boolean(value);
    };
    /**
     * Set a completely new set of headers.
     *
     * @param {OutgoingHttpHeaders} headers - the new set of headers as an object
     * @returns {void}
     */
    TokenManager.prototype.setHeaders = function (headers) {
        if (typeof headers !== 'object') {
            // do nothing, for now
            return;
        }
        this.headers = headers;
    };
    /**
     * Paces requests to request_token.
     *
     * This method pseudo-serializes requests for an access_token
     * when the current token is undefined or expired.
     * The first caller to this method records its `requestTime` and
     * then issues the token request. Subsequent callers will check the
     * `requestTime` to see if a request is active (has been issued within
     * the past 60 seconds), and if so will queue their promise for the
     * active requestor to resolve when that request completes.
     */
    TokenManager.prototype.pacedRequestToken = function () {
        var _this = this;
        var currentTime = utils_1.getCurrentTime();
        if (this.requestTime > currentTime - 60) {
            // token request is active -- queue the promise for this request
            return new Promise(function (resolve, reject) {
                _this.pendingRequests.push({ resolve: resolve, reject: reject });
            });
        }
        this.requestTime = currentTime;
        return this.requestToken()
            .then(function (tokenResponse) {
            _this.saveTokenInfo(tokenResponse);
            _this.pendingRequests.forEach(function (_a) {
                var resolve = _a.resolve;
                resolve();
            });
            _this.pendingRequests = [];
            _this.requestTime = 0;
        })
            .catch(function (err) {
            _this.pendingRequests.forEach(function (_a) {
                var reject = _a.reject;
                reject(err);
            });
            throw err;
        });
    };
    /**
     * Request a token using an API endpoint.
     *
     * @returns {Promise}
     */
    TokenManager.prototype.requestToken = function () {
        var errMsg = '`requestToken` MUST be overridden by a subclass of TokenManagerV1.';
        var err = new Error(errMsg);
        logger_1.default.error(errMsg);
        return Promise.reject(err);
    };
    /**
     * Parse and save token information from the response.
     * Save the requested token into field `accessToken`.
     * Calculate expiration and refresh time from the received info
     * and store them in fields `expireTime` and `refreshTime`.
     *
     * @param tokenResponse - Response object from a token service request
     * @protected
     * @returns {void}
     */
    TokenManager.prototype.saveTokenInfo = function (tokenResponse) {
        var errMsg = '`saveTokenInfo` MUST be overridden by a subclass of TokenManager.';
        logger_1.default.error(errMsg);
    };
    /**
     * Check if currently stored token is expired
     *
     * @private
     * @returns {boolean}
     */
    TokenManager.prototype.isTokenExpired = function () {
        var expireTime = this.expireTime;
        if (!expireTime) {
            return true;
        }
        var currentTime = utils_1.getCurrentTime();
        return expireTime <= currentTime;
    };
    /**
     * Check if currently stored token should be refreshed
     * i.e. past the window to request a new token
     *
     * @private
     * @returns {boolean}
     */
    TokenManager.prototype.tokenNeedsRefresh = function () {
        var refreshTime = this.refreshTime;
        var currentTime = utils_1.getCurrentTime();
        if (refreshTime && refreshTime > currentTime) {
            return false;
        }
        // Update refreshTime to 60 seconds from now to avoid redundant refreshes
        this.refreshTime = currentTime + 60;
        return true;
    };
    return TokenManager;
}());
exports.TokenManager = TokenManager;
