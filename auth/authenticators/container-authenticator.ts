/**
 * Copyright 2021 IBM Corp. All Rights Reserved.
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

import { ContainerTokenManager } from '../token-managers';
import { IamRequestOptions, IamRequestBasedAuthenticator } from './iam-request-based-authenticator';

/** Configuration options for IAM authentication. */
export interface Options extends IamRequestOptions {
  /** The file containing the compute resource token. */
  crTokenFilename?: string;

  /** The IAM profile name associated with the compute resource token. */
  iamProfileName?: string;

  /** The IAM profile ID associated with the compute resource token. */
  iamProfileId?: string;
}

/**
 * The [[ContainerAuthenticator]] will read a compute resource token from the file system
 * and use this value to obtain a bearer token from the IAM token server.  When the bearer
 * token expires, a new token is obtained from the token server.
 *
 * The bearer token will be sent as an Authorization header in the form:
 *
 *      Authorization: Bearer <bearer-token>
 */
export class ContainerAuthenticator extends IamRequestBasedAuthenticator {
  protected tokenManager: ContainerTokenManager;

  private crTokenFilename: string;

  private iamProfileName: string;

  private iamProfileId: string;

  /**
   *
   * Create a new [[ContainerAuthenticator]] instance.
   *
   * @param {object} options Configuration options for IAM authentication.
   * @param {string} [options.crTokenFilename] The file containing the compute resource token.
   * @param {string} [options.iamProfileName] The IAM profile name associated with the compute resource token.
   * @param {string} [options.iamProfileId] The IAM profile ID associated with the compute resource token.
   * @param {boolean} [options.disableSslVerification] A flag that indicates
   *   whether verification of the token server's SSL certificate should be
   *   disabled or not
   * @param {string} [options.url] for HTTP token requests.
   * @param {object<string, string>} options.headers to be sent with every
   * @param {string} [options.clientId] The `clientId` and `clientSecret` fields are used to form a "basic"
   *   authorization header for IAM token requests.
   * @param {string} [options.clientSecret] The `clientId` and `clientSecret` fields are used to form a "basic"
   *   authorization header for IAM token requests.
   * @param {string} [options.scope] The "scope" parameter to use when fetching the bearer token from the
   *   IAM token server.
   * @throws {Error} When the configuration options are not valid.
   */
  constructor(options: Options) {
    super(options);

    // the param names are shared between the authenticator and the token
    // manager so we can just pass along the options object
    // the token manager will also handle the validation of required options
    this.tokenManager = new ContainerTokenManager(options);

    this.crTokenFilename = options.crTokenFilename;
    this.iamProfileName = options.iamProfileName;
    this.iamProfileId = options.iamProfileId;
  }

  /**
   * Setter for the filename of the compute resource token.
   * @param {string} scope A string containing a path to the CR token file
   */
  public setCrTokenFilename(crTokenFilename: string): void {
    this.crTokenFilename = crTokenFilename;

    // update properties in token manager
    this.tokenManager.setCrTokenFilename(crTokenFilename);
  }

  /**
   * Setter for the "profile_name" parameter to use when fetching the bearer token from the IAM token server.
   * @param {string} scope A string that makes up the iamProfileName parameter
   */
  public setIamProfileName(iamProfileName: string): void {
    this.iamProfileName = iamProfileName;

    // update properties in token manager
    this.tokenManager.setIamProfileName(iamProfileName);
  }

  /**
   * Setter for the "profile_id" parameter to use when fetching the bearer token from the IAM token server.
   * @param {string} scope A string that makes up the iamProfileId parameter
   */
  public setIamProfileId(iamProfileId: string): void {
    this.iamProfileId = iamProfileId;

    // update properties in token manager
    this.tokenManager.setIamProfileId(iamProfileId);
  }
}
