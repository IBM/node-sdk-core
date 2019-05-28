/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
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
import { sendRequest } from '../lib/requestwrapper';

function getCurrentTime(): number {
  return Math.floor(Date.now() / 1000);
}

export type Options = {
  accessToken?: string;
  url?: string;
}

export class JwtTokenManager {
  protected url: string;
  protected tokenName: string;
  protected userAccessToken: string;
  private tokenInfo: any;
  private timeToLive: number;
  private expireTime: number;

  /**
   * Token Manager Service
   *
   * Retreives, stores, and refreshes JSON web tokens.
   *
   * @param {Object} options
   * @param {String} options.url - url of the api to retrieve tokens from
   * @param {String} options.accessToken
   * @constructor
   */
  constructor(options: Options) {
    this.tokenInfo = {};

    this.tokenName = 'access_token';

    if (options.url) {
      this.url = options.url;
    }
    if (options.accessToken) {
      this.userAccessToken = options.accessToken;
    }
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
        this.saveTokenInfo(tokenResponse);
        return cb(err, this.tokenInfo[this.tokenName]);
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
    cb(null, 'token');
  }

  /**
   * Compute and return a Basic Authorization header from a username and password.
   *
   * @param {string} username - The username or client id
   * @param {string} password - The password or client secret
   * @returns {string}
   */
  protected computeBasicAuthHeader(username, password): string {
    const encodedCreds = Buffer.from(`${username}:${password}`).toString('base64');
    return `Basic ${encodedCreds}`;
  }

  /**
   * Check if currently stored token is expired.
   *
   * Using a buffer to prevent the edge case of the
   * token expiring before the request could be made.
   *
   * The buffer will be a fraction of the total TTL. Using 80%.
   *
   * @private
   * @returns {boolean}
   */
  private isTokenExpired(): boolean {
    const { timeToLive, expireTime } = this;

    if (!timeToLive || !expireTime) {
      return true;
    }

    const fractionOfTtl = 0.8;
    const currentTime = getCurrentTime();
    const refreshTime = expireTime - (timeToLive * (1.0 - fractionOfTtl));
    return refreshTime < currentTime;
  }

  /**
   * Decode the access token and save the response from the JWT service to the object's state.
   *
   * @param tokenResponse - Response object from JWT service request
   * @private
   * @returns {void}
   */
  private saveTokenInfo(tokenResponse): void {
    const accessToken = tokenResponse[this.tokenName];

    // the time of expiration is found by decoding the JWT access token
    const decodedResponse = jwt.decode(accessToken);
    const { exp, iat } = decodedResponse;

    // exp is the time of expire and iat is the time of token retrieval
    this.timeToLive = exp - iat;
    this.expireTime = exp;

    this.tokenInfo = extend({}, tokenResponse);
  }
}
