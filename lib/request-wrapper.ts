/* eslint-disable class-methods-use-this */

/**
 * (C) Copyright IBM Corp. 2014, 2021.
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

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as rax from 'retry-axios';

import axiosCookieJarSupport from 'axios-cookiejar-support';
import extend from 'extend';
import FormData from 'form-data';
import { OutgoingHttpHeaders } from 'http';
import { Agent } from 'https';
import isStream from 'isstream';
import { stringify } from 'querystring';
import { gzipSync } from 'zlib';
import {
  buildRequestFileObject,
  isEmptyObject,
  isFileData,
  isFileWithMetadata,
  stripTrailingSlash,
} from './helper';
import logger from './logger';
import { streamToPromise } from './stream-to-promise';

/**
 * Retry configuration options.
 */
export interface RetryOptions {
  /**
   * Maximum retries to attempt.
   */
  maxRetries?: number;

  /**
   * Ceiling for the retry delay (in seconds) - delay will not exceed this value.
   */
  maxRetryInterval?: number;
}

export class RequestWrapper {
  private axiosInstance: AxiosInstance;

  private compressRequestData: boolean;

  private retryInterceptorId: number;

  private raxConfig: rax.RetryConfig;

  constructor(axiosOptions?) {
    axiosOptions = axiosOptions || {};
    this.compressRequestData = Boolean(axiosOptions.enableGzipCompression);

    // override a couple axios defaults
    const axiosConfig: AxiosRequestConfig = {
      maxContentLength: -1,
      maxBodyLength: Infinity,
    };

    // merge axios config into default
    extend(true, axiosConfig, axiosOptions);

    // if the user explicitly sets `disableSslVerification` to true,
    // `rejectUnauthorized` must be set to false in the https agent
    if (axiosOptions.disableSslVerification === true) {
      // the user may have already provided a custom agent. if so, update it
      if (axiosConfig.httpsAgent) {
        // check for presence of `options` field for "type safety"
        if (axiosConfig.httpsAgent.options) {
          axiosConfig.httpsAgent.options.rejectUnauthorized = false;
        }
      } else {
        // if no agent is present, create a new one
        axiosConfig.httpsAgent = new Agent({
          rejectUnauthorized: false,
        });
      }
    }

    this.axiosInstance = axios.create(axiosConfig);

    // axios sets the default Content-Type for `post`, `put`, and `patch` operations
    // to 'application/x-www-form-urlencoded'. This causes problems, so overriding the
    // defaults here
    ['post', 'put', 'patch'].forEach((op) => {
      this.axiosInstance.defaults.headers[op]['Content-Type'] = 'application/json';
    });

    // if a cookie jar is provided, wrap the axios instance and update defaults
    if (axiosOptions.jar) {
      axiosCookieJarSupport(this.axiosInstance);

      this.axiosInstance.defaults.withCredentials = true;
      this.axiosInstance.defaults.jar = axiosOptions.jar;
    }

    // get retry config properties and conditionally enable retries
    if (axiosOptions.enableRetries) {
      const retryOptions: RetryOptions = {};
      if (axiosOptions.maxRetries !== undefined) {
        retryOptions.maxRetries = axiosOptions.maxRetries;
      }
      if (axiosOptions.retryInterval !== undefined) {
        retryOptions.maxRetryInterval = axiosOptions.retryInterval;
      }
      this.enableRetries(retryOptions);
    }

    // set debug interceptors
    if (process.env.NODE_DEBUG === 'axios' || process.env.DEBUG) {
      this.axiosInstance.interceptors.request.use(
        (config) => {
          logger.debug('Request:');
          logger.debug(config);
          return config;
        },
        (error) => {
          logger.error('Error: ');
          logger.error(error);
          return Promise.reject(error);
        }
      );

      this.axiosInstance.interceptors.response.use(
        (response) => {
          logger.debug('Response:');
          logger.debug(response);
          return response;
        },
        (error) => {
          logger.error('Error: ');
          logger.error(error);
          return Promise.reject(error);
        }
      );
    }
  }

