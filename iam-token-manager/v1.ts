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
import { JwtTokenManager } from '../auth/jwt-token-manager';
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
  url?: string;
  iamUrl?: string;
  iamApikey?: string;
  accessToken?: string;
  iamAccessToken?: string;
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

export class IamTokenManagerV1 extends JwtTokenManager {
  private iamApikey: string;
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
    super(options);

    this.url = this.url || options.iamUrl || 'https://iam.cloud.ibm.com/identity/token';

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
   * Request an IAM token using an API key.
   *
   * @param {Function} cb - The callback that handles the response.
   * @returns {void}
   */
  protected requestToken(cb: Function): void {
    // Use bx:bx as default auth header creds.
    let clientId = 'bx';
    let clientSecret = 'bx';

    // If both the clientId and secret were specified by the user, then use them.
    if (this.iamClientId && this.iamClientSecret) {
        clientId = this.iamClientId;
        clientSecret = this.iamClientSecret;
    }

    const parameters = {
      options: {
        url: this.url,
        method: 'POST',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
          Authorization:
            this.computeBasicAuthHeader(clientId, clientSecret),
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
}
