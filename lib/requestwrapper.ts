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

import axios from 'axios';
import extend = require('extend');
import FormData = require('form-data');
import https = require('https');
import querystring = require('querystring');
import { PassThrough as readableStream } from 'stream';
import { buildRequestFileObject, getMissingParams, isEmptyObject, isFileData, isFileWithMetadata } from './helper';

const isBrowser = typeof window === 'object';
const globalTransactionId = 'x-global-transaction-id';

// Limit the type of axios configs to be customizable
const allowedAxiosConfig = ['transformRequest', 'transformResponse', 'paramsSerializer', 'paramsSerializer', 'timeout', 'withCredentials', 'adapter', 'responseType', 'responseEncoding', 'xsrfCookieName', 'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'maxContentLength', 'validateStatus', 'maxRedirects', 'socketPath', 'httpAgent', 'httpsAgent', 'proxy', 'cancelToken'];

export class RequestWrapper {
  private axiosInstance;

  constructor(axiosOptions?) {
    axiosOptions = axiosOptions || {};

    // override several axios defaults
    // axios sets the default Content-Type for `post`, `put`, and `patch` operations
    // to 'application/x-www-form-urlencoded'. This causes problems, so overriding the
    // defaults here
    const axiosConfig = {
      httpsAgent: new https.Agent({
        // disableSslVerification is the parameter we expose to the user,
        // it is the opposite of rejectUnauthorized
        rejectUnauthorized: !axiosOptions.disableSslVerification
      }),
      maxContentLength: Infinity,
      headers: {
        post: {
          'Content-Type':'application/json'
        },
        put: {
          'Content-Type':'application/json'
        },
        patch: {
          'Content-Type':'application/json'
        },
      }
    };

    // merge valid Axios Config into default.
    extend(true, axiosConfig, allowedAxiosConfig.reduce((reducedConfig, key) => {
      reducedConfig[key]=axiosOptions[key];
      return reducedConfig;
    }, {}));

    this.axiosInstance = axios.create(axiosConfig);

    // set debug interceptors
    if(process.env.NODE_DEBUG === 'axios') {
      this.axiosInstance.interceptors.request.use(config => {
        console.debug('Request:');
        try {
          console.debug(JSON.stringify(config, null, 2));
        } catch {
          console.debug(config)
        }

        return config;
      }, error => {
        console.debug('Error:');
        try {
          console.debug(JSON.stringify(error, null, 2));
        } catch {
          console.debug(error);
        }

        return Promise.reject(error);
      });

      this.axiosInstance.interceptors.response.use(response => {
        console.debug('Response:');
        try {
          console.debug(JSON.stringify(response, null, 2));
        } catch {
          console.debug(response)
        }

        return response;
      }, error => {
        console.debug('Error:');
        try {
          console.debug(JSON.stringify(error, null, 2));
        } catch {
          console.debug(error);
        }

        return Promise.reject(error);
      });
    }
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
  public sendRequest(parameters, _callback) {
    const options = extend(true, {}, parameters.defaultOptions, parameters.options);
    const { path, body, form, formData, qs, method, serviceUrl } = options;
    let { headers, url } = options;

    const multipartForm = new FormData();

    // Form params
    if (formData) {
      Object.keys(formData).forEach(key => {
        const values = Array.isArray(formData[key]) ? formData[key] : [formData[key]];
        // Skip keys with undefined/null values or empty object value
        values.filter(v => v != null && !isEmptyObject(v)).forEach(value => {

          // Special case of empty file object
          if (value.hasOwnProperty('contentType') && !value.hasOwnProperty('data')) {
            return;
          }

          if (isFileWithMetadata(value)) {
            const fileObj = buildRequestFileObject(value);
            multipartForm.append(key, fileObj.value, fileObj.options);
          } else {
            if (typeof value === 'object' && !isFileData(value)) {
              value = JSON.stringify(value);
            }
            multipartForm.append(key, value);
          }
        });
      });
    }

    // Path params
    url = parsePath(url, path);

    // Headers
    options.headers = extend({}, options.headers);

    // Convert array-valued query params to strings
    if (qs && Object.keys(qs).length > 0) {
      Object.keys(qs).forEach(
        key => Array.isArray(qs[key]) && (qs[key] = qs[key].join(','))
      );
    }

    // Add service default endpoint if options.url start with /
    if (url && url.charAt(0) === '/') {
      url = serviceUrl + url;
    }

    let data = body;

    if (form) {
      data = querystring.stringify(form);
      headers['Content-type'] = 'application/x-www-form-urlencoded';
    }

    if (formData) {
      data = multipartForm;
      // form-data generates headers that MUST be included or the request will fail
      headers = extend(true, {}, headers, multipartForm.getHeaders());
    }

    // TEMPORARY: Disabling gzipping due to bug in axios until fix is released:
    // https://github.com/axios/axios/pull/1129

    // accept gzip encoded responses if Accept-Encoding is not already set
    // headers['Accept-Encoding'] = headers['Accept-Encoding'] || 'gzip';

    const requestParams = {
      url,
      method,
      headers,
      params: qs,
      data,
      responseType: options.responseType || 'json',
      paramsSerializer: params => {
        return querystring.stringify(params);
      },
    };

    this.axiosInstance(requestParams)
      // placing `catch` block first because it is for catching request errors
      // if it is after the `then` block, it will also catch errors if they occur
      // inside of the `then` block
      .catch(error => {
        _callback(this.formatError(error));
      })
      .then(res => {
        // sometimes error responses will still trigger the `then` block - escape that behavior here
        if (!res) { return };

        // these objects contain circular json structures and are not always relevant to the user
        // if the user wants them, they can be accessed through the debug properties
        delete res.config;
        delete res.request;

        // the other sdks use the interface `result` for the body
        res.result = res.data;
        delete res.data;

        _callback(null, res);
      });
  }

  /**
   * Format error returned by axios
   * @param  {Function} cb the request callback
   * @private
   * @returns {request.RequestCallback}
   */
  public formatError(axiosError: any) {
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

      error.name = axiosError.statusText;
      error.code = axiosError.status;
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
        errorBody.warning = 'body contains circular reference';
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
      error.message = 'Response not received. Body of error is HTTP ClientRequest object';
      error.body = axiosError.request;

    } else {
      // Something happened in setting up the request that triggered an Error
      error.message = axiosError.message;
    }

    return error;
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
  const code = error.status;
  const body = error.data;

  // handle specific error from iam service, should be relevant across platforms
  const isIamServiceError = body.context &&
    body.context.url &&
    body.context.url.indexOf('iam') > -1;

  if (code === 401 || code === 403 || isIamServiceError) {
    isAuthErr = true;
  }

  return isAuthErr;
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

  if (Array.isArray(response.errors) && response.errors.length > 0 && hasStringProperty(response.errors[0], 'message')) {
    message = response.errors[0].message;
  } else if (hasStringProperty(response, 'error')) {
    message = response.error;
  } else if (hasStringProperty(response, 'message')) {
    message = response.message;
  } else if (hasStringProperty(response, 'errorMessage')) {
    message = response.errorMessage;
  }

  return message;
}