  public setCompressRequestData(setting: boolean) {
    this.compressRequestData = setting;
  }

  /**
   * Creates the request.
   * 1. Merge default options with user provided options
   * 2. Checks for missing parameters
   * 3. Encode path and query parameters
   * 4. Call the api
   * @private
   * @returns {ReadableStream|undefined}
   * @throws {Error}
   */
  public async sendRequest(parameters): Promise<any> {
    const options = extend(true, {}, parameters.defaultOptions, parameters.options);
    const { path, body, form, formData, qs, method, serviceUrl } = options;
    let { headers, url } = options;

    const multipartForm = new FormData();

    // Form params
    if (formData) {
      for (const key of Object.keys(formData)) { // eslint-disable-line
        let values = Array.isArray(formData[key]) ? formData[key] : [formData[key]];
        // Skip keys with undefined/null values or empty object value
        values = values.filter((v) => v != null && !isEmptyObject(v));

        for (let value of values) { // eslint-disable-line
          // Ignore special case of empty file object
          if (
            !Object.prototype.hasOwnProperty.call(value, 'contentType') ||
            Object.prototype.hasOwnProperty.call(value, 'data')
          ) {
            if (isFileWithMetadata(value)) {
              const fileObj = await buildRequestFileObject(value); // eslint-disable-line
              multipartForm.append(key, fileObj.value, fileObj.options);
            } else {
              if (typeof value === 'object' && !isFileData(value)) {
                value = JSON.stringify(value);
              }
              multipartForm.append(key, value);
            }
          }
        }
      }
    }

    // Path params
    url = parsePath(url, path);

    // Headers
    options.headers = { ...options.headers };

    // Convert array-valued query params to strings
    if (qs && Object.keys(qs).length > 0) {
      Object.keys(qs).forEach((key) => {
        if (Array.isArray(qs[key])) {
          qs[key] = qs[key].join(',');
        }
      });
    }

    // Add service default endpoint if options.url start with /
    if (url && url.charAt(0) === '/') {
      url = stripTrailingSlash(serviceUrl) + url;
    }

    url = stripTrailingSlash(url);

    let data = body;

    if (form) {
      data = stringify(form);
      headers['Content-type'] = 'application/x-www-form-urlencoded';
    }

    if (formData) {
      data = multipartForm;
      // form-data generates headers that MUST be included or the request will fail
      headers = extend(true, {}, headers, multipartForm.getHeaders());
    }

    // accept gzip encoded responses if Accept-Encoding is not already set
    headers['Accept-Encoding'] = headers['Accept-Encoding'] || 'gzip';

    // compress request body data if enabled
    if (this.compressRequestData) {
      data = await this.gzipRequestBody(data, headers);
    }

    const requestParams = {
      url,
      method,
      headers,
      params: qs,
      data,
      raxConfig: this.raxConfig,
      responseType: options.responseType || 'json',
      paramsSerializer: (params) => stringify(params),
    };

    return this.axiosInstance(requestParams).then(
      (res) => {
        // sometimes error responses will still trigger the `then` block - escape that behavior here
        if (!res) {
          return undefined;
        }

        // these objects contain circular json structures and are not always relevant to the user
        // if the user wants them, they can be accessed through the debug properties
        delete res.config;
        delete res.request;

        // the other sdks use the interface `result` for the body
        // eslint-disable-next-line @typescript-eslint/dot-notation
        res['result'] = res.data;
        delete res.data;

        // return another promise that resolves with 'res' to be handled in generated code
        return res;
      },
      (err) => {
        // return another promise that rejects with 'err' to be handled in generated code
        throw this.formatError(err);
      }
    );
  }

