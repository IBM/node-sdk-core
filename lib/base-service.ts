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


import extend = require('extend');
import { OutgoingHttpHeaders } from 'http';
import semver = require('semver');
import vcapServices = require('vcap_services');
import { AuthenticatorInterface, checkCredentials, readExternalSources } from '../auth';
import { stripTrailingSlash } from './helper';
import { RequestWrapper } from './request-wrapper';

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
  /** Deprecated. Use `serviceUrl` instead. */
  url?: string;
  /** Allow additional request config parameters */
  [propName: string]: any;
}

export interface BaseServiceOptions extends UserOptions {
  qs: any;
}

export class BaseService {
  static URL: string;
  name: string;
  serviceVersion: string;
  protected baseOptions: BaseServiceOptions;
  private authenticator: AuthenticatorInterface;
  private requestWrapperInstance;

  /**
   * Internal base class that other services inherit from
   * @param {UserOptions} options
   * @param {OutgoingHttpHeaders} [options.headers]
   * @param {string} [options.url] - override default service base url
   * @private
   * @abstract
   * @constructor
   * @throws {Error}
   * @returns {BaseService}
   */
  constructor(userOptions: UserOptions) {
    if (!(this instanceof BaseService)) {
      throw new Error(
        'the "new" keyword is required to create service instances'
      );
    }

    const _options = {} as BaseServiceOptions;
    const options = extend({}, userOptions);

    // for compatibility
    if (options.url && !options.serviceUrl) {
      options.serviceUrl = options.url;
    }

    if (options.serviceUrl) {
      _options.serviceUrl = stripTrailingSlash(options.serviceUrl);
    }

    // check serviceUrl for common user errors
    const credentialProblems = checkCredentials(options, ['serviceUrl']);
    if (credentialProblems) {
      throw credentialProblems;
    }

    // if disableSslVerification is not explicity set to the boolean value `true`,
    // force it to be false
    if (options.disableSslVerification !== true) {
      options.disableSslVerification = false;
    }

    const serviceClass = this.constructor as typeof BaseService;
    this.baseOptions = extend(
      { qs: {}, serviceUrl: serviceClass.URL },
      options,
      this.readOptionsFromExternalConfig(),
      _options
    );

    this.requestWrapperInstance = new RequestWrapper(this.baseOptions);

    // enforce that an authenticator is set
    if (!options.authenticator) {
      throw new Error('Authenticator must be set.');
    }

    this.authenticator = options.authenticator;
  }

  /**
   * Get the instance of the authenticator set on the service.
   *
   * @returns {Authenticator}
   */
  public getAuthenticator(): any {
    return this.authenticator;
  }

  /**
   * Set the service URL to send requests to.
   *
   * @param {string} the base URL for the service
   */
  public setServiceUrl(url: string): void {
    this.baseOptions.serviceUrl = url;
  }

  /**
   * Wrapper around `sendRequest` that enforces the request will be authenticated.
   *
   * @param {object} parameters - service request options passed in by user
   * @param {string} parameters.options.method - the http method
   * @param {string} parameters.options.url - the path portion of the URL to be appended to the serviceUr
   * @param {object} [parameters.options.path] - the path parameters to be inserted into the URL
   * @param {object} [parameters.options.qs] - the querystring to be included in the URL
   * @param {object} [parameters.options.body] - the data to be sent as the request body
   * @param {object} [parameters.options.form] - an object containing the key/value pairs for a www-form-urlencoded request
   * @param {object} [parameters.options.formData] - an object containing the contents for a multipart/form-data request
   * The following processing is performed on formData values:
   * - string: no special processing -- the value is sent as is
   * - object: the value is converted to a JSON string before insertion into the form body
   * - NodeJS.ReadableStream|Buffer|FileWithMetadata: sent as a file, with any associated metadata
   * - array: each element of the array is sent as a separate form part using any special processing as described above
   * @param {object} parameters.defaultOptions
   * @param {string} parameters.defaultOptions.serviceUrl - the base URL of the service
   * @param {OutgoingHttpHeaders} parameters.defaultOptions.headers - additional headers to be passed on the request
   * @returns {Promise<any>}
   */
  protected createRequest(parameters): Promise<any> {
    // validate serviceUrl parameter has been set
    const serviceUrl = parameters.defaultOptions && parameters.defaultOptions.serviceUrl;
    if (!serviceUrl || typeof serviceUrl !== 'string') {
      return Promise.reject(new Error('The service URL is required'));
    }

    return this.authenticator.authenticate(parameters.defaultOptions).then(() => {
      // resolve() handles rejection as well, so resolving the result of sendRequest should allow for proper handling later
      return this.requestWrapperInstance.sendRequest(parameters);
    });
  }

  private readOptionsFromExternalConfig() {
    const results = {} as any;
    const properties = readExternalSources(this.name);

    if (properties !== null) {
      // the user can define two client-level variables in the credentials file: url and disableSsl
      const { url, disableSsl } = properties;

      if (url) {
        results.serviceUrl = url;
      }
      if (disableSsl === true) {
        results.disableSslVerification = disableSsl;
      }
    }

    return results;
  }
}
