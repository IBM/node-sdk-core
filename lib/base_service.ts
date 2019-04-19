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
import semver = require('semver');
import vcapServices = require('vcap_services');
import { IamTokenManagerV1 } from '../iam-token-manager/v1';
import { stripTrailingSlash } from './helper';
import { readCredentialsFile } from './read-credentials-file';
import { sendRequest } from './requestwrapper';

// custom interfaces
export interface HeaderOptions {
  'X-Watson-Learning-Opt-Out'?: boolean;
  [key: string]: any;
}

export interface UserOptions {
  url?: string;
  version?: string;
  username?: string;
  password?: string;
  apikey?: string;
  use_unauthenticated?: boolean;
  headers?: HeaderOptions;
  token?: string;
  iam_access_token?: string;
  iam_apikey?: string;
  iam_url?: string;
  disable_ssl_verification?: boolean;
}

export interface BaseServiceOptions extends UserOptions {
  headers: HeaderOptions;
  url: string;
  qs: any;
  rejectUnauthorized?: boolean;
}

export interface Credentials {
  username?: string;
  password?: string;
  url?: string;
  iam_access_token?: string;
  iam_apikey?: string;
  iam_url?: string;
}

function hasCredentials(obj: any): boolean {
  return (
    obj &&
    ((obj.username && obj.password) ||
      obj.iam_access_token ||
      obj.iam_apikey)
  );
}

function isForICP(cred: string): boolean {
  return cred && cred.startsWith('icp-');
}

function hasBasicCredentials(obj: any): boolean {
  return obj && obj.username && obj.password && !usesBasicForIam(obj);
}

function hasIamCredentials(obj: any): boolean {
  return obj && (obj.iam_apikey || obj.iam_access_token) && !isForICP(obj.iam_apikey);
}

// returns true if the user provides basic auth creds with the intention
// of using IAM auth
function usesBasicForIam(obj: any): boolean {
  return obj.username === 'apikey' && !isForICP(obj.password);
}

// returns true if the string has a curly bracket or quote as the first or last character
// these are common user-issues that we should handle before they get a network error
function badCharAtAnEnd(value: string): boolean {
  return value.startsWith('{') || value.startsWith('"') || value.endsWith('}') || value.endsWith('"');
}

// checks credentials for common user mistakes of copying {, }, or " characters from the documentation
function checkCredentials(obj: any) {
  let errorMessage = '';
  const credsToCheck = ['url', 'username', 'password', 'iam_apikey'];
  credsToCheck.forEach(cred => {
    if (obj[cred] && badCharAtAnEnd(obj[cred])) {
      errorMessage += `The ${cred} shouldn't start or end with curly brackets or quotes. Be sure to remove any {, }, or "`;
    }
  });

  if (errorMessage.length) {
    errorMessage += 'Revise these credentials - they should not start or end with curly brackets or quotes.';
    return errorMessage;
  } else {
    return null;
  }
}

export class BaseService {
  static URL: string;
  name: string;
  serviceVersion: string;
  protected _options: BaseServiceOptions;
  protected serviceDefaults: object;
  protected tokenManager;

