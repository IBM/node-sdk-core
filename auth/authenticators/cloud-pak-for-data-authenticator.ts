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

import { OutgoingHttpHeaders } from 'http';
import { Cp4dTokenManager } from '../token-managers';
import { validateInput } from '../utils';
import { BaseOptions, TokenRequestBasedAuthenticator } from './token-request-based-authenticator';

export interface Options extends BaseOptions {
  username: string;
  password: string;
  url: string;
}

export class CloudPakForDataAuthenticator extends TokenRequestBasedAuthenticator {
  protected requiredOptions = ['username', 'password', 'url'];
  protected tokenManager: Cp4dTokenManager;
  private username: string;
  private password: string;

  /**
   * Cloud Pak for Data Authenticator Class
   *
   * Handles the CP4D authentication pattern:
   * A username and password are provided and used to retrieve a bearer token.
   *
   * @param {Object} options
   * @constructor
   */
  constructor(options: Options) {
    super(options);

    validateInput(options, this.requiredOptions);

    this.username = options.username;
    this.password = options.password;

    // the param names are shared between the authenticator and the token manager
    // so we can just pass along the options object
    this.tokenManager = new Cp4dTokenManager(options);
  }
}
