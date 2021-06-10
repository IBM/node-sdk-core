/**
 * Copyright 2014 IBM Corp. All Rights Reserved.
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
import { AuthenticatorInterface } from '../auth';
/**
 * Configuration values for a service.
 */
export interface UserOptions {
    /** The Authenticator object used to authenticate requests to the service */
    authenticator?: AuthenticatorInterface;
    /** The base url to use when contacting the service. The base url may differ between IBM Cloud regions. */
    serviceUrl?: string;
    /** Default headers that shall be included with every request to the service. */
    headers?: OutgoingHttpHeaders;
    /** The API version date to use with the service, in "YYYY-MM-DD" format. */
    version?: string;
    /** Set to `true` to allow unauthorized requests - not recommended for production use. */
    disableSslVerification?: boolean;
    /** Set your own cookie jar object */
    jar?: any;
    /** Deprecated. Use `serviceUrl` instead. */
    url?: string;
    /** Allow additional request config parameters */
    [propName: string]: any;
}
/**
 * Additional service configuration.
 */
export interface BaseServiceOptions extends UserOptions {
    /** Querystring to be sent with every request. If not a string will be stringified. */
    qs: any;
}
/**
 * Common functionality shared by generated service classes.
 *
 * The base service authenticates requests via its authenticator, and sends
 * them to the service endpoint.
 */
export declare class BaseService {
    static DEFAULT_SERVICE_URL: string;
    static DEFAULT_SERVICE_NAME: string;
    protected baseOptions: BaseServiceOptions;
    private authenticator;
    private requestWrapperInstance;
    /**
     * Configuration values for a service.
     * @param {Authenticator} userOptions.authenticator Object used to authenticate requests to the service.
     * @param {string} [userOptions.serviceUrl] The base url to use when contacting the service.
     *   The base url may differ between IBM Cloud regions.
     * @param {object<string, string>} [userOptions.headers] Default headers that shall be
     *   included with every request to the service.
     * @param {string} [userOptions.version] The API version date to use with the service,
     *   in "YYYY-MM-DD" format.
     * @param {boolean} [userOptions.disableSslVerification] A flag that indicates
     *   whether verification of the token server's SSL certificate should be
     *   disabled or not.
     */
    constructor(userOptions: UserOptions);
    /**
     * Get the instance of the authenticator set on the service.
     *
     * @returns {Authenticator}
     */
    getAuthenticator(): any;
    /**
     * Set the service URL to send requests to.
     *
     * @param {string} url The base URL for the service.
     */
    setServiceUrl(url: string): void;
    /**
     * Turn request body compression on or off.
     *
     * @param {boolean} setting Will turn it on if 'true', off if 'false'.
     */
    setEnableGzipCompression(setting: boolean): void;
    /**
     * Configure the service using external configuration
     *
     * @param {string} serviceName The name of the service. Will be used to read from external
     * configuration.
     */
    protected configureService(serviceName: string): void;
    /**
     * Wrapper around `sendRequest` that enforces the request will be authenticated.
     *
     * @param {object} parameters Service request options passed in by user.
     * @param {string} parameters.options.method The http method.
     * @param {string} parameters.options.url The path portion of the URL to be appended to the serviceUrl.
     * @param {object} [parameters.options.path] The path parameters to be inserted into the URL.
     * @param {object} [parameters.options.qs] The querystring to be included in the URL.
     * @param {object} [parameters.options.body] The data to be sent as the request body.
     * @param {object} [parameters.options.form] An object containing the key/value pairs for a www-form-urlencoded request.
     * @param {object} [parameters.options.formData] An object containing the contents for a multipart/form-data request
     * The following processing is performed on formData values:
     * - string: no special processing -- the value is sent as is
     * - object: the value is converted to a JSON string before insertion into the form body
     * - NodeJS.ReadableStream|Buffer|FileWithMetadata: sent as a file, with any associated metadata
     * - array: each element of the array is sent as a separate form part using any special processing as described above
     * @param {object} parameters.defaultOptions
     * @param {string} parameters.defaultOptions.serviceUrl The base URL of the service.
     * @param {OutgoingHttpHeaders} parameters.defaultOptions.headers Additional headers to be passed on the request.
     * @returns {Promise<any>}
     */
    protected createRequest(parameters: any): Promise<any>;
    private readOptionsFromExternalConfig;
}
