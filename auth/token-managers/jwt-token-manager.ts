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
import { RequestWrapper } from '../../lib/requestwrapper';

function getCurrentTime(): number {
  return Math.floor(Date.now() / 1000);
}

export type TokenManagerOptions = {
  url?: string;
  headers?: OutgoingHttpHeaders;
  disableSslVerification?: boolean;
  /** Allow additional request config parameters */
  [propName: string]: any;
}

export class JwtTokenManager {
  protected url: string;
  protected tokenName: string;
  protected disableSslVerification: boolean;
  protected headers: OutgoingHttpHeaders;
  protected requestWrapperInstance;
  private tokenInfo: any;
  private expireTime: number;

  /**
   * Token Manager Service
   *
   * Retreives and stores JSON web tokens.
   *
   * @param {Object} options
   * @param {String} options.url - url of the api to retrieve tokens from
   * @param {String} [options.accessToken] - user-managed access token
   * @constructor
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
   * This function sends an access token back through a callback. The source of the token
   * is determined by the following logic:
   * 1. If user provides their own managed access token, assume it is valid and send it
   * 2. a) If this class is managing tokens and does not yet have one, make a request for one
   *    b) If this class is managing tokens and the token has expired, request a new one
   * 3. If this class is managing tokens and has a valid token stored, send it
   *
   * @param {Function} cb - callback function that the token will be passed to
   */
  public getToken(cb: Function) {
    if (!this.tokenInfo[this.tokenName] || this.isTokenExpired()) {
      // 1. request a new token
      this.requestToken((err, tokenResponse) => {
        if (!err) {
          try {
            this.saveTokenInfo(tokenResponse.result);
          } catch(e) {
            // send lower level error through callback for user to handle
            err = e;
          }
        }
        // return null for access_token if there is an error
        return cb(err, this.tokenInfo[this.tokenName] || null);
      });
    } else {
      // 2. use valid, managed token
      return cb(null, this.tokenInfo[this.tokenName]);
    }
  }

  /**
   * Setter for the disableSslVerification property.
   *
   * @param {boolean} value - the new value for the disableSslVerification property
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
   * Request a JWT using an API key.
   *
   * @param {Function} cb - The callback that handles the response.
   * @returns {void}
   */
  protected requestToken(cb: Function): void {
    const err = new Error('`requestToken` MUST be overridden by a subclass of JwtTokenManagerV1.');
    cb(err, null);
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
      throw new Error('Access token not present in response');
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
      throw new Error('Access token recieved is not a valid JWT');
    }

    return timeForNewToken;
  }
}
