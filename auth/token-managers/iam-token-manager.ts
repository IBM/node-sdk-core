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
import { getMissingParams } from '../../lib/helper';
import { computeBasicAuthHeader, validateInput } from '../utils';
import { JwtTokenManager, TokenManagerOptions } from './jwt-token-manager';

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

const CLIENT_ID_SECRET_WARNING = 'Warning: Client ID and Secret must BOTH be given, or the header will not be included.';

interface Options extends TokenManagerOptions {
  apikey: string;
  clientId?: string;
  clientSecret?: string;
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

export class IamTokenManager extends JwtTokenManager {
  protected requiredOptions = ['apikey'];
  private apikey: string;
  private clientId: string;
  private clientSecret: string;

  /**
   * IAM Token Manager Service
   *
   * Retreives and stores IAM access tokens.
   *
   * @param {Object} options
   * @param {String} options.apikey
   * @param {String} options.iamAccessToken
   * @param {String} options.iamUrl - url of the iam api to retrieve tokens from
   * @constructor
   */
  constructor(options: Options) {
    super(options);

    validateInput(options, this.requiredOptions);
    
    this.apikey = options.apikey;

    this.url = this.url || 'https://iam.cloud.ibm.com/identity/token';

    if (options.clientId) {
      this.clientId = options.clientId;
    }
    if (options.clientSecret) {
      this.clientSecret = options.clientSecret;
    }
    if (onlyOne(options.clientId, options.clientSecret)) {
      // tslint:disable-next-line
      console.log(CLIENT_ID_SECRET_WARNING);
    }
  }

  /**
   * Set the IAM 'client_id' and 'client_secret' values.
   * These values are used to compute the Authorization header used
   * when retrieving the IAM access token.
   * If these values are not set, no Authorization header will be
   * set on the request (it is not required).
   *
   * @param {string} clientId - The client id 
   * @param {string} clientSecret - The client secret
   * @returns {void}
   */
  public setClientIdAndSecret(clientId: string, clientSecret: string): void {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    if (onlyOne(clientId, clientSecret)) {
      // tslint:disable-next-line
      console.log(CLIENT_ID_SECRET_WARNING);
    }
  }

  /**
   * Callback for handling response.
   *
   * @callback requestTokenCallback
   * @param {Error} An error if there is one, null otherwise
   * @param {Object} The response if request is successful, null otherwise
   */
  /**
   * Request an IAM token using an API key.
   *
   * @param {requestTokenCallback} callback - The callback that handles the response.
   * @returns {void}
   */
  protected requestToken(callback: Function): void {
    // these cannot be overwritten
    const requiredHeaders = {
      'Content-type': 'application/x-www-form-urlencoded',
    } as OutgoingHttpHeaders;

    // If both the clientId and secret were specified by the user, then use them.
    if (this.clientId && this.clientSecret) {
      requiredHeaders.Authorization = computeBasicAuthHeader(this.clientId, this.clientSecret);
    }

    const parameters = {
      options: {
        url: this.url,
        method: 'POST',
        headers: extend(true, {}, this.headers, requiredHeaders),
        form: {
          grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
          apikey: this.apikey,
          response_type: 'cloud_iam'
        },
        rejectUnauthorized: !this.disableSslVerification,
      }
    };
    this.requestWrapperInstance.sendRequest(parameters, callback);
  }
}
