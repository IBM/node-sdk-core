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
import { RequestWrapper } from './requestwrapper';

export interface UserOptions {
  url?: string; // deprecated
  serviceUrl?: string;
  version?: string;
  headers?: OutgoingHttpHeaders;
  disableSslVerification?: boolean;
  authenticator: AuthenticatorInterface;
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
   * @param {HeaderOptions} [options.headers]
   * @param {boolean} [options.headers.X-Watson-Learning-Opt-Out=false] - opt-out of data collection
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
      throw new Error(credentialProblems);
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
   * @param {Object} parameters - service request options passed in by user.
   * @param {string} parameters.options.method - the http method.
   * @param {string} parameters.options.url - the URL of the service.
   * @param {string} parameters.options.path - the path to be appended to the service URL.
   * @param {string} parameters.options.qs - the querystring to be included in the URL.
   * @param {string} parameters.options.body - the data to be sent as the request body.
   * @param {Object} parameters.options.form - an object containing the key/value pairs for a www-form-urlencoded request.
   * @param {Object} parameters.options.formData - an object containing the contents for a multipart/form-data request.
   * The following processing is performed on formData values:
   * - string: no special processing -- the value is sent as is
   * - object: the value is converted to a JSON string before insertion into the form body
   * - NodeJS.ReadableStream|Buffer|FileWithMetadata: sent as a file, with any associated metadata
   * - array: each element of the array is sent as a separate form part using any special processing as described above
   * @param {HeaderOptions} parameters.options.headers - additional headers to be passed on the request.
   * @param {Function} callback - callback function to pass the response back to
   * @returns {ReadableStream|undefined}
   */
  protected createRequest(parameters, callback) {
    this.authenticator.authenticate(parameters.defaultOptions, err => {
      err ? callback(err) : this.requestWrapperInstance.sendRequest(parameters, callback);
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
