/* eslint-disable @typescript-eslint/no-unused-vars, class-methods-use-this */

/**
 * (C) Copyright IBM Corp. 2020, 2021.
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

import type { OutgoingHttpHeaders } from 'http';
import { stripTrailingSlash } from '../../lib/helper';
import logger from '../../lib/logger';
import { RequestWrapper } from '../../lib/request-wrapper';
import { getCurrentTime } from '../utils';

/** Configuration options for token retrieval. */
export type TokenManagerOptions = {
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
export class TokenManager {
  protected url: string;

  protected disableSslVerification: boolean;

  protected headers: OutgoingHttpHeaders;

  protected requestWrapperInstance: RequestWrapper;

  protected accessToken: string;

  protected expireTime: number;

  protected refreshTime: number;

  private requestTime: number;

  private pendingRequests: any[];

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
  constructor(options: TokenManagerOptions = {}) {
    if (options.url) {
      this.url = stripTrailingSlash(options.url);
    }

    // request options
    this.disableSslVerification = Boolean(options.disableSslVerification);
    this.headers = options.headers || {};

    // any config options for the internal request library, like `proxy`, will be passed here
    this.requestWrapperInstance = new RequestWrapper(options);

    // Array of requests pending completion of an active token request -- initially empty
    this.pendingRequests = [];
  }

  /**
   * Retrieve a new token using `requestToken()` in the case there is not a
   *   currently stored token from a previous call, or the previous token
   *   has expired.
   */
  public getToken(): Promise<string> {
    if (!this.accessToken || this.isTokenExpired()) {
      // 1. request a new token
      return this.pacedRequestToken().then(() => this.accessToken);
    }
    // If refresh needed, kick one off
    if (this.tokenNeedsRefresh()) {
      this.requestToken().then((tokenResponse) => {
        this.saveTokenInfo(tokenResponse);
      });
    }
    // 2. use valid, managed token
    return Promise.resolve(this.accessToken);
  }

  /**
   * Setter for the disableSslVerification property.
   *
   * @param {boolean} value - the new value for the disableSslVerification
   *   property
   * @returns {void}
   */
  public setDisableSslVerification(value: boolean): void {
    // if they try to pass in a non-boolean value,
    // use the "truthy-ness" of the value
    this.disableSslVerification = Boolean(value);
  }

  /**
   * Set a completely new set of headers.
   *
   * @param {OutgoingHttpHeaders} headers - the new set of headers as an object
   * @returns {void}
   */
  public setHeaders(headers: OutgoingHttpHeaders): void {
    if (typeof headers !== 'object') {
      // do nothing, for now
      return;
    }
    this.headers = headers;
  }

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
  protected pacedRequestToken(): Promise<any> {
    const currentTime = getCurrentTime();
    if (this.requestTime > currentTime - 60) {
      // token request is active -- queue the promise for this request
      return new Promise((resolve, reject) => {
        this.pendingRequests.push({ resolve, reject });
      });
    }
    this.requestTime = currentTime;
    return this.requestToken()
      .then((tokenResponse) => {
        this.saveTokenInfo(tokenResponse);
        this.pendingRequests.forEach(({ resolve }) => {
          resolve();
        });
        this.pendingRequests = [];
        this.requestTime = 0;
      })
      .catch((err) => {
        this.pendingRequests.forEach(({ reject }) => {
          reject(err);
        });
        throw err;
      });
  }

  /**
   * Request a token using an API endpoint.
   *
   * @returns {Promise}
   */
  protected requestToken(): Promise<any> {
    const errMsg = '`requestToken` MUST be overridden by a subclass of TokenManagerV1.';
    const err = new Error(errMsg);
    logger.error(errMsg);
    return Promise.reject(err);
  }

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
  protected saveTokenInfo(tokenResponse): void {
    const errMsg = '`saveTokenInfo` MUST be overridden by a subclass of TokenManager.';
    logger.error(errMsg);
  }

  /**
   * Check if currently stored token is expired
   *
   * @private
   * @returns {boolean}
   */
  private isTokenExpired(): boolean {
    const { expireTime } = this;

    if (!expireTime) {
      return true;
    }

    const currentTime = getCurrentTime();
    return expireTime <= currentTime;
  }

  /**
   * Check if currently stored token should be refreshed
   * i.e. past the window to request a new token
   *
   * @private
   * @returns {boolean}
   */
  private tokenNeedsRefresh(): boolean {
    const { refreshTime } = this;
    const currentTime = getCurrentTime();

    if (refreshTime && refreshTime > currentTime) {
      return false;
    }

    // Update refreshTime to 60 seconds from now to avoid redundant refreshes
    this.refreshTime = currentTime + 60;

    return true;
  }
}
