/**
 * (C) Copyright IBM Corp. 2021, 2023.
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

import { Authenticator } from './authenticator';
import { VpcInstanceTokenManager } from '../token-managers/vpc-instance-token-manager';
import { BaseOptions, TokenRequestBasedAuthenticator } from './token-request-based-authenticator';

/** Configuration options for VpcInstance authentication. */
export interface Options extends BaseOptions {
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

/**
 * The VpcInstanceAuthenticator implements an authentication scheme in which it retrieves an "instance identity token"
 * and exchanges that for an IAM access token using the VPC Instance Metadata Service API which is available on the local
 * compute resource (VM). The instance identity token is similar to an IAM apikey, except that it is managed automatically
 * by the compute resource provider (VPC).
 *
 * The resulting IAM access token is then added to outbound requests in an Authorization header
 *
 *      Authorization: Bearer \<access-token\>
 */
export class VpcInstanceAuthenticator extends TokenRequestBasedAuthenticator {
  protected tokenManager: VpcInstanceTokenManager;

  private iamProfileCrn: string;

  private iamProfileId: string;

  private iamProfileName: string;

  private serviceVersion: string;

  private tokenLifetime: number;

  /**
   * Create a new VpcInstanceAuthenticator instance.
   *
   * @param options - Configuration options for VpcInstance authentication.
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

    if (options.iamProfileCrn) {
      this.iamProfileCrn = options.iamProfileCrn;
    }
    if (options.iamProfileId) {
      this.iamProfileId = options.iamProfileId;
    }
    if (options.iamProfileName) {
      this.iamProfileName = options.iamProfileName;
    }
    if (options.serviceVersion) {
      this.serviceVersion = options.serviceVersion;
    }
    if (options.tokenLifetime) {
      this.tokenLifetime = options.tokenLifetime;
    }

    // the param names are shared between the authenticator and the token
    // manager so we can just pass along the options object.
    // also, the token manager will handle input validation
    this.tokenManager = new VpcInstanceTokenManager(options);
  }

  /**
   * Sets the "iamProfileCrn" value to be used when obtaining an IAM access token
   * @param iamProfileCrn - the CRN of the linked IAM trusted profile to use when obtaining an IAM access token
   */
  public setIamProfileCrn(iamProfileCrn: string): void {
    this.iamProfileCrn = iamProfileCrn;

    // update properties in token manager
    this.tokenManager.setIamProfileCrn(iamProfileCrn);
  }

  /**
   * Sets the "iamProfileId" value to be used when obtaining an IAM access token
   * @param iamProfileId - the ID of the linked IAM trusted profile to use when obtaining an IAM access token
   */
  public setIamProfileId(iamProfileId: string): void {
    this.iamProfileId = iamProfileId;

    // update properties in token manager
    this.tokenManager.setIamProfileId(iamProfileId);
  }

  /**
   * Sets the "iamProfileName" value to be used when obtaining an IAM access token
   * @param iamProfileName - the name of the linked IAM trusted profile to use when obtaining an IAM access token
   */
  public setIamProfileName(iamProfileName: string): void {
    this.iamProfileName = iamProfileName;

    // update properties in token manager
    this.tokenManager.setIamProfileName(iamProfileName);
  }

  public setServiceVersion(serviceVersion: string): void {
    this.serviceVersion = serviceVersion;

    this.tokenManager.setServiceVersion(serviceVersion);
  }

  public setTokenLifetime(tokenLifetime: number): void {
    this.tokenLifetime = tokenLifetime;

    this.tokenManager.setTokenLifetime(tokenLifetime);
  }

  /**
   * Returns the authenticator's type ('vpc').
   *
   * @returns a string that indicates the authenticator's type
   */
  // eslint-disable-next-line class-methods-use-this
  public authenticationType(): string {
    return Authenticator.AUTHTYPE_VPC;
  }
}
