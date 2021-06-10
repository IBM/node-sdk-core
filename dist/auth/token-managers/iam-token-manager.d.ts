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
import { JwtTokenManager, JwtTokenManagerOptions } from './jwt-token-manager';
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
export declare class IamTokenManager extends JwtTokenManager {
    protected requiredOptions: string[];
    protected refreshToken: string;
    private apikey;
    private clientId;
    private clientSecret;
    private scope;
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
     * @param {string} [url='https://iam.cloud.ibm.com'] The IAM endpoint for token requests.
     * @param {boolean} [options.disableSslVerification] A flag that indicates
     *   whether verification of the token server's SSL certificate should be
     *   disabled or not.
     * @param {object<string, string>} [options.headers] Headers to be sent with every
     *   outbound HTTP requests to token services.
     * @constructor
     */
    constructor(options: Options);
    /**
     * Set the IAM `scope` value.
     * This value is the form parameter to use when fetching the bearer token
     * from the IAM token server.
     *
     * @param {string} scope - A space seperated string that makes up the scope parameter.
     * @returns {void}
     */
    setScope(scope: string): void;
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
    setClientIdAndSecret(clientId: string, clientSecret: string): void;
    /**
     * Return the most recently stored refresh token.
     *
     * @public
     * @returns {string}
     */
    getRefreshToken(): string;
    /**
     * Extend this method from the parent class to extract the refresh token from
     * the request and save it.
     *
     * @param tokenResponse - Response object from JWT service request
     * @protected
     * @returns {void}
     */
    protected saveTokenInfo(tokenResponse: any): void;
    /**
     * Request an IAM token using an API key.
     *
     * @returns {Promise}
     */
    protected requestToken(): Promise<any>;
}
export {};
