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
/// <reference types="node" />
import { OutgoingHttpHeaders } from 'http';
import { JwtTokenManager } from '../token-managers';
import { Authenticator } from './authenticator';
import { AuthenticateOptions } from './authenticator-interface';
/** Configuration options for token-based authentication. */
export declare type BaseOptions = {
    /** Headers to be sent with every outbound HTTP requests to token services. */
    headers?: OutgoingHttpHeaders;
    /**
     * A flag that indicates whether verification of the token server's SSL
     * certificate should be disabled or not.
     */
    disableSslVerification?: boolean;
    /** Endpoint for HTTP token requests. */
    url?: string;
    /** Allow additional request config parameters */
    [propName: string]: any;
};
/**
 * Class for common functionality shared by token-request authenticators.
 * [[TokenRequestBasedAuthenticator]]s use token managers to retrieve, store,
 * and refresh tokens. Not intended to be used as stand-alone authenticator,
 * but as parent class to authenticators that have their own token manager
 * implementations.
 *
 * The tokens will be added as an Authorization headers in the form:
 *
 *      Authorization: Bearer <bearer-token>
 */
export declare class TokenRequestBasedAuthenticator extends Authenticator {
    protected tokenManager: JwtTokenManager;
    protected url: string;
    protected headers: OutgoingHttpHeaders;
    protected disableSslVerification: boolean;
    /**
     * Create a new [[TokenRequestBasedAuthenticator]] instance with an internal [[JwtTokenManager]].
     *
     * @param {object} options Configuration options.
     * @param {string} options.url for HTTP token requests.
     * @param {boolean} [options.disableSslVerification] A flag that indicates
     *   whether verification of the token server's SSL certificate should be
     *   disabled or not.
     * @param {object<string, string>} [options.headers] to be sent with every
     *   outbound HTTP requests to token services.
     */
    constructor(options: BaseOptions);
    /**
     * Set the flag that indicates whether verification of the server's SSL
     * certificate should be disabled or not.
     *
     * @param {boolean} value A flag that indicates whether verification of the
     *   token server's SSL certificate should be disabled or not.
     */
    setDisableSslVerification(value: boolean): void;
    /**
     * Set headers.
     *
     * @param {object<string, string>} headers Default headers to be sent with
     *   every Cloud Pak For Data token request. Overwrites previous default headers.
     */
    setHeaders(headers: OutgoingHttpHeaders): void;
    /**
     * Adds bearer token information to `request`. The bearer token information
     * will be set in the Authorization property of`request.headers` in the form:
     *
     *     Authorization: Bearer <bearer-token>
     *
     * @param {object} requestOptions - The request to augment with authentication
     *   information.
     * @param {object.<string, string>} requestOptions.headers - The headers the
     *   authentication information will be added too. Overrides default headers
     *   where there's conflict.
     */
    authenticate(requestOptions: AuthenticateOptions): Promise<void | Error>;
}
