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
import { OutgoingHttpHeaders } from 'http';
import { JwtTokenManager } from '../token-managers';
import { Authenticator } from './authenticator';
import { AuthenticateOptions } from './authenticator-interface';

/** Configuration options for token-based authentication. */
export type BaseOptions = {
  /** Headers to be sent with every outbound HTTP requests to token services. */
  headers?: OutgoingHttpHeaders;
  /**
   * A flag that indicates whether verification of the token server's SSL
   * certificate should be disabled or not.
   */
  disableSslVerification?: boolean;
  /** Endpoint for HTTP token requests. */
  url?: string;
  /** Allow additional request config parameters */
  [propName: string]: any;
}

/**
 * Class for common functionality shared by token-request authenticators.
 * [[TokenRequestBasedAuthenticator]]s use token managers to retrieve, store,
 * and refresh tokens. Not intended to be used as stand-alone authenticator,
 * but as parent class to authenticators that have their own token manager
 * implementations.
 *
 * The tokens will be added as an Authorization headers in the form:
 *
 *      Authorization: Bearer <bearer-token>
 */
export class TokenRequestBasedAuthenticator extends Authenticator {
  protected tokenManager: JwtTokenManager;
  protected url: string;
  protected headers: OutgoingHttpHeaders;
  protected disableSslVerification: boolean;

  /**
   * Create a new [[TokenRequestBasedAuthenticator]] instance with an internal [[JwtTokenManager]].
   *
   * @param {object} options Configuration options.
   * @param {string} options.url for HTTP token requests.
   * @param {boolean} [options.disableSslVerification] A flag that indicates
   *   whether verification of the token server's SSL certificate should be
   *   disabled or not.
   * @param {object<string, string>} [options.headers] to be sent with every
   *   outbound HTTP requests to token services.
   */
  constructor(options: BaseOptions) {
    super();

    this.disableSslVerification = Boolean(options.disableSslVerification);
    this.url = options.url;

    // default to empty object
    this.headers = options.headers || {};

    this.tokenManager = new JwtTokenManager(options);
  }

  /**
   * Set the flag that indicates whether verification of the server's SSL
   * certificate should be disabled or not.
   *
   * @param {boolean} value A flag that indicates whether verification of the
   *   token server's SSL certificate should be disabled or not.
   */
  public setDisableSslVerification(value: boolean): void {
    // if they try to pass in a non-boolean value,
    // use the "truthy-ness" of the value
    this.disableSslVerification = Boolean(value);
    this.tokenManager.setDisableSslVerification(this.disableSslVerification);
  }

  /**
   * Set headers.
   *
   * @param {object<string, string>} headers Default headers to be sent with
   *   every Cloud Pak For Data token request. Overwrites previous default headers.
   */
  public setHeaders(headers: OutgoingHttpHeaders): void {
    if (typeof headers !== 'object') {
      // do nothing, for now
      return;
    }
    this.headers = headers;
    this.tokenManager.setHeaders(this.headers);
  }

  /**
   * Adds bearer token information to `request`. The bearer token information
   * will be set in the Authorization property of`request.headers` in the form:
   *
   *     Authorization: Bearer <bearer-token>
   *
   * @param {object} requestOptions - The request to augment with authentication
   *   information.
   * @param {object.<string, string>} requestOptions.headers - The headers the
   *   authentication information will be added too. Overrides default headers
   *   where there's conflict.
   */
  public authenticate(requestOptions: AuthenticateOptions): Promise<void | Error> {
    return this.tokenManager.getToken().then(token => {
      const authHeader = { Authorization: `Bearer ${token}` };
      requestOptions.headers = extend(true, {}, requestOptions.headers, authHeader);
      return;
    });
  }
}
