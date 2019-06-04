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
import jwt = require('jsonwebtoken');
import { RequestWrapper } from '../lib/requestwrapper';

function getCurrentTime(): number {
  return Math.floor(Date.now() / 1000);
}

export type Options = {
  accessToken?: string;
  url?: string;
}

export class JwtTokenManagerV1 {
  protected url: string;
  protected tokenName: string;
  protected userAccessToken: string;
  protected rejectUnauthorized: boolean; // for icp4d only
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
  constructor(options: Options) {
    // all parameters are optional
    options = options || {} as Options;

    this.tokenInfo = {};
    this.tokenName = 'access_token';

    if (options.url) {
      this.url = options.url;
    }

    if (options.accessToken) {
      this.userAccessToken = options.accessToken;
    }

    this.requestWrapperInstance = new RequestWrapper();
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
    if (this.userAccessToken) {
      // 1. use user-managed token
      return cb(null, this.userAccessToken);
    } else if (!this.tokenInfo[this.tokenName] || this.isTokenExpired()) {
      // 2. request a new token
      this.requestToken((err, tokenResponse) => {
        if (!err) {
          try {
            this.saveTokenInfo(tokenResponse);
          } catch(e) {
            // send lower level error through callback for user to handle
            err = e;
          }
        }
        // return null for access_token if there is an error
        return cb(err, this.tokenInfo[this.tokenName] || null);
      });
    } else {
      // 3. use valid, sdk-managed token
      return cb(null, this.tokenInfo[this.tokenName]);
    }
  }

  /**
   * Set a self-managed access token.
   * The access token should be valid and not yet expired.
   *
   * By using this method, you accept responsibility for managing the
   * access token yourself. You must set a new access token before this
   * one expires. Failing to do so will result in authentication errors
   * after this token expires.
   *
   * @param {string} accessToken - A valid, non-expired access token
   * @returns {void}
   */
  public setAccessToken(accessToken: string): void {
    this.userAccessToken = accessToken;
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
