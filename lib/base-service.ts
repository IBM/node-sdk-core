/**
 * (C) Copyright IBM Corp. 2014, 2024.
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

import extend from 'extend';
import type { CookieJar } from 'tough-cookie';
import { OutgoingHttpHeaders } from 'http';
import { AuthenticatorInterface, checkCredentials, readExternalSources } from '../auth';
import { stripTrailingSlash } from './helper';
import logger from './logger';
import { RequestWrapper, RetryOptions } from './request-wrapper';
import { buildUserAgent } from './build-user-agent';

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
  jar?: CookieJar | boolean;
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
  qs?: any;
  enableRetries?: boolean;
  maxRetries?: number;
  retryInterval?: number;
}

/**
 * Common functionality shared by generated service classes.
 *
 * The base service authenticates requests via its authenticator, and sends
 * them to the service endpoint.
 */
export class BaseService {
  static DEFAULT_SERVICE_URL: string;

  static DEFAULT_SERVICE_NAME: string;

  protected baseOptions: BaseServiceOptions;

  private authenticator: AuthenticatorInterface;

  private requestWrapperInstance: RequestWrapper;

  private defaultUserAgent;

  /**
   * Configuration values for a service.
   *
   * @param userOptions - the configuration options to set on the service instance.
   * This should be an object with the following fields:
   * - authenticator: (required) an Object used to authenticate requests to the service.
   * - serviceUrl: (optional) the base url to use when contacting the service.
   *   The base url may differ between IBM Cloud regions.
   * - headers: (optional) a set of HTTP headers that should be included with every request sent to the service
   * - disableSslVerification: (optional) a flag that indicates whether verification of the server's SSL certificate should be
   *   disabled or not.
   */
  constructor(userOptions: UserOptions) {
    if (!(this instanceof BaseService)) {
      const err = 'the "new" keyword is required to create service instances';
      logger.error(`Error creating an instance of BaseService: ${err}`);
      throw new Error(err);
    }

    const baseServiceOptions = {} as BaseServiceOptions;
    const options = { ...userOptions };

    // for compatibility
    if (options.url && !options.serviceUrl) {
      options.serviceUrl = options.url;
    }

    if (options.serviceUrl) {
      baseServiceOptions.serviceUrl = stripTrailingSlash(options.serviceUrl);
    }

    // check serviceUrl for common user errors
    const credentialProblems = checkCredentials(options, ['serviceUrl']);
    if (credentialProblems) {
      logger.error(credentialProblems.message);
      throw credentialProblems;
    }

    // if disableSslVerification is not explicity set to the boolean value `true`,
    // force it to be false
    if (options.disableSslVerification !== true) {
      options.disableSslVerification = false;
    }

    const serviceClass = this.constructor as typeof BaseService;
    this.baseOptions = {
      qs: {},
      serviceUrl: serviceClass.DEFAULT_SERVICE_URL,
      ...options,
      ...baseServiceOptions,
    };

    this.requestWrapperInstance = new RequestWrapper(this.baseOptions);

    // enforce that an authenticator is set
    if (!options.authenticator) {
      throw new Error('Authenticator must be set.');
    }

    this.authenticator = options.authenticator;

    this.defaultUserAgent = buildUserAgent();
  }

  /**
   * Get the instance of the authenticator set on the service.
   *
   * @returns the Authenticator instance
   */
  public getAuthenticator(): any {
    return this.authenticator;
  }

  /**
   * Set the service URL to send requests to.
   *
   * @param url - the base URL for the service.
   */
  public setServiceUrl(url: string): void {
    if (url) {
      this.baseOptions.serviceUrl = stripTrailingSlash(url);
    }
  }

  /**
   * Set the HTTP headers to be sent in every request.
   *
   * @param headers - the map of headers to include in requests.
   */
  public setDefaultHeaders(headers: OutgoingHttpHeaders): void {
    if (typeof headers !== 'object') {
      // do nothing, for now
      return;
    }

    this.baseOptions.headers = headers;
  }

  /**
   * Turn request body compression on or off.
   *
   * @param setting - Will turn it on if 'true', off if 'false'.
   */
  public setEnableGzipCompression(setting: boolean): void {
    this.requestWrapperInstance.setCompressRequestData(setting);

    // persist setting so that baseOptions accurately reflects the state of the flag
    this.baseOptions.enableGzipCompression = setting;
  }

  /**
   * Get the Axios instance set on the service.
   * All requests will be made using this instance.
   */
  public getHttpClient() {
    return this.requestWrapperInstance.getHttpClient();
  }

  /**
   * Enable retries for unfulfilled requests.
   *
   * @param retryOptions - the configuration for retries
   */
  public enableRetries(retryOptions?: RetryOptions): void {
    this.requestWrapperInstance.enableRetries(retryOptions);
  }

  /**
   * Disables retries.
   */
  public disableRetries(): void {
    this.requestWrapperInstance.disableRetries();
  }

