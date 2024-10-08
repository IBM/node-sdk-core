/**
 * (C) Copyright IBM Corp. 2024.
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
import { onlyOne, validateInput } from '../utils/helpers';
import { buildUserAgent } from '../../lib/build-user-agent';
import { IamRequestBasedTokenManager, IamRequestOptions } from './iam-request-based-token-manager';
import { IamTokenManager } from './iam-token-manager';

/** Configuration options for IAM Assume token retrieval. */
interface Options extends IamRequestOptions {
  apikey: string;
  iamProfileId?: string;
  iamProfileCrn?: string;
  iamProfileName?: string;
  iamAccountId?: string;
}

/**
 * The IamAssumeTokenManager takes an api key, along with trusted profile information, and performs
 * the necessary interactions with the IAM token service to obtain and store a suitable bearer token
 * that "assumes" the identify of the trusted profile.
 */
export class IamAssumeTokenManager extends IamRequestBasedTokenManager {
  protected requiredOptions = ['apikey'];

  private iamProfileId: string;

  private iamProfileCrn: string;

  private iamProfileName: string;

  private iamAccountId: string;

  private iamDelegate: IamTokenManager;

  /**
   *
   * Create a new IamAssumeTokenManager instance.
   *
   * @param options - Configuration options.
   * This should be an object containing these fields:
   * - apikey: (required) the IAM api key
   * - iamProfileId: (optional) the ID of the trusted profile to use
   * - iamProfileCrn: (optional) the CRN of the trusted profile to use
   * - iamProfileName: (optional) the name of the trusted profile to use (must be specified with iamAccountId)
   * - iamAccountId: (optional) the ID of the account the trusted profile is in (must be specified with iamProfileName)
   * - url: (optional) the endpoint URL for the IAM token service (default value: "https://iam.cloud.ibm.com")
   * - disableSslVerification: (optional) a flag that indicates whether verification of the token server's SSL certificate
   * should be disabled or not
   * - headers: (optional) a set of HTTP headers to be sent with each request to the token service
   * - clientId: (optional) the "clientId" and "clientSecret" fields are used to form a Basic
   * Authorization header to be included in each request to the token service
   * - clientSecret: (optional) the "clientId" and "clientSecret" fields are used to form a Basic
   * Authorization header to be included in each request to the token service
   * - scope: (optional) the "scope" parameter to use when fetching the bearer token from the token service
   *
   * @throws Error: the configuration options are not valid.
   */
  constructor(options: Options) {
    super(options);

    // This just verifies that the API key is provided and is free of common issues.
    validateInput(options, this.requiredOptions);

    // This validates the assume-specific fields.
    // Only one of the following three options may be specified.
    if (!onlyOne(options.iamProfileId, options.iamProfileCrn, options.iamProfileName)) {
      throw new Error(
        'Exactly one of `iamProfileName`, `iamProfileCrn`, or `iamProfileId` must be specified.'
      );
    }

    // `iamAccountId` may only be specified if `iamProfileName` is also specified.
    if (Boolean(options.iamProfileName) !== Boolean(options.iamAccountId)) {
      throw new Error(
        '`iamProfileName` and `iamAccountId` must be provided together, or not at all.'
      );
    }

    // Set class variables from options. If they are 'undefined' in options,
    // they won't be changed, as they are 'undefined' to begin with.
    this.iamProfileId = options.iamProfileId;
    this.iamProfileCrn = options.iamProfileCrn;
    this.iamProfileName = options.iamProfileName;
    this.iamAccountId = options.iamAccountId;
    this.iamDelegate = options.iamDelegate;

    // Create an instance of the IamTokenManager, which will be used to obtain
    // an IAM access token for use in the "assume" token exchange. Most option
    // names are shared between these token manager, and extraneous options will
    // be ignored, so we can pass the options structure to that constructor as-is.
    this.iamDelegate = new IamTokenManager(options);

    // These options are used by the delegate token manager
    // but they are not supported by this token manager.
    this.clientId = undefined;
    this.clientSecret = undefined;
    this.scope = undefined;

    // Set the grant type and user agent for this flavor of authentication.
    this.formData.grant_type = 'urn:ibm:params:oauth:grant-type:assume';
    this.userAgent = buildUserAgent('iam-assume-authenticator');
  }

  /**
   * Request an IAM token using a standard access token and a trusted profile.
   */
  protected async requestToken(): Promise<any> {
    // First, retrieve a standard IAM access token from the delegate and set it in the form data.
    this.formData.access_token = await this.iamDelegate.getToken();

    if (this.iamProfileCrn) {
      this.formData.profile_crn = this.iamProfileCrn;
    } else if (this.iamProfileId) {
      this.formData.profile_id = this.iamProfileId;
    } else {
      this.formData.profile_name = this.iamProfileName;
      this.formData.account = this.iamAccountId;
    }

    return super.requestToken();
  }

  /**
   * Extend this method from the parent class to erase the refresh token from
   * the class - we do not want to expose it for IAM Assume authentication.
   *
   * @param tokenResponse - the response object from JWT service request
   */
  protected saveTokenInfo(tokenResponse): void {
    super.saveTokenInfo(tokenResponse);
    this.refreshToken = undefined;
  }

  /**
   * This token manager doesn't save the refresh token but this method is still
   * exposed by the underlying class, so we override it here to log a warning.
   *
   * @returns the refresh token
   */
  public getRefreshToken(): string {
    logger.warn(
      'The IamAssumeTokenManager does not store the refresh token - it will be undefined.'
    );
    return super.getRefreshToken();
  }
}
