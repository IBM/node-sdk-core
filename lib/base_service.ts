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
  url?: string;
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

    if (options.url) {
      _options.url = stripTrailingSlash(options.url);
    }

    // check url for common user errors
    const credentialProblems = checkCredentials(options, ['url']);
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
      { qs: {}, url: serviceClass.URL },
      options,
      this.readOptionsFromExternalConfig(),
      _options
    );

    this.requestWrapperInstance = new RequestWrapper(this.baseOptions);

    // set authenticator
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
   * Wrapper around `sendRequest` that enforces the request will be authenticated.
   *
   * @param {Object} parameters - service request options passed in by user
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
        results.url = url;
      }
      if (disableSsl === true) {
        results.disableSslVerification = disableSsl;
      }
    }

    return results;
  }
}
