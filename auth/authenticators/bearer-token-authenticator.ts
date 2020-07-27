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

import { validateInput } from '../utils';
import { Authenticator } from './authenticator';
import { AuthenticateOptions } from './authenticator-interface';

/** Configuration options for bearer authentication. */
export type Options = {
  /** The bearer token to be added to requests. */
  bearerToken: string;
}

/**
 * The BearerTokenAuthenticator will set a user-provided bearer token
 *   in requests.
 *
 * The bearer token will be sent as an Authorization header in the form:
 *
 *      Authorization: Bearer <bearer-token>
 */
export class BearerTokenAuthenticator extends Authenticator {
  protected requiredOptions = ['bearerToken'];
  private bearerToken: string;

 /**
  * Create a new BearerTokenAuthenticator instance.
  *
  * @param {object} options Configuration options for bearer authentication.
  * @param {string} options.bearerToken The bearer token to be added
  *   to requests.
  * @throws {Error} The configuration bearerToken is not valid, or unspecified.
  */
  constructor(options: Options) {
    super();

    validateInput(options, this.requiredOptions);

    this.bearerToken = options.bearerToken;
  }

  /**
   * Set a new bearer token to be sent in subsequent requests.
   *
   * @param {string} bearerToken The bearer token that will be sent in service
   *   requests.
   */
  public setBearerToken(bearerToken: string): void {
    this.bearerToken = bearerToken;
  }

  /**
   * Add a bearer token to the `request`. The bearer token information
   * will be set in the Authorization property of`request.headers` in the form:
   *
   *      Authorization: Bearer <bearer-token>
   *
   * @param {object} requestOptions - The request to augment with authentication
   *   information.
   * @param {object.<string, string>} requestOptions.headers - The headers the
   *   authentication information will be added to.
   */
  public authenticate(requestOptions: AuthenticateOptions): Promise<void> {
    return new Promise((resolve) => {
      const authHeader = { Authorization: `Bearer ${this.bearerToken}` };
      requestOptions.headers = Object.assign({}, requestOptions.headers, authHeader);
      resolve();
    });
  }
}
