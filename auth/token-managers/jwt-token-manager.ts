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

import extend = require('extend');
import { OutgoingHttpHeaders } from 'http';
import jwt = require('jsonwebtoken');
import logger from '../../lib/logger';
import { RequestWrapper } from '../../lib/request-wrapper';

function getCurrentTime(): number {
  return Math.floor(Date.now() / 1000);
}

/** Configuration options for JWT token retrieval. */
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
}

/**
 * A class for shared functionality for parsing, storing, and requesting
 * JWT tokens. Intended to be used as a parent to be extended for token
 * request management. Child classes should implement `requestToken()`
 * to retrieve the bearer token from intended sources.
 */
export class JwtTokenManager {
  protected url: string;
  protected tokenName: string;
  protected disableSslVerification: boolean;
  protected headers: OutgoingHttpHeaders;
  protected requestWrapperInstance: RequestWrapper;
  private tokenInfo: any;
  private expireTime: number;

  /**
   * Create a new [[JwtTokenManager]] instance.
   * @constructor
   * @param {object} options Configuration options.
   * @param {boolean} options.disableSslVerification A flag that indicates
   *   whether verification of the token server's SSL certificate should be
   *   disabled or not
   * @param {string} options.url for HTTP token requests.
   * @param {object<string, string>} options.headers to be sent with every
   *   outbound HTTP requests to token services.
   */
  constructor(options: TokenManagerOptions) {
    // all parameters are optional
    options = options || {} as TokenManagerOptions;

    this.tokenInfo = {};
    this.tokenName = 'access_token';

    if (options.url) {
      this.url = options.url;
    }

    // request options
    this.disableSslVerification = Boolean(options.disableSslVerification);
    this.headers = options.headers || {};

    // any config options for the internal request library, like `proxy`, will be passed here
    this.requestWrapperInstance = new RequestWrapper(options);
  }

  /**
   * Retrieve a new token using `requestToken()` in the case there is not a
   *   currently stored token from a previous call, or the previous token
   *   has expired.
   */
  public getToken(): Promise<any> {
    if (!this.tokenInfo[this.tokenName] || this.isTokenExpired()) {
      // 1. request a new token
      return this.requestToken().then(tokenResponse => {
        this.saveTokenInfo(tokenResponse.result);
        return this.tokenInfo[this.tokenName];
      });
    } else {
      // 2. use valid, managed token
      return Promise.resolve(this.tokenInfo[this.tokenName]);
    }
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

  protected requestToken(): Promise<any> {
    const errMsg = '`requestToken` MUST be overridden by a subclass of JwtTokenManagerV1.';
    const err = new Error(errMsg);
    logger.error(errMsg);
    return Promise.reject(err);
  }

  /**
   * Check if currently stored token is "expired"
   * i.e. past the window to request a new token
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
    return expireTime < currentTime;
  }

  /**
   * Save the JWT service response and the calculated expiration time to the object's state.
   *
   * @param tokenResponse - Response object from JWT service request
   * @private
   * @returns {void}
   */
  private saveTokenInfo(tokenResponse): void {
    const accessToken = tokenResponse[this.tokenName];

    if (!accessToken) {
      const err = 'Access token not present in response';
      logger.error(err);
      throw new Error(err);
    }

    this.expireTime = this.calculateTimeForNewToken(accessToken);
    this.tokenInfo = extend({}, tokenResponse);
  }

  /**
   * Decode the access token and calculate the time to request a new token.
   *
   * A time buffer prevents the edge case of the token expiring before the request could be made.
   * The buffer will be a fraction of the total time to live - we are using 80%
   *
   * @param accessToken - JSON Web Token received from the service
   * @private
   * @returns {void}
   */
  private calculateTimeForNewToken(accessToken): number {
    // the time of expiration is found by decoding the JWT access token
    // exp is the time of expire and iat is the time of token retrieval
    let timeForNewToken;
    const decodedResponse = jwt.decode(accessToken);
    if (decodedResponse) {
      const { exp, iat } = decodedResponse;
      const fractionOfTtl = 0.8;
      const timeToLive = exp - iat;
      timeForNewToken = exp - (timeToLive * (1.0 - fractionOfTtl));
    } else {
      const err = 'Access token recieved is not a valid JWT'
      logger.error(err);
      throw new Error(err);
    }

    return timeForNewToken;
  }
}
