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

import { Authenticator } from './authenticator';
import { VpcInstanceTokenManager } from '../token-managers';
import { BaseOptions, TokenRequestBasedAuthenticator } from './token-request-based-authenticator';

/** Configuration options for VpcInstance authentication. */
export interface Options extends BaseOptions {
  /** The CRN of the linked trusted IAM profile to be used as the identity of the compute resource */
  iamProfileCrn?: string;
  /** The ID of the linked trusted IAM profile to be used when obtaining the IAM access token */
  iamProfileId?: string;
}

/**
 * The [[VpcInstanceAuthenticator]] implements an authentication scheme in which it retrieves an "instance identity token"
 * and exchanges that for an IAM access token using the VPC Instance Metadata Service API which is available on the local
 * compute resource (VM). The instance identity token is similar to an IAM apikey, except that it is managed automatically
 * by the compute resource provider (VPC).
 *
 * The resulting IAM access token is then added to outbound requests in an Authorization header
 *
 *      Authorization: Bearer <access-token>
 */
export class VpcInstanceAuthenticator extends TokenRequestBasedAuthenticator {
  protected tokenManager: VpcInstanceTokenManager;

  private iamProfileCrn: string;

  private iamProfileId: string;

  /**
   * Create a new [[VpcInstanceAuthenticator]] instance.
   *
   * @param {object} [options] Configuration options for VpcInstance authentication.
   * @param {string} [options.iamProfileCrn] The CRN of the linked trusted IAM profile to be used as the identity of the compute resource.
   *    At most one of IAMProfileCRN or IAMProfileID may be specified.
   *    If neither one is specified, then the default IAM profile defined for the compute resource will be used.
   * @param {string} [options.iamProfileId] The ID of the linked trusted IAM profile to be used when obtaining the IAM access token.
   *    At most one of IAMProfileCRN or IAMProfileID may be specified.
   *    If neither one is specified, then the default IAM profile defined for the compute resource will be used.
   * @param {string} [options.url] The VPC Instance Metadata Service's base endpoint URL. Default value: "http://169.254.169.254"
   * @param {boolean} [options.disableSslVerification] A flag that indicates
   *    whether verification of the token server's SSL certificate should be
   *    disabled or not
   * @param {object<string, string>} [options.headers] to be sent with every.
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

    // the param names are shared between the authenticator and the token
    // manager so we can just pass along the options object.
    // also, the token manager will handle input validation
    this.tokenManager = new VpcInstanceTokenManager(options);
  }

  /**
   * Setter for the "profile_name" parameter to use when fetching the bearer token from the IAM token server.
   * @param {string} scope A string that makes up the iamProfileCrn parameter
   */
  public setIamProfileCrn(iamProfileCrn: string): void {
    this.iamProfileCrn = iamProfileCrn;

    // update properties in token manager
    this.tokenManager.setIamProfileCrn(iamProfileCrn);
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
