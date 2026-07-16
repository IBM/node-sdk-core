/**
 * (C) Copyright IBM Corp. 2021, 2024.
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
import { atMostOne, getCurrentTime } from '../utils/helpers';
import { buildUserAgent } from '../../lib/build-user-agent';
import { JwtTokenManager, JwtTokenManagerOptions } from './jwt-token-manager';

const DEFAULT_IMS_ENDPOINT = 'http://169.254.169.254';
const METADATA_SERVICE_VERSION = '2022-03-01';
const METADATA_SERVICE_VERSION2 = '2025-08-26';
const IAM_EXPIRATION_WINDOW = 10;
const METADATA_TOKEN_LIFETIME = 300;
const DEFAULT_OPERATION_PATH_CREATE_ACCESS_TOKEN = '/instance_identity/v1/token';
const DEFAULT_OPERATION_PATH_CREATE_IAM_TOKEN = '/instance_identity/v1/iam_token';
const DEFAULT_OPERATION_PATH_CREATE_ACCESS_TOKEN2 = '/identity/v1/token';
const DEFAULT_OPERATION_PATH_CREATE_IAM_TOKEN2 = '/identity/v1/iam_tokens';
const metadataServiceSupportedVersions = [METADATA_SERVICE_VERSION, METADATA_SERVICE_VERSION2];

/** Configuration options for VPC token retrieval. */
interface Options extends JwtTokenManagerOptions {
  /** The CRN of the linked trusted IAM profile to be used as the identity of the compute resource */
  iamProfileCrn?: string;
  /** The ID of the linked trusted IAM profile to be used when obtaining the IAM access token */
  iamProfileId?: string;
  /** The name of the linked trusted IAM profile to be used when obtaining the IAM access token */
  iamProfileName?: string;
  /** The version of the Instance Metadata Service to be used obtaining tokens */
  serviceVersion?: string;
  /** The lifetime of the Instance Identity Token */
  tokenLifetime?: number;
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
  name?: string;
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

  private iamProfileName: string;

  private serviceVersion: string;

  private tokenLifetime: number;

  /**
   * Create a new VpcInstanceTokenManager instance.
   *
   * @param options - Configuration options.
   * This should be an object containing these fields:
   * - url: (optional) the endpoint URL for the VPC Instance Metadata Service (default value: "http://169.254.169.254")
   * - iamProfileCrn: (optional) the CRN of the linked IAM trusted profile to be used to obtain the IAM access token
   * - iamProfileId: (optional) the ID of the linked IAM trusted profile to be used to obtain the IAM access token
   * - iamProfileName: (optional) the name of the linked IAM trusted profile to be used to obtain the IAM access token
   *
   * @remarks
   * At most one of "iamProfileCrn", "iamProfileId" or "iamProfileName" may be specified. If neither one is specified,
   * then the default IAM profile defined for the compute resource will be used.
   */
  constructor(options: Options) {
    // all parameters are optional
    options = options || ({} as Options);

    super(options);

    if (!atMostOne(options.iamProfileId, options.iamProfileCrn, options.iamProfileName)) {
      throw new Error(
        'At most one of `iamProfileId`, `iamProfileCrn` or `iamProfileName` may be specified.'
      );
    }

    this.url = options.url || DEFAULT_IMS_ENDPOINT;

    // Validate and set serviceVersion
    const serviceVersion = options.serviceVersion || METADATA_SERVICE_VERSION;
    if (!metadataServiceSupportedVersions.includes(serviceVersion)) {
      throw new Error(
        `Invalid serviceVersion. Must be one of: ${metadataServiceSupportedVersions.join(', ')}`
      );
    }
    this.serviceVersion = serviceVersion;

    // Validate and set tokenLifetime
    const tokenLifetime = options.tokenLifetime || METADATA_TOKEN_LIFETIME;
    if (typeof tokenLifetime !== 'number' || tokenLifetime < 0) {
      throw new Error('tokenLifetime must be a non-negative number');
    }
    this.tokenLifetime = tokenLifetime;

    if (options.iamProfileCrn) {
      this.iamProfileCrn = options.iamProfileCrn;
    }
    if (options.iamProfileId) {
      this.iamProfileId = options.iamProfileId;
    }
    if (options.iamProfileName) {
      this.iamProfileName = options.iamProfileName;
    }

    this.userAgent = buildUserAgent('vpc-instance-authenticator');
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

  /**
   * Sets the name of the IAM trusted profile to use when fetching access token from the IAM token server.
   * @param iamProfileName - the name of the IAM trusted profile
   */
  public setIamProfileName(iamProfileName: string): void {
    this.iamProfileName = iamProfileName;
  }

  public setServiceVersion(serviceVersion: string): void {
    if (!metadataServiceSupportedVersions.includes(serviceVersion)) {
      throw new Error(
        `Invalid serviceVersion. Must be one of: ${metadataServiceSupportedVersions.join(', ')}`
      );
    }
    this.serviceVersion = serviceVersion;
  }

  public setTokenLifetime(tokenLifetime: number): void {
    if (typeof tokenLifetime !== 'number' || tokenLifetime < 0) {
      throw new Error('tokenLifetime must be a non-negative number');
    }
    this.tokenLifetime = tokenLifetime;
  }

  protected getAccessTokenPath(): string {
    if (this.serviceVersion === METADATA_SERVICE_VERSION2) {
      return DEFAULT_OPERATION_PATH_CREATE_ACCESS_TOKEN2;
    }
    return DEFAULT_OPERATION_PATH_CREATE_ACCESS_TOKEN;
  }

  protected getIamTokenPath(): string {
    if (this.serviceVersion === METADATA_SERVICE_VERSION2) {
      return DEFAULT_OPERATION_PATH_CREATE_IAM_TOKEN2;
    }
    return DEFAULT_OPERATION_PATH_CREATE_IAM_TOKEN;
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
    } else if (this.iamProfileName) {
      body = {
        trusted_profile: { name: this.iamProfileName },
      };
    }

    const parameters = {
      options: {
        url: `${this.url}${this.getIamTokenPath()}`,
        qs: {
          version: this.serviceVersion,
        },
        body,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': this.userAgent,
          Accept: 'application/json',
          Authorization: `Bearer ${instanceIdentityToken}`,
          'Metadata-Flavor': 'ibm',
        },
      },
    };

    logger.debug(`Invoking VPC 'create_iam_token' operation: ${parameters.options.url}`);
    return this.requestWrapperInstance.sendRequest(parameters).then((response) => {
      logger.debug(`Returned from VPC 'create_iam_token' operation`);
      return response;
    });
  }

  private async getInstanceIdentityToken(): Promise<string> {
    const parameters = {
      options: {
        url: `${this.url}${this.getAccessTokenPath()}`,
        qs: {
          version: this.serviceVersion,
        },
        body: {
          expires_in: this.tokenLifetime,
        },
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': this.userAgent,
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

  /**
   * Returns true iff the currently-cached IAM access token is expired.
   * We'll consider an access token as expired when we reach its IAM server-reported
   * expiration time minus our expiration window (10 secs).
   * We do this to avoid using an access token that might expire in the middle of a long-running
   * transaction within an IBM Cloud service.
   *
   * @returns true if the token has expired, false otherwise
   */
  protected isTokenExpired(): boolean {
    const { expireTime } = this;

    if (!expireTime) {
      return true;
    }

    const currentTime = getCurrentTime();
    return currentTime >= expireTime - IAM_EXPIRATION_WINDOW;
  }
}