  /**
   * Format error returned by axios
   * @param  {object} the object returned by axios via rejection
   * @private
   * @returns {Error}
   */
  public formatError(axiosError: any): Error {
    // return an actual error object,
    // but make it flexible so we can add properties like 'body'
    const error: any = new Error();

    // axios specific handling
    // this branch is for an error received from the service
    if (axiosError.response) {
      axiosError = axiosError.response;
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      delete axiosError.config;
      delete axiosError.request;

      error.statusText = axiosError.statusText;
      error.name = axiosError.statusText; // ** deprecated **

      error.status = axiosError.status;
      error.code = axiosError.status; // ** deprecated **

      error.message = parseServiceErrorMessage(axiosError.data) || axiosError.statusText;

      // some services bury the useful error message within 'data'
      // adding it to the error under the key 'body' as a string or object
      let errorBody;
      try {
        // try/catch to handle objects with circular references
        errorBody = JSON.stringify(axiosError.data);
      } catch (e) {
        // ignore the error, use the object, and tack on a warning
        errorBody = axiosError.data;
        errorBody.warning = 'Body contains circular reference';
        logger.error(`Failed to stringify axiosError: ${e}`);
      }

      error.body = errorBody;

      // attach headers to error object
      error.headers = axiosError.headers;

      // print a more descriptive error message for auth issues
      if (isAuthenticationError(axiosError)) {
        error.message = 'Access is denied due to invalid credentials.';
      }
    } else if (axiosError.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      error.message = axiosError.message;
      error.statusText = axiosError.code;
      error.body = 'Response not received - no connection was made to the service.';

      // when a request to a private cloud instance has an ssl problem, it never connects and follows this branch of the error handling
      if (isSelfSignedCertificateError(axiosError)) {
        error.message =
          `The connection failed because the SSL certificate is not valid. ` +
          `To use a self-signed certificate, set the \`disableSslVerification\` parameter in the constructor options.`;
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      error.message = axiosError.message;
    }

    return error;
  }

  public getHttpClient() {
    return this.axiosInstance;
  }

  private static getRaxConfig(
    axiosInstance: AxiosInstance,
    retryOptions?: RetryOptions
  ): rax.RetryConfig {
    const config: rax.RetryConfig = {
      retry: 4, // 4 retries by default
      retryDelay: 1000, // 1000 ms (1 sec) initial delay
      httpMethodsToRetry: ['GET', 'HEAD', 'OPTIONS', 'DELETE', 'PUT', 'POST'],
      // do not retry on 501
      statusCodesToRetry: [
        [429, 429],
        [500, 500],
        [502, 599],
      ],
      instance: axiosInstance,
      backoffType: 'exponential',
      checkRetryAfter: true, // use Retry-After header first
      maxRetryDelay: 30 * 1000, // default to 30 sec max delay
    };

    if (retryOptions) {
      if (typeof retryOptions.maxRetries === 'number') {
        config.retry = retryOptions.maxRetries;
      }
      if (typeof retryOptions.maxRetryInterval === 'number') {
        // convert seconds to ms for retry-axios
        config.maxRetryDelay = retryOptions.maxRetryInterval * 1000;
      }
    }

    return config;
  }

  public enableRetries(retryOptions?: RetryOptions): void {
    // avoid attaching the same interceptor multiple times
    // to protect against user error and ensure disableRetries() always disables retries
    if (typeof this.retryInterceptorId === 'number') {
      this.disableRetries();
    }
    this.raxConfig = RequestWrapper.getRaxConfig(this.axiosInstance, retryOptions);
    this.retryInterceptorId = rax.attach(this.axiosInstance);
  }

  public disableRetries(): void {
    if (typeof this.retryInterceptorId === 'number') {
      rax.detach(this.retryInterceptorId, this.axiosInstance);
      delete this.retryInterceptorId;
      delete this.raxConfig;
    }
  }

  private async gzipRequestBody(data: any, headers: OutgoingHttpHeaders): Promise<Buffer | any> {
    // skip compression if user has set the encoding header to gzip
    const contentSetToGzip =
      headers['Content-Encoding'] && headers['Content-Encoding'].toString().includes('gzip');

    if (!data || contentSetToGzip) {
      return data;
    }

    let reqBuffer: Buffer;

    try {
      if (isStream(data)) {
        const streamData = await streamToPromise(data);
        reqBuffer = Buffer.isBuffer(streamData) ? streamData : Buffer.from(streamData);
      } else if (Buffer.isBuffer(data)) {
        reqBuffer = data;
      } else if (data.toString && data.toString() !== '[object Object]' && !Array.isArray(data)) {
        // this handles pretty much any primitive that isnt a JSON object or array
        reqBuffer = Buffer.from(data.toString());
      } else {
        reqBuffer = Buffer.from(JSON.stringify(data));
      }
    } catch (err) {
      logger.error('Error converting request body to a buffer - data will not be compressed.');
      logger.debug(err);
      return data;
    }

    try {
      data = gzipSync(reqBuffer);

      // update the headers by reference - only if the data was actually compressed
      headers['Content-Encoding'] = 'gzip';
    } catch (err) {
      // if an exception is caught, `data` will still be in its original form
      // we can just proceed with the request uncompressed
      logger.error('Error compressing request body - data will not be compressed.');
      logger.debug(err);
    }

    return data;
  }
}

/**
 * @private
 * @param {string} path
 * @param {Object} params
 * @returns {string}
 */
function parsePath(path: string, params: Object): string {
  if (!path || !params) {
    return path;
  }
  return Object.keys(params).reduce((parsedPath, param) => {
    const value = encodeURIComponent(params[param]);
    return parsedPath.replace(new RegExp(`{${param}}`), value);
  }, path);
}

/**
 * Determine if the error is due to bad credentials
 * @private
 * @param {Object} error - error object returned from axios
 * @returns {boolean} true if error is due to authentication
 */
function isAuthenticationError(error: any): boolean {
  let isAuthErr = false;
  const code: number = error.status || null;
  const body: any = error.data || {};

  // handle specific error from iam service, should be relevant across platforms
  const isIamServiceError: boolean =
    body.context && body.context.url && body.context.url.indexOf('iam') > -1;

  if (code === 401 || code === 403 || isIamServiceError) {
    isAuthErr = true;
  }

  return isAuthErr;
}

/**
 * Determine if the error is due to a bad self signed certificate
 * @private
 * @param {Object} error - error object returned from axios
 * @returns {boolean} true if error is due to an SSL error
 */
function isSelfSignedCertificateError(error: any): boolean {
  let result = false;

  const sslCode = 'DEPTH_ZERO_SELF_SIGNED_CERT';
  const sslMessage = 'self signed certificate';

  const hasSslCode = error.code === sslCode;
  const hasSslMessage = hasStringProperty(error, 'message') && error.message.includes(sslMessage);

  if (hasSslCode || hasSslMessage) {
    result = true;
  }

  return result;
}

/**
 * Return true if object has a specified property that is a string
 * @private
 * @param {Object} obj - object to look for property in
 * @param {string} property - name of the property to look for
 * @returns {boolean} true if property exists and is string
 */
function hasStringProperty(obj: any, property: string): boolean {
  return Boolean(obj[property] && typeof obj[property] === 'string');
}

/**
 * Look for service error message in common places, by priority
 * first look in `errors[0].message`, then in `error`, then in
 * `message`, then in `errorMessage`
 * @private
 * @param {Object} response - error response body received from service
 * @returns {string | undefined} the error message if is was found, undefined otherwise
 */
function parseServiceErrorMessage(response: any): string | undefined {
  let message;

  if (
    Array.isArray(response.errors) &&
    response.errors.length > 0 &&
    hasStringProperty(response.errors[0], 'message')
  ) {
    message = response.errors[0].message;
  } else if (hasStringProperty(response, 'error')) {
    message = response.error;
  } else if (hasStringProperty(response, 'message')) {
    message = response.message;
  } else if (hasStringProperty(response, 'errorMessage')) {
    message = response.errorMessage;
  }

  logger.info(`Parsing service error message: ${message}`);
  return message;
}
