/**
 * (C) Copyright IBM Corp. 2019, 2023.
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

import { Authenticator } from './authenticator';
import { Cp4dTokenManager } from '../token-managers/cp4d-token-manager';
import { BaseOptions, TokenRequestBasedAuthenticator } from './token-request-based-authenticator';

/** Configuration options for CloudPakForData authentication. */
export interface Options extends BaseOptions {
  /** The username used to obtain a bearer token. */
  username: string;
  /** The password used to obtain a bearer token [required if apikey not specified]. */
  password?: string;
  /** The API key used to obtain a bearer token [required if password not specified]. */
  apikey?: string;
  /** The URL representing the Cloud Pak for Data token service endpoint. */
  url: string;
}

/**
 * The CloudPakForDataAuthenticator will either use a username/password pair or a username/apikey pair to obtain
 * a bearer token from a token server.  When the bearer token expires, a new token is obtained from the token server.
 *
 * The bearer token will be sent as an Authorization header in the form:
 *
 *      Authorization: Bearer \<bearer-token\>
 */
export class CloudPakForDataAuthenticator extends TokenRequestBasedAuthenticator {
  protected requiredOptions = ['username', 'url'];

  protected tokenManager: Cp4dTokenManager;

  private username: string;

  private password: string;

  private apikey: string;

  /**
   * Create a new CloudPakForDataAuthenticator instance.
   *
   * @param options - Configuration options for CloudPakForData authentication.
   * This should be an object containing these fields:
   * - url: (required) the endpoint URL for the CloudPakForData token service
   * - username: (required) the username used to obtain a bearer token
   * - password: (optional) the password used to obtain a bearer token (required if apikey is not specified)
   * - apikey: (optional) the API key used to obtain a bearer token (required if password is not specified)
   * - disableSslVerification: (optional) a flag that indicates whether verification of the token server's SSL certificate
   * should be disabled or not
   * - headers: (optional) a set of HTTP headers to be sent with each request to the token service
   *
   * @throws Error: the username, password, and/or url are not valid, or unspecified, for Cloud Pak For Data token requests.
   */
  constructor(options: Options) {
    super(options);

    this.username = options.username;
    this.password = options.password;
    this.apikey = options.apikey;

    // the param names are shared between the authenticator and the token
    // manager so we can just pass along the options object.
    // also, the token manager will handle input validation
    this.tokenManager = new Cp4dTokenManager(options);
  }

  /**
   * Returns the authenticator's type ('cp4d').
   *
   * @returns a string that indicates the authenticator's type
   */
  // eslint-disable-next-line class-methods-use-this
  public authenticationType(): string {
    return Authenticator.AUTHTYPE_CP4D;
  }
}