  /**
   * Internal base class that other services inherit from
   * @param {UserOptions} options
   * @param {string} [options.username] - required unless use_unauthenticated is set
   * @param {string} [options.password] - required unless use_unauthenticated is set
   * @param {boolean} [options.use_unauthenticated] - skip credential requirement
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
      // it might be better to just create a new instance and return that..
      // but that can't be done here, it has to be done in each individual service.
      // So this is still a good failsafe even in that case.
      throw new Error(
        'the "new" keyword is required to create Watson service instances'
      );
    }
    const options = extend({}, userOptions);
    const _options = this.initCredentials(options);
    if (options.url) {
      _options.url = stripTrailingSlash(options.url);
    }
    const serviceClass = this.constructor as typeof BaseService;
    this._options = extend(
      { qs: {}, url: serviceClass.URL },
      this.serviceDefaults,
      options,
      _options
    );
    if (hasIamCredentials(_options)) {
      this.tokenManager = new IamTokenManagerV1({
        iamApikey: _options.iam_apikey,
        iamAccessToken: _options.iam_access_token,
        iamUrl: _options.iam_url
      });
    } else if (usesBasicForIam(_options)) {
      this.tokenManager = new IamTokenManagerV1({
        iamApikey: _options.password,
        iamUrl: _options.iam_url
      });
    } else {
      this.tokenManager = null;
    }
    // rejectUnauthorized should only be false if disable_ssl_verification is true
    // used to disable ssl checking for icp
    this._options.rejectUnauthorized = !options.disable_ssl_verification;
  }

  /**
   * Retrieve this service's credentials - useful for passing to the authorization service
   *
   * Only returns a URL when token auth is used.
   *
   * @returns {Credentials}
   */
  public getServiceCredentials(): Credentials {
    const credentials = {} as Credentials;
    if (this._options.username) {
      credentials.username = this._options.username;
    }
    if (this._options.password) {
      credentials.password = this._options.password;
    }
    if (this._options.url) {
      credentials.url = this._options.url;
    }
    if (this._options.iam_access_token) {
      credentials.iam_access_token = this._options.iam_access_token;
    }
    if (this._options.iam_apikey) {
      credentials.iam_apikey = this._options.iam_apikey;
    }
    if (this._options.iam_url) {
      credentials.iam_url = this._options.iam_url;
    }
    return credentials;
  }

  /**
   * Set an IAM access token to use when authenticating with the service.
   * The access token should be valid and not yet expired.
   *
   * By using this method, you accept responsibility for managing the
   * access token yourself. You must set a new access token before this
   * one expires. Failing to do so will result in authentication errors
   * after this token expires.
   *
   * @param {string} iam_access_token - A valid, non-expired IAM access token
   * @returns {void}
   */
  public setAccessToken(iam_access_token: string) { // tslint:disable-line variable-name
    if (this.tokenManager) {
      this.tokenManager.setAccessToken(iam_access_token);
    } else {
      this.tokenManager = new IamTokenManagerV1({
        iamAccessToken: iam_access_token
      });
    }
  }

  /**
   * Guarantee that the next request you make will be IAM authenticated. This
   * performs any requests necessary to get a valid IAM token so that if your
   * next request involves a streaming operation, it will not be interrupted.
   *
   * @param {Function} callback - callback function to return flow of execution
   *
   * @returns {void}
   */
  protected preAuthenticate(callback): void {
     if (Boolean(this.tokenManager)) {
      return this.tokenManager.getToken((err, token) => {
        if (err) {
          callback(err);
        }
        callback(null);
      });
    } else {
      callback(null);
    }
  }

  /**
   * Wrapper around `sendRequest` that determines whether or not IAM tokens
   * are being used to authenticate the request. If so, the token is
   * retrieved by the token manager.
   *
   * @param {Object} parameters - service request options passed in by user
   * @param {Function} callback - callback function to pass the response back to
   * @returns {ReadableStream|undefined}
   */
  protected createRequest(parameters, callback) {
    if (Boolean(this.tokenManager)) {
      return this.tokenManager.getToken((err, accessToken) => {
        if (err) {
          return callback(err);
        }
        parameters.defaultOptions.headers.Authorization =
          `Bearer ${accessToken}`;
        return sendRequest(parameters, callback);
      });
    } else {
      return sendRequest(parameters, callback);
    }
  }

