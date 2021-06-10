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
import { IamTokenManager } from '../token-managers';
import { BaseOptions, TokenRequestBasedAuthenticator } from './token-request-based-authenticator';
/** Configuration options for IAM authentication. */
export interface Options extends BaseOptions {
    /** The IAM api key */
    apikey: string;
    /**
     * The `clientId` and `clientSecret` fields are used to form a "basic"
     * authorization header for IAM token requests.
     */
    clientId?: string;
    /**
     * The `clientId` and `clientSecret` fields are used to form a "basic"
     * authorization header for IAM token requests.
     */
    clientSecret?: string;
    /**
     * The "scope" parameter to use when fetching the bearer token from the IAM token server.
     */
    scope?: string;
}
/**
 * The [[IamAuthenticator]] will use the user-supplied `apikey`
 * values to obtain a bearer token from a token server.  When the bearer token
 * expires, a new token is obtained from the token server. If specified, the
 * optional, mutually inclusive `clientId` and`clientSecret` pair can be used to
 * influence rate-limiting for requests to the IAM token server.
 *
 * The bearer token will be sent as an Authorization header in the form:
 *
 *      Authorization: Bearer <bearer-token>
 */
export declare class IamAuthenticator extends TokenRequestBasedAuthenticator {
    protected requiredOptions: string[];
    protected tokenManager: IamTokenManager;
    private apikey;
    private clientId;
    private clientSecret;
    private scope;
    /**
     *
     * Create a new [[IamAuthenticator]] instance.
     *
     * @param {object} options Configuration options for IAM authentication.
     * @param {boolean} options.disableSslVerification A flag that indicates
     *   whether verification of the token server's SSL certificate should be
     *   disabled or not
     * @param {string} options.url for HTTP token requests.
     * @param {object<string, string>} options.headers to be sent with every
     * @param {string} options.apikey The IAM api key.
     * @param {string} [options.clientId] The `clientId` and `clientSecret` fields are used to form a "basic"
     *   authorization header for IAM token requests.
     * @param {string} [options.clientSecret] The `clientId` and `clientSecret` fields are used to form a "basic"
     *   authorization header for IAM token requests.
     * @param {string} [options.scope] The "scope" parameter to use when fetching the bearer token from the
     *   IAM token server.
     * @throws {Error} When the configuration options are not valid.
     */
    constructor(options: Options);
    /**
     * Setter for the mutually inclusive `clientId` and the `clientSecret`.
     * @param {string} clientId The `clientId` and `clientSecret` fields are used to form a "basic"
     *   authorization header for IAM token requests.
     * @param {string} clientSecret The `clientId` and `clientSecret` fields are used to form a "basic"
     *   authorization header for IAM token requests.
     */
    setClientIdAndSecret(clientId: string, clientSecret: string): void;
    /**
     * Setter for the "scope" parameter to use when fetching the bearer token from the IAM token server.
     * @param {string} scope A space seperated string that makes up the scope parameter
     */
    setScope(scope: string): void;
    /**
     * Return the most recently stored refresh token.
     *
     * @public
     * @returns {string}
     */
    getRefreshToken(): string;
}
