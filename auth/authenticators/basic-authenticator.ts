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
import { computeBasicAuthHeader } from '../utils';
import { Authenticator } from './authenticator';
import { AuthenticateCallback, AuthenticateOptions, AuthenticatorInterface } from './authenticator-interface';

export type Options = {
  username?: string;
  password?: string;
}

export class BasicAuthenticator extends Authenticator implements AuthenticatorInterface {
  protected requiredOptions = ['username', 'password'];
  private username: string;
  private password: string;

  /**
   * Basic Auth Config Class
   *
   * Handles the Basic Authentication pattern.
   *
   * @param {Object} options
   * @param {String} options.username
   * @param {String} options.password
   * @constructor
   */
  constructor(options: Options) {
    super();

    this.validate(options, this.requiredOptions);

    this.username = options.username;
    this.password = options.password;
  }

  public authenticate(options: AuthenticateOptions, callback: AuthenticateCallback): void {
    const authHeaderString = computeBasicAuthHeader(this.username, this.password);
    const authHeader = { Authorization: authHeaderString }

    options.headers = extend(true, {}, options.headers, authHeader);
    callback(null);
  }
}