  /**
   * @private
   * @param {UserOptions} options
   * @returns {BaseServiceOptions}
   */
  private initCredentials(options: UserOptions): BaseServiceOptions {
    let _options: BaseServiceOptions = {} as BaseServiceOptions;
    if (options.token) {
      options.headers = options.headers || {};
      options.headers['X-Watson-Authorization-Token'] = options.token;
      _options = extend(_options, options);
      return _options;
    }
    // Get credentials from environment properties or Bluemix,
    // but prefer credentials provided programatically
    _options = extend(
      {},
      this.getCredentialsFromBluemix(this.name),
      this.getCredentialsFromEnvironment(process.env, this.name),
      this.getCredentialsFromEnvironment(readCredentialsFile(), this.name),
      options,
      _options
    );
    if (!_options.use_unauthenticated) {
      if (!hasCredentials(_options)) {
        const errorMessage = 'Insufficient credentials provided in ' +
          'constructor argument. Refer to the documentation for the ' +
          'required parameters. Common examples are username/password and ' +
          'iam_access_token.';
        throw new Error(errorMessage);
      }
      // handle iam_apikey containing an ICP api key
      if (isForICP(_options.iam_apikey)) {
        _options.username = 'apikey';
        _options.password = _options.iam_apikey;
        // remove apikey so code doesnt confuse credentials as iam
        delete _options.iam_apikey;
        delete options.iam_apikey;
      }

      if (!hasIamCredentials(_options) && !usesBasicForIam(_options)) {
        if (hasBasicCredentials(_options)) {
          // Calculate and add Authorization header to base options
          const encodedCredentials = Buffer.from(
            `${_options.username}:${_options.password}`
          ).toString('base64');
          const authHeader = { Authorization: `Basic ${encodedCredentials}` };
          _options.headers = extend(authHeader, _options.headers);
        }
      }
    }
    // check credentials for common user errors
    const credentialProblems = checkCredentials(_options);
    if (credentialProblems) {
      throw new Error(credentialProblems);
    }
    return _options;
  }
  /**
   * Pulls credentials from env properties
   *
   * Property checked is uppercase service.name suffixed by _USERNAME and _PASSWORD
   *
   * For example, if service.name is speech_to_text,
   * env properties are SPEECH_TO_TEXT_USERNAME and SPEECH_TO_TEXT_PASSWORD
   *
   * @private
   * @param {string} name - the service snake case name
   * @returns {Credentials}
   */
  private getCredentialsFromEnvironment(envObj: any, name: string): Credentials {
    if (name === 'watson_vision_combined') {
      return this.getCredentialsFromEnvironment(envObj, 'visual_recognition');
    }
    // Case handling for assistant - should look for assistant env variables before conversation
    if (name === 'conversation' && (envObj[`ASSISTANT_USERNAME`] ||  envObj[`ASSISTANT_IAM_APIKEY`])) {
       return this.getCredentialsFromEnvironment(envObj, 'assistant');
    }
    const _name: string = name.toUpperCase();
    // https://github.com/watson-developer-cloud/node-sdk/issues/605
    const nameWithUnderscore: string = _name.replace(/-/g, '_');
    const username: string = envObj[`${_name}_USERNAME`] || envObj[`${nameWithUnderscore}_USERNAME`];
    const password: string = envObj[`${_name}_PASSWORD`] || envObj[`${nameWithUnderscore}_PASSWORD`];
    const apiKey: string = envObj[`${_name}_API_KEY`] || envObj[`${nameWithUnderscore}_API_KEY`];
    const url: string = envObj[`${_name}_URL`] || envObj[`${nameWithUnderscore}_URL`];
    const iamAccessToken: string = envObj[`${_name}_IAM_ACCESS_TOKEN`] || envObj[`${nameWithUnderscore}_IAM_ACCESS_TOKEN`];
    const iamApiKey: string = envObj[`${_name}_IAM_APIKEY`] || envObj[`${nameWithUnderscore}_IAM_APIKEY`];
    const iamUrl: string = envObj[`${_name}_IAM_URL`] || envObj[`${nameWithUnderscore}_IAM_URL`];

    return {
      username,
      password,
      url,
      iam_access_token: iamAccessToken,
      iam_apikey: iamApiKey,
      iam_url: iamUrl
    };
  }
  /**
   * Pulls credentials from VCAP_SERVICES env property that bluemix sets
   * @param {string} vcap_services_name
   * @private
   * @returns {Credentials}
   */
  private getCredentialsFromBluemix(vcapServicesName: string): Credentials {
    let credentials: Credentials;
    let temp: any;
    if (this.name === 'visual_recognition') {
      temp = vcapServices.getCredentials('watson_vision_combined');
    } if (this.name === 'assistant') {
      temp = vcapServices.getCredentials('conversation');
    } else {
      temp = vcapServices.getCredentials(vcapServicesName);
    }
    // convert an iam apikey to use the identifier iam_apikey
    if (temp.apikey && temp.iam_apikey_name) {
      temp.iam_apikey = temp.apikey;
      delete temp.apikey;
    }
    credentials = temp;
    return credentials;
  }
}
