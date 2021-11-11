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

import extend from 'extend';
import { OutgoingHttpHeaders } from 'http';
import logger from '../../lib/logger';
import { computeBasicAuthHeader, onlyOne, removeSuffix } from '../utils';
import { JwtTokenManager, JwtTokenManagerOptions } from './jwt-token-manager';

const CLIENT_ID_SECRET_WARNING =
  'Warning: Client ID and Secret must BOTH be given, or the header will not be included.';
const DEFAULT_IAM_URL = 'https://iam.cloud.ibm.com';
const OPERATION_PATH = '/identity/token';

/** Configuration options for IAM token retrieval. */
export interface IamRequestOptions extends JwtTokenManagerOptions {
  clientId?: string;
  clientSecret?: string;
  scope?: string;
}

/**
 * The IamRequestBasedTokenManager class contains code relevant to any token manager that
 * interacts with the IAM service to manage a token. It stores information relevant to all
 * IAM requests, such as the client ID and secret, and performs the token request with a set
 * of request options common to any IAM token management scheme. It is intended that this
 * class be extended with specific implementations.
 */
export class IamRequestBasedTokenManager extends JwtTokenManager {
  private clientId: string;

  private clientSecret: string;

  private scope: string;

  protected refreshToken: string;

  protected formData: any;

  /**
   *
   * Create a new [[IamRequestBasedTokenManager]] instance.
   *
   * @param {object} options Configuration options.
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
  constructor(options: IamRequestOptions) {
    // all parameters are optional
    options = options || ({} as IamRequestOptions);

    super(options);

    // Canonicalize the URL by removing the operation path if it was specified by the user.
    this.url = this.url ? removeSuffix(this.url, OPERATION_PATH) : DEFAULT_IAM_URL;

    if (options.clientId) {
      this.clientId = options.clientId;
    }
    if (options.clientSecret) {
      this.clientSecret = options.clientSecret;
    }
    if (options.scope) {
      this.scope = options.scope;
    }
    if (onlyOne(options.clientId, options.clientSecret)) {
      // tslint:disable-next-line
      logger.warn(CLIENT_ID_SECRET_WARNING);
    }

    // initialize the form data object
    this.formData = {};
  }

  /**
   * Set the IAM `scope` value.
   * This value is the form parameter to use when fetching the bearer token
   * from the IAM token server.
   *
   * @param {string} scope - A space seperated string that makes up the scope parameter.
   * @returns {void}
   */
  public setScope(scope: string): void {
    this.scope = scope;
  }

  /**
   * Set the IAM `clientId` and `clientSecret` values.
   * These values are used to compute the Authorization header used
   * when retrieving the IAM access token.
   * If these values are not set, no Authorization header will be
   * set on the request (it is not required).
   *
   * @param {string} clientId - The client id.
   * @param {string} clientSecret - The client secret.
   * @returns {void}
   */
  public setClientIdAndSecret(clientId: string, clientSecret: string): void {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    if (onlyOne(clientId, clientSecret)) {
      // tslint:disable-next-line
      logger.warn(CLIENT_ID_SECRET_WARNING);
    }
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

  /**
   * Request an IAM token using an API key.
   *
   * @returns {Promise}
   */
  protected requestToken(): Promise<any> {
    // these cannot be overwritten
    const requiredHeaders = {
      'Content-type': 'application/x-www-form-urlencoded',
    } as OutgoingHttpHeaders;

    // If both the clientId and secret were specified by the user, then use them.
    if (this.clientId && this.clientSecret) {
      requiredHeaders.Authorization = computeBasicAuthHeader(this.clientId, this.clientSecret);
    }

    if (this.scope) {
      this.formData.scope = this.scope;
    }

    const parameters = {
      options: {
        url: this.url + OPERATION_PATH,
        method: 'POST',
        headers: extend(true, {}, this.headers, requiredHeaders),
        form: this.formData,
        rejectUnauthorized: !this.disableSslVerification,
      },
    };

    return this.requestWrapperInstance.sendRequest(parameters);
  }
}