  /**
   * Applies a given modifier function on a model object.
   * Since the model object can be a map, or an array, or a model,
   * these types needs different handling.
   * Considering whether the input object is a map happens with an explicit parameter.
   * @param input - the input model object
   * @param converterFn - the function that is applied on the input object
   * @param isMap - is `true` when the input object should be handled as a map
   */
  public static convertModel(input, converterFn, isMap?: boolean) {
    if (input == null || typeof input === 'string') {
      // no need for conversation
      return input;
    }
    if (Array.isArray(input)) {
      return BaseService.convertArray(input, converterFn, isMap);
    } else if (isMap === true) {
      return BaseService.convertMap(input, converterFn);
    }
    return converterFn(input);
  }

  /**
   * Configure the service using external configuration
   *
   * @param serviceName - the name of the service. This will be used to read from external
   * configuration.
   */
  protected configureService(serviceName: string): void {
    if (!serviceName) {
      const err = 'Error configuring service. Service name is required.';
      logger.error(err);
      throw new Error(err);
    }

    Object.assign(this.baseOptions, this.readOptionsFromExternalConfig(serviceName));
    // overwrite the requestWrapperInstance with the new base options if applicable
    this.requestWrapperInstance = new RequestWrapper(this.baseOptions);
  }

  /**
   * Wrapper around `sendRequest` that enforces the request will be authenticated.
   *
   * @param parameters - Service request options passed in by user.
   * This should be an object with the following fields:
   * - options.method: the http method
   * - options.url: the path portion of the URL to be appended to the serviceUrl
   * - options.path: the path parameters to be inserted into the URL
   * - options.qs: the querystring to be included in the URL
   * - options.body: the data to be sent as the request body
   * - options.form: an object containing the key/value pairs for a www-form-urlencoded request.
   * - options.formData: an object containing the contents for a multipart/form-data request
   *   The following processing is performed on formData values:
   *     - string: no special processing -- the value is sent as is
   *     - object: the value is converted to a JSON string before insertion into the form body
   *     - NodeJS.ReadableStream|Buffer|FileWithMetadata: sent as a file, with any associated metadata
   *     - array: each element of the array is sent as a separate form part using any special processing as described above
   * - defaultOptions.serviceUrl: the base URL of the service
   * - defaultOptions.headers: additional HTTP headers to be sent with the request
   * @returns a Promise
   */
  protected createRequest(parameters): Promise<any> {
    // validate serviceUrl parameter has been set
    const serviceUrl = parameters.defaultOptions && parameters.defaultOptions.serviceUrl;
    if (!serviceUrl || typeof serviceUrl !== 'string') {
      return Promise.reject(new Error('The service URL is required'));
    }

    // make sure the outbound request contains a User-Agent header
    const userAgent = {
      'User-Agent': this.defaultUserAgent,
    };
    parameters.defaultOptions.headers = extend(
      true,
      {},
      userAgent,
      parameters.defaultOptions.headers
    );

    return this.authenticator.authenticate(parameters.defaultOptions).then(() =>
      // resolve() handles rejection as well, so resolving the result of sendRequest should allow for proper handling later
      this.requestWrapperInstance.sendRequest(parameters)
    );
  }

  /**
   * Wrapper around `createRequest` that enforces arrived response to be deserialized.
   * @param parameters - see `parameters` in `createRequest`
   * @param deserializerFn - the deserializer function that is applied on the response object
   * @param isMap - is `true` when the response object should be handled as a map
   * @returns a Promise
   */
  protected createRequestAndDeserializeResponse(
    parameters: any,
    deserializerFn: (any) => any,
    isMap?: boolean
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.createRequest(parameters)
        .then((r) => {
          if (r !== undefined && r.result !== undefined) {
            r.result = BaseService.convertModel(r.result, deserializerFn, isMap);
          }
          resolve(r);
        })
        .catch((err) => reject(err));
    });
  }

  // eslint-disable-next-line class-methods-use-this
  private readOptionsFromExternalConfig(serviceName: string): BaseServiceOptions {
    const results: BaseServiceOptions = {};
    const properties = readExternalSources(serviceName);

    if (properties !== null) {
      // the user can define the following client-level variables in the credentials file:
      // - url
      // - disableSsl
      // - enableGzip

      const { url, disableSsl, enableGzip, enableRetries, maxRetries, retryInterval } = properties;

      if (url) {
        results.serviceUrl = stripTrailingSlash(url);
      }
      if (disableSsl === true) {
        results.disableSslVerification = disableSsl;
      }
      if (enableGzip === true) {
        results.enableGzipCompression = enableGzip;
      }
      if (enableRetries !== undefined) {
        results.enableRetries = enableRetries;
      }
      if (maxRetries !== undefined) {
        results.maxRetries = maxRetries;
      }
      if (retryInterval !== undefined) {
        results.retryInterval = retryInterval;
      }
    }

    return results;
  }

  private static convertArray(arrayInput, converterFn, isMap) {
    const serializedList = [];
    arrayInput.forEach((element) => {
      serializedList.push(this.convertModel(element, converterFn, isMap));
    });
    return serializedList;
  }

  private static convertMap(mapInput, converterFn) {
    const serializedMap = {};
    Object.keys(mapInput).forEach((key) => {
      serializedMap[key] = BaseService.convertModel(mapInput[key], converterFn);
    });
    return serializedMap;
  }
}
