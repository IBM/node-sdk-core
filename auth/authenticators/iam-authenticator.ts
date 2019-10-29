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

import { IamTokenManager } from '../token-managers';
import { validateInput } from '../utils';
import { BaseOptions, TokenRequestBasedAuthenticator }
  from './token-request-based-authenticator';

/** Configuration options for IAM authentication. */
export interface Options extends BaseOptions {
  /** The IAM api key */
  apikey: string;
  /**
   * The `clientId` and `clientSecret` fields are used to form a "basic"
   * authorization header for IAM token requests.
   */
  clientId?: string;
  /**
   * The client_id and client_secret fields are used to form a "basic"
   * authorization header for IAM token requests.
   */
  clientSecret?: string;
}

/**
 * The [[IamAuthenticator]] utilizes an `apikey`, or `clientId` and
 *   `clientSecret` pair to obtain a suitable bearer token, via an
 *   [[IamTokenManager]], and adds it to requests.
 *
 * The bearer token will be sent as an Authorization header in the form:
 *
 *      Authorization: Bearer <bearer-token>
 */
export class IamAuthenticator extends TokenRequestBasedAuthenticator {
  protected requiredOptions = ['apikey'];
  protected tokenManager: IamTokenManager;
  private apikey: string;
  private clientId: string;
  private clientSecret: string;

  /**
   *
   * Create a new [[IamAuthenticator]] instance with an internal [[IamTokenManager]].
   *
   * @param {object} options Configuration options for IAM authentication.
   * @param {string} options.apikey The IAM api key.
   * @param {string=} options.clientId The client_id and client_secret fields are used to form a "basic"
   *   authorization header for IAM token requests.
   * @param {string=} options.clientSecret The client_id and client_secret fields are used to form a "basic"
   *   authorization header for IAM token requests.
   * @throws {Error} When the configuration options are not valid.
   */
  constructor(options: Options) {
    super(options);

    validateInput(options, this.requiredOptions);

    this.apikey = options.apikey;
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;

    // the param names are shared between the authenticator and the token
    // manager so we can just pass along the options object
    this.tokenManager = new IamTokenManager(options);
  }

  /**
   * Setter for the mutually inclusive `clientId` and the `clientSecret`.
   * @param {string} clientId The client_id and client_secret fields are used to form a "basic"
   *   authorization header for IAM token requests.
   * @param {string} clientSecret The client_id and client_secret fields are used to form a "basic"
   *   authorization header for IAM token requests.
   */
  public setClientIdAndSecret(clientId: string, clientSecret: string): void {
    this.clientId = clientId;
    this.clientSecret = clientSecret;

    // update properties in token manager
    this.tokenManager.setClientIdAndSecret(clientId, clientSecret);
  }
}
