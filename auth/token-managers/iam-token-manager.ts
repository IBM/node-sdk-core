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
import { IamRequestBasedTokenManager, IamRequestOptions } from './iam-request-based-token-manager';

/** Configuration options for IAM token retrieval. */
interface Options extends IamRequestOptions {
  apikey: string;
}

/**
 * The IAMTokenManager takes an api key and performs the necessary interactions with
 * the IAM token service to obtain and store a suitable bearer token. Additionally, the IAMTokenManager
 * will retrieve bearer tokens via basic auth using a supplied `clientId` and `clientSecret` pair.
 */
export class IamTokenManager extends IamRequestBasedTokenManager {
  protected requiredOptions = ['apikey'];

  protected refreshToken: string;

  private apikey: string;

  /**
   *
   * Create a new [[IamTokenManager]] instance.
   *
   * @param {object} options Configuration options.
   * @param {string} options.apikey The IAM api key.
   * @param {string} [options.clientId] The `clientId` and `clientSecret` fields are used to form a "basic"
   *   authorization header for IAM token requests.
   * @param {string} [options.clientSecret] The `clientId` and `clientSecret` fields are used to form a "basic"
   *   authorization header for IAM token requests.
   * @param {string} [url='https://iam.cloud.ibm.com'] The IAM endpoint for token requests.
   * @param {boolean} [options.disableSslVerification] A flag that indicates
   *   whether verification of the token server's SSL certificate should be
   *   disabled or not.
   * @param {object<string, string>} [options.headers] Headers to be sent with every
   *   outbound HTTP requests to token services.
   * @constructor
   */
  constructor(options: Options) {
    super(options);

    validateInput(options, this.requiredOptions);

    this.apikey = options.apikey;

    // construct form data for the apikey use case of iam token management
    this.formData.apikey = this.apikey;
    this.formData.grant_type = 'urn:ibm:params:oauth:grant-type:apikey';
    this.formData.response_type = 'cloud_iam';
  }

  /**
   * Return the most recently stored refresh token.
   *
   * @public
   * @returns {string}
   */
  public getRefreshToken(): string {
    return this.refreshToken;
  }

  /**
   * Extend this method from the parent class to extract the refresh token from
   * the request and save it.
   *
   * @param tokenResponse - Response object from JWT service request
   * @protected
   * @returns {void}
   */
  protected saveTokenInfo(tokenResponse): void {
    super.saveTokenInfo(tokenResponse);

    const responseBody = tokenResponse.result || {};
    if (responseBody.refresh_token) {
      this.refreshToken = responseBody.refresh_token;
    }
  }
}
