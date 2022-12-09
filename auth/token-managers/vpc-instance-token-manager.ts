/**
 * (C) Copyright IBM Corp. 2021, 2022.
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

/** Configuration options for VPC token retrieval. */
interface Options extends JwtTokenManagerOptions {
  /** The CRN of the linked trusted IAM profile to be used as the identity of the compute resource */
  iamProfileCrn?: string;
  /** The ID of the linked trusted IAM profile to be used when obtaining the IAM access token */
  iamProfileId?: string;
}

// this interface is a representation of the response received from
// the VPC "create_access_token" and "create_iam_token" operations.
interface VpcTokenResponse {
  access_token: string;
  created_at: string;
  expires_at: string;
  expires_in: number;
}

interface TrustedProfile {
  id?: string;
  crn?: string;
}

interface CreateIamTokenBody {
  trusted_profile?: TrustedProfile;
}

/**
 * Token Manager for VPC Instance Authentication.
 */
export class VpcInstanceTokenManager extends JwtTokenManager {
  private iamProfileCrn: string;

  private iamProfileId: string;

  /**
   * Create a new VpcInstanceTokenManager instance.
   *
   * @param options - Configuration options.
   * This should be an object containing these fields:
   * - url: (optional) the endpoint URL for the VPC Instance Metadata Service (default value: "http://169.254.169.254")
   * - iamProfileCrn: (optional) the CRN of the linked IAM trusted profile to be used to obtain the IAM access token
   * - iamProfileId: (optional) the ID of the linked IAM trusted profile to be used to obtain the IAM access token
   *
   * @remarks
   * At most one of "iamProfileCrn" or "iamProfileId" may be specified. If neither one is specified,
   * then the default IAM profile defined for the compute resource will be used.
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
   * Sets the CRN of the IAM trusted profile to use when fetching the access token from the IAM token server.
   * @param iamProfileCrn - the CRN of the IAM trusted profile
   */
  public setIamProfileCrn(iamProfileCrn: string): void {
    this.iamProfileCrn = iamProfileCrn;
  }

  /**
   * Sets the Id of the IAM trusted profile to use when fetching the access token from the IAM token server.
   * @param iamProfileId - the ID of the IAM trusted profile
   */
  public setIamProfileId(iamProfileId: string): void {
    this.iamProfileId = iamProfileId;
  }

  protected async requestToken(): Promise<any> {
    const instanceIdentityToken: string = await this.getInstanceIdentityToken();

    // construct request body
    let body: CreateIamTokenBody;
    if (this.iamProfileId) {
      body = {
        trusted_profile: { id: this.iamProfileId },
      };
    } else if (this.iamProfileCrn) {
      body = {
        trusted_profile: { crn: this.iamProfileCrn },
      };
    }

    const parameters = {
      options: {
        url: `${this.url}/instance_identity/v1/iam_token`,
        qs: {
          version: METADATA_SERVICE_VERSION,
        },
        body,
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
