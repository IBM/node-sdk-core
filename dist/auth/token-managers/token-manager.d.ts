/// <reference types="node" />
/**
 * Copyright 2020 IBM Corp. All Rights Reserved.
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
import { OutgoingHttpHeaders } from 'http';
import { RequestWrapper } from '../../lib/request-wrapper';
/** Configuration options for token retrieval. */
export declare type TokenManagerOptions = {
    /** The endpoint for token requests. */
    url?: string;
    /** Headers to be sent with every service token request. */
    headers?: OutgoingHttpHeaders;
    /**
     * A flag that indicates whether verification of
     *   the server's SSL certificate should be disabled or not.
     */
    disableSslVerification?: boolean;
    /** Allow additional request config parameters */
    [propName: string]: any;
};
/**
 * A class for shared functionality for storing, and requesting tokens.
 * Intended to be used as a parent to be extended for token request management.
 * Child classes should implement `requestToken()` to retrieve the token
 * from intended sources and `saveTokenInfo(tokenResponse)` to parse and save
 * token information from the response.
 */
export declare class TokenManager {
    protected url: string;
    protected disableSslVerification: boolean;
    protected headers: OutgoingHttpHeaders;
    protected requestWrapperInstance: RequestWrapper;
    protected accessToken: string;
    protected expireTime: number;
    protected refreshTime: number;
    private requestTime;
    private pendingRequests;
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
    constructor(options: TokenManagerOptions);
    /**
     * Retrieve a new token using `requestToken()` in the case there is not a
     *   currently stored token from a previous call, or the previous token
     *   has expired.
     */
    getToken(): Promise<any>;
    /**
     * Setter for the disableSslVerification property.
     *
     * @param {boolean} value - the new value for the disableSslVerification
     *   property
     * @returns {void}
     */
    setDisableSslVerification(value: boolean): void;
    /**
     * Set a completely new set of headers.
     *
     * @param {OutgoingHttpHeaders} headers - the new set of headers as an object
     * @returns {void}
     */
    setHeaders(headers: OutgoingHttpHeaders): void;
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
    protected pacedRequestToken(): Promise<any>;
    /**
     * Request a token using an API endpoint.
     *
     * @returns {Promise}
     */
    protected requestToken(): Promise<any>;
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
    protected saveTokenInfo(tokenResponse: any): void;
    /**
     * Check if currently stored token is expired
     *
     * @private
     * @returns {boolean}
     */
    private isTokenExpired;
    /**
     * Check if currently stored token should be refreshed
     * i.e. past the window to request a new token
     *
     * @private
     * @returns {boolean}
     */
    private tokenNeedsRefresh;
}
