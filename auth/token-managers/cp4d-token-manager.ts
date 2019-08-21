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
import { getMissingParams } from '../../lib/helper';
import { computeBasicAuthHeader } from '../utils';
import { JwtTokenManager } from './jwt-token-manager';

// we should make these options extend the ones from the base class
export type Options = {
  url: string;
  username?: string;
  password?: string;
  disableSslVerification?: boolean;
  requestWrapper?: any;
}

// this interface is a representation of the response
// object from the CP4D authentication service
export interface CpdTokenData {
  username: string;
  role: string;
  permissions: string[];
  sub: string;
  iss: string;
  aud: string;
  uid: string;
  _messageCode_: string;
  message: string;
  accessToken: string;
}

export class Cp4dTokenManager extends JwtTokenManager {
  private username: string;
  private password: string;

  /**
   * ICP Token Manager Service
   *
   * Retreives and stores ICP access tokens.
   *
   * @param {Object} options
   * @param {String} options.username
   * @param {String} options.password
   * @param {String} options.accessToken - user-managed access token
   * @param {String} options.url - URL for the CP4D cluster
   * @param {Boolean} options.disableSslVerification - disable SSL verification for token request
   * @constructor
   */
  constructor(options: Options) {
    super(options);

    this.tokenName = 'accessToken';

    // check for required params
    const requiredOptions = ['username', 'password', 'url'];
    const missingParamsError = getMissingParams(options, requiredOptions);
    if (missingParamsError) {
      throw missingParamsError;
    }

    const tokenApiPath = '/v1/preauth/validateAuth';

    // do not append the path if user already has
    if (this.url && !this.url.endsWith(tokenApiPath)) {
      this.url = this.url + tokenApiPath;
    }

    this.username = options.username;
    this.password = options.password;
  }

  /**
   * Callback for handling response.
   *
   * @callback requestTokenCallback
   * @param {Error} An error if there is one, null otherwise
   * @param {Object} The response if request is successful, null otherwise
   */
  /**
   * Request an CP4D token using a basic auth header.
   *
   * @param {requestTokenCallback} callback - The callback that handles the response.
   * @returns {void}
   */
  protected requestToken(callback: Function): void {
    // these cannot be overwritten
    const requiredHeaders = {
      Authorization: computeBasicAuthHeader(this.username, this.password),
    };

    const parameters = {
      options: {
        url: this.url,
        method: 'GET',
        headers: extend(true, {}, this.headers, requiredHeaders),
        rejectUnauthorized: !this.disableSslVerification,
      }
    };
    this.requestWrapperInstance.sendRequest(parameters, callback);
  }
}
