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
import { sendRequest } from '../lib/requestwrapper';
import { JwtTokenManager } from './jwt-token-manager';

export type Options = {
  url: string;
  accessToken?: string;
  username?: string;
  password?: string;
}

// this interface is a representation of the response
// object from the ICP service
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

export class IcpTokenManagerV1 extends JwtTokenManager {
  private username: string;
  private password: string;

  /**
   * ICP Token Manager Service
   *
   * Retreives, stores, and refreshes ICP tokens.
   *
   * @param {Object} options
   * @param {String} options.icpApikey
   * @param {String} options.icpAccessToken
   * @param {String} options.url - url of the icp api to retrieve tokens from
   * @constructor
   */
  constructor(options: Options) {
    super(options);

    this.tokenName = 'accessToken';

    if (this.url) {
      this.url = this.url + '/v1/preauth/validateAuth';
    } else {
      // this is required
      console.error('`url` is a required parameter for the ICP token manager.');
    }
    if (options.username) {
      this.username = options.username;
    }
    if (options.password) {
      this.password = options.password;
    }
    // username and password are required too, unless there's access token
  }

  /**
   * Request an ICP token using a basic auth header.
   *
   * @param {Function} cb - The callback that handles the response.
   * @returns {void}
   */
  protected requestToken(cb: Function): void {
    const parameters = {
      options: {
        url: this.url,
        method: 'GET',
        headers: {
          Authorization:
            this.computeBasicAuthHeader(this.username, this.password),
        },
      }
    };
    sendRequest(parameters, cb);
  }
}
