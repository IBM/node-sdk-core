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

import { IamRequestBasedTokenManager } from '../token-managers';
import { BaseOptions, TokenRequestBasedAuthenticator } from './token-request-based-authenticator';

/** Configuration options for IAM Request based authentication. */
export interface IamRequestOptions extends BaseOptions {
  /**
   * The `clientId` and `clientSecret` fields are used to form a "basic"
   * authorization header for IAM token requests.
   */
  clientId?: string;
  /**
   * The `clientId` and `clientSecret` fields are used to form a "basic"
   * authorization header for IAM token requests.
   */
  clientSecret?: string;

  /**
   * The "scope" parameter to use when fetching the bearer token from the IAM token server.
   */
  scope?: string;
}

/**
 * The [[IamRequestBasedAuthenticator]] provides shared configuration and functionality
 * for authenticators that interact with the IAM service to inherit. This authenticator
 * is not meant for use on its own.
 */
export class IamRequestBasedAuthenticator extends TokenRequestBasedAuthenticator {
  protected tokenManager: IamRequestBasedTokenManager;

  protected clientId: string;

  protected clientSecret: string;

  protected scope: string;

  /**
   *
   * Create a new [[IamRequestBasedAuthenticator]] instance.
   *
   * @param {object} options Configuration options for IAM authentication.
   * @param {boolean} options.disableSslVerification A flag that indicates
   *   whether verification of the token server's SSL certificate should be
   *   disabled or not
   * @param {string} options.url for HTTP token requests.
   * @param {object<string, string>} options.headers to be sent with every IAM token request
   * @param {string} [options.clientId] The `clientId` and `clientSecret` fields are used to form a "basic"
   *   authorization header for IAM token requests.
   * @param {string} [options.clientSecret] The `clientId` and `clientSecret` fields are used to form a "basic"
   *   authorization header for IAM token requests.
   * @param {string} [options.scope] The "scope" parameter to use when fetching the bearer token from the
   *   IAM token server.
   * @throws {Error} When the configuration options are not valid.
   */
  constructor(options: IamRequestOptions) {
    // all parameters are optional
    options = options || ({} as IamRequestOptions);

    super(options);

    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.scope = options.scope;

    this.tokenManager = new IamRequestBasedTokenManager(options);
  }

  /**
   * Setter for the mutually inclusive `clientId` and the `clientSecret`.
   * @param {string} clientId The `clientId` and `clientSecret` fields are used to form a "basic"
   *   authorization header for IAM token requests.
   * @param {string} clientSecret The `clientId` and `clientSecret` fields are used to form a "basic"
   *   authorization header for IAM token requests.
   */
  public setClientIdAndSecret(clientId: string, clientSecret: string): void {
    this.clientId = clientId;
    this.clientSecret = clientSecret;

    // update properties in token manager
    this.tokenManager.setClientIdAndSecret(clientId, clientSecret);
  }

  /**
   * Setter for the "scope" parameter to use when fetching the bearer token from the IAM token server.
   * @param {string} scope A space seperated string that makes up the scope parameter
   */
  public setScope(scope: string): void {
    this.scope = scope;

    // update properties in token manager
    this.tokenManager.setScope(scope);
  }
}
