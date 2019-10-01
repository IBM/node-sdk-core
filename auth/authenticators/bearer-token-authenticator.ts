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
import { validateInput } from '../utils';
import { Authenticator } from './authenticator';
import { AuthenticateOptions, AuthenticatorInterface } from './authenticator-interface';

export type Options = {
  bearerToken: string;
}

export class BearerTokenAuthenticator extends Authenticator implements AuthenticatorInterface {
  protected requiredOptions = ['bearerToken'];
  private bearerToken: string;

  /**
   * Bearer Token Authenticator Class
   *
   * Handles the Bearer Token pattern.
   *
   * @param {Object} options
   * @param {String} options.bearerToken - bearer token to pass in header
   * @constructor
   */
  constructor(options: Options) {
    super();

    validateInput(options, this.requiredOptions);

    this.bearerToken = options.bearerToken;
  }

  public setBearerToken(bearerToken: string): void {
    this.bearerToken = bearerToken;
  }

  public authenticate(options: AuthenticateOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const authHeader = { Authorization: `Bearer ${this.bearerToken}` };
      options.headers = extend(true, {}, options.headers, authHeader);
      resolve();
    });
  }
}
