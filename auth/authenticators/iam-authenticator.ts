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

import { OutgoingHttpHeaders } from 'http';
import { IamTokenManager } from '../token-managers';
import { BaseOptions, TokenRequestBasedAuthenticator } from './token-request-based-authenticator';

export interface Options extends BaseOptions {
  apikey: string;
  clientId?: string;
  clientSecret?: string;
}

export class IamAuthenticator extends TokenRequestBasedAuthenticator {
  protected requiredOptions = ['apikey'];
  private apikey: string;
  private clientId: string;
  private clientSecret: string;

  /**
   * IAM Authenticator Class
   *
   * Handles the IAM authentication pattern.
   *
   * @param {Object} options
   * @constructor
   */
  constructor(options: Options) {    
    super(options);

    this.validate(options, this.requiredOptions);

    this.apikey = options.apikey;
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    
    // the param names are shared between the authenticator and the token manager
    // so we can just pass along the options object
    this.tokenManager = new IamTokenManager(options);
  }

  /**
   * Setter for the Client ID and the Client Secret. Both should be provided.
   *
   * @param {string} clientId
   * @param {string} clientSecret
   * @returns {void}
   */
  public setClientIdAndSecret(clientId: string, clientSecret: string): void {
    this.clientId = clientId;
    this.clientSecret = clientSecret;

    // update properties in token manager
    this.tokenManager.setClientIdAndSecret(clientId, clientSecret);
  }
}
