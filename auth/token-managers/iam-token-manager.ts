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
import logger from '../../lib/logger';
import { computeBasicAuthHeader, validateInput } from '../utils';
import { JwtTokenManager, JwtTokenManagerOptions } from './jwt-token-manager';

/**
 * Check for only one of two elements being defined.
 * Returns true if a is defined and b is undefined,
 * or vice versa. Returns false if both are defined
 * or both are undefined.
 *
 * @param {any} a - The first object
 * @param {any} b - The second object
 * @returns {boolean}
 */
function onlyOne(a: any, b: any): boolean {
  return Boolean((a && !b) || (b && !a));
}

const CLIENT_ID_SECRET_WARNING = 'Warning: Client ID and Secret must BOTH be given, or the header will not be included.';
const SCOPE = 'scope';

/** Configuration options for IAM token retrieval. */
interface Options extends JwtTokenManagerOptions {
  apikey: string;
  clientId?: string;
  clientSecret?: string;
  scope?: string;
}

/**
 * The IAMTokenManager takes an api key and performs the necessary interactions with
 * the IAM token service to obtain and store a suitable bearer token. Additionally, the IAMTokenManager
 * will retrieve bearer tokens via basic auth using a supplied `clientId` and `clientSecret` pair.
 */
export class IamTokenManager extends JwtTokenManager {
  protected requiredOptions = ['apikey'];
  private apikey: string;
  private clientId: string;
  private clientSecret: string;
  private scope: string;

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
   * @param {string} [url='https://iam.cloud.ibm.com/identity/token'] The IAM endpoint for token requests.
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

    this.url = this.url || 'https://iam.cloud.ibm.com/identity/token';

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

    const parameters = {
      options: {
        url: this.url,
        method: 'POST',
        headers: extend(true, {}, this.headers, requiredHeaders),
        form: {
          grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
          apikey: this.apikey,
          response_type: 'cloud_iam'
        },
        rejectUnauthorized: !this.disableSslVerification,
      }
    };

    if (this.scope) {
      parameters.options.form[SCOPE] = this.scope;
    }

    return this.requestWrapperInstance.sendRequest(parameters);
  }
}
