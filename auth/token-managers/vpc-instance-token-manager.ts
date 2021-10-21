/**
 * (C) Copyright IBM Corp. 2021.
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
import { atMostOne } from '../utils';
import { JwtTokenManager, JwtTokenManagerOptions } from './jwt-token-manager';

const DEFAULT_IMS_ENDPOINT = 'http://169.254.169.254';
const METADATA_SERVICE_VERSION = '2021-09-20';

/** Configuration options for CP4D token retrieval. */
interface Options extends JwtTokenManagerOptions {
  /** The CRN of the linked trusted IAM profile to be used as the identity of the compute resource */
  iamProfileCrn?: string;
  /** The ID of the linked trusted IAM profile to be used when obtaining the IAM access token */
  iamProfileId?: string;
}

// this interface is a representation of the response received from
// the VPC "create_access_token" and "create_iam_token" operations.
export interface VpcTokenResponse {
  access_token: string;
  created_at: string;
  expires_at: string;
  expires_in: number;
}

/**
 * Token Manager for VPC Instance Authentication.
 */
export class VpcInstanceTokenManager extends JwtTokenManager {
  private iamProfileCrn: string;

  private iamProfileId: string;

  /**
   * Create a new [[VpcInstanceTokenManager]] instance.
   *
   * @param {object} [options] Configuration options.
   * @param {string} [options.iamProfileCrn] The CRN of the linked trusted IAM profile to be used as the identity of the compute resource.
   *    At most one of iamProfileCrn or iamProfileId may be specified.
   *    If neither one is specified, then the default IAM profile defined for the compute resource will be used.
   * @param {string} [options.iamProfileId] The ID of the linked trusted IAM profile to be used when obtaining the IAM access token.
   *    At most one of iamProfileCrn or iamProfileId may be specified.
   *    If neither one is specified, then the default IAM profile defined for the compute resource will be used.
   * @param {string} [options.url] The VPC Instance Metadata Service's base endpoint URL. Default value: "http://169.254.169.254"
   * @constructor
   */
  constructor(options: Options) {
    // all parameters are optional
    options = options || ({} as Options);

    super(options);

    if (!atMostOne(options.iamProfileId, options.iamProfileCrn)) {
      throw new Error('At most one of `iamProfileId` or `iamProfileCrn` may be specified.');
    }

    this.url = options.url || DEFAULT_IMS_ENDPOINT;

    if (options.iamProfileCrn) {
      this.iamProfileCrn = options.iamProfileCrn;
    }
    if (options.iamProfileId) {
      this.iamProfileId = options.iamProfileId;
    }
  }

  /**
   * Setter for the "trusted_profile" parameter to use when fetching the bearer token from the IAM token server.
   * @param {string} iamProfileCrn A string that makes up the iamProfileCrn parameter
   */
  public setIamProfileCrn(iamProfileCrn: string): void {
    this.iamProfileCrn = iamProfileCrn;
  }

  /**
   * Setter for the "trusted_profile" parameter to use when fetching the bearer token from the IAM token server.
   * @param {string} iamProfileId A string that makes up the iamProfileId parameter
   */
  public setIamProfileId(iamProfileId: string): void {
    this.iamProfileId = iamProfileId;
  }

  protected async requestToken(): Promise<any> {
    const instanceIdentityToken: string = await this.getInstanceIdentityToken();

    const parameters = {
      options: {
        url: `${this.url}/instance_identity/v1/iam_token`,
        qs: {
          version: METADATA_SERVICE_VERSION,
        },
        body: {
          trusted_profile: this.iamProfileId || this.iamProfileCrn, // if neither are given, this will remain undefined
        },
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${instanceIdentityToken}`,
        },
      },
    };

    logger.debug(`Invoking VPC 'create_iam_token' operation: ${parameters.options.url}`);

    return this.requestWrapperInstance.sendRequest(parameters);
  }

  private async getInstanceIdentityToken(): Promise<string> {
    const parameters = {
      options: {
        url: `${this.url}/instance_identity/v1/token`,
        qs: {
          version: METADATA_SERVICE_VERSION,
        },
        body: {
          expires_in: 300,
        },
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Metadata-Flavor': 'ibm',
        },
      },
    };

    let token: string = null;
    try {
      logger.debug(`Invoking VPC 'create_access_token' operation: ${parameters.options.url}`);
      const response = await this.requestWrapperInstance.sendRequest(parameters);
      logger.debug(`Returned from VPC 'create_access_token' operation.`);

      const responseBody: VpcTokenResponse = response.result || {};
      token = responseBody.access_token;
    } catch (err) {
      logger.debug(`Caught exception from VPC 'create_access_token' operation: ${err.message}`);
      throw err;
    }

    return token;
  }
}
