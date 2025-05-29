/* eslint-disable @typescript-eslint/no-unused-vars, class-methods-use-this */

/**
 * (C) Copyright IBM Corp. 2019, 2025.
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

import { AuthenticateOptions, AuthenticatorInterface } from './authenticator-interface';

/**
 * Base Authenticator class for other Authenticators to extend. Not intended
 * to be used as a stand-alone authenticator.
 */
export class Authenticator implements AuthenticatorInterface {
  /**
   * Constants that define the various authenticator types.
   */
  static AUTHTYPE_BASIC = 'basic';

  static AUTHTYPE_BEARERTOKEN = 'bearerToken';

  static AUTHTYPE_IAM = 'iam';

  static AUTHTYPE_IAM_ASSUME = 'iamAssume';

  static AUTHTYPE_CONTAINER = 'container';

  static AUTHTYPE_CP4D = 'cp4d';

  static AUTHTYPE_NOAUTH = 'noAuth';

  static AUTHTYPE_VPC = 'vpc';

  static AUTHTYPE_MCSP = 'mcsp';

  static AUTHTYPE_MCSPV2 = 'mcspv2';

  static AUTHTYPE_UNKNOWN = 'unknown';

  /**
   * Create a new Authenticator instance.
   *
   * @throws Error: the "new" keyword was not used to construct the authenticator.
   */
  constructor() {
    if (!(this instanceof Authenticator)) {
      throw new Error('the "new" keyword is required to create authenticator instances');
    }
  }

  /**
   * Augment the request with authentication information.
   *
   * @param requestOptions - The request to augment with authentication information.
   * @throws Error: The authenticate method was not implemented by a subclass.
   */
  public authenticate(requestOptions: AuthenticateOptions): Promise<void> {
    const error = new Error('Should be implemented by subclass!');
    return Promise.reject(error);
  }

  /**
   * Retrieves the authenticator's type.
   * The returned value will be the same string that is used
   * when configuring an instance of the authenticator with the
   * \<service_name\>_AUTH_TYPE configuration property
   * (e.g. "basic", "iam", etc.).
   * This function should be overridden in each authenticator
   * implementation class that extends this class.
   *
   * @returns a string that indicates the authenticator's type
   */
  public authenticationType(): string {
    return Authenticator.AUTHTYPE_UNKNOWN;
  }
}
