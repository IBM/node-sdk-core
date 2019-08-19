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
import { JwtTokenManagerV1 } from '../token-managers';
import { Authenticator } from './authenticator';
import { AuthenticateCallback, AuthenticateOptions, AuthenticatorInterface } from './authenticator-interface';

export type BaseOptions = {
  headers?: OutgoingHttpHeaders;
  disableSslVerification?: boolean;
  url?: string;
  /** Allow additional request config parameters */
  [propName: string]: any;
}

export class TokenRequestBasedAuthenticator extends Authenticator implements AuthenticatorInterface {
  protected tokenManager: any;
  protected url: string;
  protected headers: OutgoingHttpHeaders;
  protected disableSslVerification: boolean;

  /**
   * Request Based Authenticator Class
   *
   * Handles authentication patterns that invoke requests for bearer tokens.
   *
   * @param {Object} options
   * @constructor
   */
  constructor(options: BaseOptions) {
    super();

    this.disableSslVerification = Boolean(options.disableSslVerification);
    this.url = options.url;

    // default to empty object
    this.headers = options.headers || {};

    // this class must be extended by a subclass - the JwtTokenManagerV1
    // will fail upon requesting a token
    this.tokenManager = new JwtTokenManagerV1(options);
  }

  /**
   * Setter for the disableSslVerification property.
   *
   * @param {boolean} value - the new value for the disableSslVerification property
   * @returns {void}
   */
  public setDisableSslVerification(value: boolean): void {
    // if they try to pass in a non-boolean value,
    // use the "truthy-ness" of the value
    this.disableSslVerification = Boolean(value);
    this.tokenManager.disableSslVerification = this.disableSslVerification; // could use a setter here
  }

  /**
   * Set a completely new set of headers. Should we have a method to add/remove a single header?
   *
   * @param {OutgoingHttpHeaders} headers - the new set of headers as an object
   * @returns {void}
   */
  public setHeaders(headers: OutgoingHttpHeaders): void {
    if (typeof headers !== 'object') {
      // do nothing, for now
      return;
    }
    this.headers = headers;
    this.tokenManager.headers = this.headers;
  }

  public authenticate(options: AuthenticateOptions, callback: AuthenticateCallback): void {
    this.tokenManager.getToken((err, token) => {
      if (err) {
        callback(err);
      } else {
        const authHeader = { Authorization: `Bearer ${token}` };
        options.headers = extend(true, {}, options.headers, authHeader);
        callback(null);
      }
    });
  }
}
