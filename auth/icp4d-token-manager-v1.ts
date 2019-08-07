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
import { JwtTokenManagerV1 } from './jwt-token-manager-v1';
import { computeBasicAuthHeader } from './utils';

export type Options = {
  url: string;
  accessToken?: string;
  username?: string;
  password?: string;
  disableSslVerification?: boolean;
  requestWrapper?: any;
}

// this interface is a representation of the response
// object from the ICP4D authentication service
export interface IcpTokenData {
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

export class Icp4dTokenManagerV1 extends JwtTokenManagerV1 {
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
   * @param {String} options.url - URL for the ICP4D cluster
   * @param {Boolean} options.disableSslVerification - disable SSL verification for token request
   * @constructor
   */
  constructor(options: Options) {
    super(options);

    this.tokenName = 'accessToken';

    if (this.url) {
      this.url = this.url + '/v1/preauth/validateAuth';
    } else if (!this.userAccessToken) {
      // url is not needed if the user specifies their own access token
      throw new Error('`url` is a required parameter for Icp4dTokenManagerV1');
    }

    if (options.username) {
      this.username = options.username;
    }
    if (options.password) {
      this.password = options.password;
    }
    // username and password are required too, unless there's access token
    this.rejectUnauthorized = !options.disableSslVerification;
  }

  /**
   * Callback for handling response.
   *
   * @callback requestTokenCallback
   * @param {Error} An error if there is one, null otherwise
   * @param {Object} The response if request is successful, null otherwise
   */
  /**
   * Request an ICP token using a basic auth header.
   *
   * @param {requestTokenCallback} callback - The callback that handles the response.
   * @returns {void}
   */
  protected requestToken(callback: Function): void {
    const parameters = {
      options: {
        url: this.url,
        method: 'GET',
        headers: {
          Authorization: computeBasicAuthHeader(this.username, this.password),
        },
        rejectUnauthorized: this.rejectUnauthorized,
      }
    };
    this.requestWrapperInstance.sendRequest(parameters, callback);
  }
}
