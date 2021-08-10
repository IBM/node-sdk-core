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

import logger from '../../lib/logger';
import { atLeastOne, readCrTokenFile } from '../utils';
import { IamRequestBasedTokenManager, IamRequestOptions } from './iam-request-based-token-manager';

const DEFAULT_CR_TOKEN_FILEPATH = '/var/run/secrets/tokens/vault-token';

/** Configuration options for IAM token retrieval. */
interface Options extends IamRequestOptions {
  crTokenFilename?: string;
  iamProfileName?: string;
  iamProfileId?: string;
}

/**
 * The ContainerTokenManager retrieves a compute resource token from a file on the container. This token
 * is used to perform the necessary interactions with the IAM token service to obtain and store a suitable
 * bearer (access) token.
 */
export class ContainerTokenManager extends IamRequestBasedTokenManager {
  private crTokenFilename: string;

  private iamProfileName: string;

  private iamProfileId: string;

  /**
   *
   * Create a new [[ContainerTokenManager]] instance.
   *
   * @param {object} options Configuration options.
   * @param {string} [crTokenFilename='/var/run/secrets/tokens/vault-token'] The file containing the compute resource token.
   * @param {string} [iamProfileName] The IAM profile name associated with the compute resource token.
   * @param {string} [iamProfileId] The IAM profile ID associated with the compute resource token.
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
    // all parameters are optional
    options = options || ({} as Options);

    super(options);

    if (!atLeastOne(options.iamProfileId, options.iamProfileName)) {
      throw new Error('At least one of `iamProfileName` or `iamProfileId` must be specified.');
    }

    this.crTokenFilename = options.crTokenFilename || DEFAULT_CR_TOKEN_FILEPATH;

    if (options.iamProfileName) {
      this.iamProfileName = options.iamProfileName;
    }
    if (options.iamProfileId) {
      this.iamProfileId = options.iamProfileId;
    }

    // construct form data for the cr token use case of iam token management
    this.formData.grant_type = 'urn:ibm:params:oauth:grant-type:cr-token';
  }

  /**
   * Setter for the filename of the compute resource token.
   * @param {string} crTokenFilename A string containing a path to the CR token file
   */
  public setCrTokenFilename(crTokenFilename: string): void {
    this.crTokenFilename = crTokenFilename;
  }

  /**
   * Setter for the "profile_name" parameter to use when fetching the bearer token from the IAM token server.
   * @param {string} iamProfileName A string that makes up the iamProfileName parameter
   */
  public setIamProfileName(iamProfileName: string): void {
    this.iamProfileName = iamProfileName;
  }

  /**
   * Setter for the "profile_id" parameter to use when fetching the bearer token from the IAM token server.
   * @param {string} iamProfileId A string that makes up the iamProfileId parameter
   */
  public setIamProfileId(iamProfileId: string): void {
    this.iamProfileId = iamProfileId;
  }

  /**
   * Request an IAM token using a compute resource token.
   *
   * @returns {Promise}
   */
  protected async requestToken(): Promise<any> {
    const crToken = getCrToken(this.crTokenFilename);
    this.formData.cr_token = crToken;

    // these member variables can be reset, set them in the form data right
    // before making the request to ensure they're up to date
    if (this.iamProfileName) {
      this.formData.profile_name = this.iamProfileName;
    }
    if (this.iamProfileId) {
      this.formData.profile_id = this.iamProfileId;
    }

    return super.requestToken();
  }
}

function getCrToken(filename: string): string {
  logger.debug(`Attempting to read CR token from file: ${filename}`);

  // moving the actual read to another file to isolate usage of node-only packages like `fs`
  return readCrTokenFile(filename);
}
