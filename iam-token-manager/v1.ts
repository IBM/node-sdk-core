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
import { sendRequest } from '../lib/requestwrapper';

/**
 * Check for only one of two elements being defined.
 * Returns true if a is defined and b is undefined,
 * or vice versa. Returns false if both are defined
 * or both are undefined.
 *
 * @param {any} a - The first object
 * @param {any} b - The second object
 * @returns {boolean}
 */
function onlyOne(a: any, b: any): boolean {
  return Boolean((a && !b) || (b && !a));
}

const CLIENT_ID_SECRET_WARNING = 'Warning: Client ID and Secret must BOTH be given, or the defaults will be used.';

export type Options = {
  iamApikey?: string;
  iamAccessToken?: string;
  iamUrl?: string;
  iamClientId?: string;
  iamClientSecret?: string;
}

// this interface is a representation of the response
// object from the IAM service, hence the snake_case 
// parameter names
export interface IamTokenData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expiration: number;
}

export class IamTokenManagerV1 {
  name: string;
  serviceVersion: string;
  protected iamUrl: string;
  protected tokenInfo: IamTokenData;
  private iamApikey: string;
  private userAccessToken: string;
  private iamClientId: string;
  private iamClientSecret: string;

  /**
   * IAM Token Manager Service
   *
   * Retreives, stores, and refreshes IAM tokens.
   *
   * @param {Object} options
   * @param {String} options.iamApikey
   * @param {String} options.iamAccessToken
   * @param {String} options.iamUrl - url of the iam api to retrieve tokens from
   * @constructor
   */
  constructor(options: Options) {
    this.iamUrl = options.iamUrl || 'https://iam.cloud.ibm.com/identity/token';
    this.tokenInfo = {} as IamTokenData;
    if (options.iamApikey) {
      this.iamApikey = options.iamApikey;
    }
    if (options.iamAccessToken) {
      this.userAccessToken = options.iamAccessToken;
    }
    if (options.iamClientId) {
      this.iamClientId = options.iamClientId;
    }
    if (options.iamClientSecret) {
      this.iamClientSecret = options.iamClientSecret;
    }
    if (onlyOne(options.iamClientId, options.iamClientSecret)) {
      // tslint:disable-next-line
      console.log(CLIENT_ID_SECRET_WARNING);
    }
  }

  /**
   * This function sends an access token back through a callback. The source of the token
   * is determined by the following logic:
   * 1. If user provides their own managed access token, assume it is valid and send it
   * 2. If this class is managing tokens and does not yet have one, make a request for one
   * 3. If this class is managing tokens and the token has expired, refresh it
   * 4. If this class is managing tokens and has a valid token stored, send it
   *
   * @param {Function} cb - callback function that the token will be passed to
   */
  public getToken(cb: Function) {
    if (this.userAccessToken) {
      // 1. use user-managed token
      return cb(null, this.userAccessToken);
    } else if (!this.tokenInfo.access_token || this.isRefreshTokenExpired()) {
      // 2. request an initial token
      this.requestToken((err, tokenResponse) => {
        this.saveTokenInfo(tokenResponse);
        return cb(err, this.tokenInfo.access_token);
      });
    } else if (this.isTokenExpired()) {
      // 3. refresh a token
      this.refreshToken((err, tokenResponse) => {
        this.saveTokenInfo(tokenResponse);
        return cb(err, this.tokenInfo.access_token);
      });
    } else {
      // 4. use valid managed token
      return cb(null, this.tokenInfo.access_token);
    }
  }

  /**
   * Set the IAM 'client_id' and 'client_secret' values.
   * These values are used to compute the Authorization header used
   * when retrieving or refreshing the IAM access token.
   * If these values are not set, then a default Authorization header
   * will be used when interacting with the IAM token server.
   *
   * @param {string} iamClientId - The client id 
   * @param {string} iamClientSecret - The client secret
   * @returns {void}
   */
  public setIamAuthorizationInfo(iamClientId: string, iamClientSecret: string): void {
    this.iamClientId = iamClientId;
    this.iamClientSecret = iamClientSecret;
    if (onlyOne(iamClientId, iamClientSecret)) {
      // tslint:disable-next-line
      console.log(CLIENT_ID_SECRET_WARNING);
    }
  }

  /**
   * Set a self-managed IAM access token.
   * The access token should be valid and not yet expired.
   *
   * By using this method, you accept responsibility for managing the
   * access token yourself. You must set a new access token before this
   * one expires. Failing to do so will result in authentication errors
   * after this token expires.
   *
   * @param {string} iamAccessToken - A valid, non-expired IAM access token
   * @returns {void}
   */
  public setAccessToken(iamAccessToken: string): void {
    this.userAccessToken = iamAccessToken;
  }

  /**
   * Request an IAM token using an API key.
   *
   * @param {Function} cb - The callback that handles the response.
   * @returns {void}
   */
  private requestToken(cb: Function): void {
    const parameters = {
      options: {
        url: this.iamUrl,
        method: 'POST',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
          Authorization: this.computeIamAuthHeader()
        },
        form: {
          grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
          apikey: this.iamApikey,
          response_type: 'cloud_iam'
        }
      }
    };
    sendRequest(parameters, cb);
  }

  /**
   * Refresh an IAM token using a refresh token.
   *
   * @param {Function} cb - The callback that handles the response.
   * @returns {void}
   */
  private refreshToken(cb: Function) {
    const parameters = {
      options: {
        url: this.iamUrl,
        method: 'POST',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
          Authorization: this.computeIamAuthHeader()
        },
        form: {
          grant_type: 'refresh_token',
          refresh_token: this.tokenInfo.refresh_token
        }
      }
    };
    sendRequest(parameters, cb);
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
    if (!this.tokenInfo.expires_in || !this.tokenInfo.expiration) {
      return true;
    };
    const fractionOfTtl = 0.8;
    const timeToLive = this.tokenInfo.expires_in;
    const expireTime = this.tokenInfo.expiration;
    const currentTime = Math.floor(Date.now() / 1000);
    const refreshTime = expireTime - (timeToLive * (1.0 - fractionOfTtl));
    return refreshTime < currentTime;
  }

  /**
   * Used as a fail-safe to prevent the condition of a refresh token expiring,
   * which could happen after around 30 days. This function will return true
   * if it has been at least 7 days and 1 hour since the last token was
   * retrieved.
   *
   * @private
   * @returns {boolean}
   */
  private isRefreshTokenExpired(): boolean {
    if (!this.tokenInfo.expiration) {
      return true;
    };
    const sevenDays = 7 * 24 * 3600;
    const currentTime = Math.floor(Date.now() / 1000);
    const newTokenTime = this.tokenInfo.expiration + sevenDays;
    return newTokenTime < currentTime;
  }

  /**
   * Save the response from the IAM service request to the object's state.
   *
   * @param {IamTokenData} tokenResponse - Response object from IAM service request
   * @private
   * @returns {void}
   */
  private saveTokenInfo(tokenResponse: IamTokenData): void {
    this.tokenInfo = extend({}, tokenResponse);
  }

  /**
   * Compute and return the Authorization header to be used with the
   * IAM token server interactions (retrieve and refresh access token).
   */
  private computeIamAuthHeader(): string {
	// Use bx:bx as default auth header creds.
	let clientId = 'bx';
	let clientSecret = 'bx';
	
	// If both the clientId and secret were specified by the user, then use them.
	if (this.iamClientId && this.iamClientSecret) {
      clientId = this.iamClientId;
      clientSecret = this.iamClientSecret;
	}
    const encodedCreds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    return `Basic ${encodedCreds}`;
  }
}
