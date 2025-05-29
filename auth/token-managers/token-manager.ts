/* eslint-disable @typescript-eslint/no-unused-vars, class-methods-use-this */

/**
 * (C) Copyright IBM Corp. 2020, 2025.
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
import { stripTrailingSlash } from '../../lib/helper';
import logger from '../../lib/logger';
import { RequestWrapper } from '../../lib/request-wrapper';
import { getCurrentTime } from '../utils/helpers';

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
 * Child classes should implement "requestToken()" to retrieve the token
 * from intended sources and "saveTokenInfo(tokenResponse)" to parse and save
 * token information from the response.
 */
export class TokenManager {
  protected url: string;

  protected userAgent: string;

  protected disableSslVerification: boolean;

  protected headers: OutgoingHttpHeaders;

  protected requestWrapperInstance: RequestWrapper;

  protected accessToken: string;

  protected expireTime: number;

  protected refreshTime: number;

  private requestTime: number;

  private pendingRequests: any[];

  /**
   * Create a new TokenManager instance.
   *
   * @param options - Configuration options.
   * This should be an object containing these fields:
   * - url: (optional) the endpoint URL for the token service
   * - disableSslVerification: (optional) a flag that indicates whether verification of the token server's SSL certificate
   * should be disabled or not
   * - headers: (optional) a set of HTTP headers to be sent with each request to the token service
   */
  constructor(options: TokenManagerOptions) {
    // all parameters are optional
    options = options || ({} as TokenManagerOptions);

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
   * Retrieves a new token using "requestToken()" if there is not a
   * currently stored token from a previous call, or the previous token
   * has expired.
   */
  public getToken(): Promise<any> {
    if (!this.accessToken || this.isTokenExpired()) {
      // 1. Need a new token.
      logger.debug('Performing synchronous token refresh');
      return this.pacedRequestToken().then(() => this.accessToken);
    }

    if (this.tokenNeedsRefresh()) {
      // 2. Need to refresh the current (valid) token.
      logger.debug('Performing background asynchronous token fetch');
      this.requestToken().then(
        (tokenResponse) => {
          this.saveTokenInfo(tokenResponse);
        },
        (err) => {
          // If the refresh request failed: catch the error, log a message, and return the stored token.
          // The attempt to get a new token will be retried upon the next request.
          let message =
            'Attempted token refresh failed. The refresh will be retried with the next request.';
          if (err && err.message) {
            message += ` ${err.message}`;
          }
          logger.error(message);
          logger.debug(err);
        }
      );
    } else {
      logger.debug('Using cached access token');
    }

    return Promise.resolve(this.accessToken);
  }

  /**
   * Sets the "disableSslVerification" property.
   *
   * @param value - the new value for the disableSslVerification property
   */
  public setDisableSslVerification(value: boolean): void {
    // if they try to pass in a non-boolean value,
    // use the "truthy-ness" of the value
    this.disableSslVerification = Boolean(value);
  }

  /**
   * Sets the headers to be included with each outbound request to the token server.
   *
   * @param headers - the set of headers to send with each request to the token server
   */
  public setHeaders(headers: OutgoingHttpHeaders): void {
    if (typeof headers !== 'object') {
      // do nothing, for now
      return;
    }
    this.headers = headers;
  }

  /**
   * Paces requests to requestToken().
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
   * @returns Promise
   */
  protected requestToken(): Promise<any> {
    const errMsg = '`requestToken` MUST be overridden by a subclass of TokenManager.';
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
   * @param tokenResponse - the response object from a token service request
   */
  protected saveTokenInfo(tokenResponse): void {
    const errMsg = '`saveTokenInfo` MUST be overridden by a subclass of TokenManager.';
    logger.error(errMsg);
  }

  /**
   * Checks if currently-stored token is expired
   */
  protected isTokenExpired(): boolean {
    const { expireTime } = this;

    if (!expireTime) {
      return true;
    }

    const currentTime = getCurrentTime();
    return expireTime <= currentTime;
  }

  /**
   * Checks if currently-stored token should be refreshed
   * i.e. past the window to request a new token
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
