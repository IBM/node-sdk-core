/**
 * (C) Copyright IBM Corp. 2019, 2021.
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

// This could just be the type for the `baseOptions` field of the Base Service
// but to avoid a circular dependency or a refactor, this will do for now

/**
 * The request object containing the headers property that
 * authentication information will be added to.
 */
export interface AuthenticateOptions {
  /**
   * Headers to augment with authentication information.
   */
  headers?: OutgoingHttpHeaders;

  [propName: string]: any;
}

/**
 * This interface defines the common methods associated with an Authenticator
 * implementation.
 */
export interface AuthenticatorInterface {
  /**
   * Add authentication information to the specified request.
   *
   * @param {object} requestOptions The request to augment with authentication information.
   * @param {object.<string, string>} requestOptions.headers The headers the
   *   authentication information will be added to.
   */
  authenticate(requestOptions: AuthenticateOptions): Promise<void | Error>;
}
