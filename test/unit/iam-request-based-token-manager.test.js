/* eslint-disable no-alert, no-console */

/**
 * Copyright 2021 IBM Corp. All Rights Reserved.
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

jest.mock('../../dist/lib/request-wrapper');
const { RequestWrapper } = require('../../dist/lib/request-wrapper');
const logger = require('../../dist/lib/logger').default;

const { IamRequestBasedTokenManager } = require('../../dist/auth');

// constant mock values
const URL = 'some-url.com';
const SCOPE = 'some-scope';
const CLIENT_ID = 'some-id';
const CLIENT_SECRET = 'some-secret';
const CLIENT_ID_SECRET_WARNING =
  'Warning: Client ID and Secret must BOTH be given, or the header will not be included.';

// a function to pull the arguments out of the `sendRequest` mock
// and verify the structure looks like it is supposed to
function getRequestOptions(sendRequestMock) {
  const sendRequestArgs = sendRequestMock.mock.calls[0][0];
  expect(sendRequestArgs).toBeDefined();
  expect(sendRequestArgs.options).toBeDefined();

  return sendRequestArgs.options;
}

describe('IAM Request Based Token Manager', () => {
  // set up mocks
  jest.spyOn(logger, 'warn').mockImplementation(() => {});

  const sendRequestMock = jest.fn();
  RequestWrapper.mockImplementation(() => ({
    sendRequest: sendRequestMock,
  }));

  beforeEach(() => {
    logger.warn.mockClear();
    sendRequestMock.mockReset();
  });

  afterAll(() => {
    logger.warn.mockRestore();
    sendRequestMock.mockRestore();
  });

  describe('constructor', () => {
    it('should use the default url if none is given', () => {
      const instance = new IamRequestBasedTokenManager();
      expect(instance.url).toBe('https://iam.cloud.ibm.com');
    });

    it('should accept a URL from the user if given', () => {
      const instance = new IamRequestBasedTokenManager({ url: URL });
      expect(instance.url).toBe(URL);
    });

    it('should remove the operation path from a user-given URL', () => {
      const instance = new IamRequestBasedTokenManager({ url: `${URL}/identity/token` });
      expect(instance.url).toBe(URL);
    });

    it('should initialize empty form data object', () => {
      const instance = new IamRequestBasedTokenManager();
      expect(instance.formData).toBeDefined();
      expect(instance.formData).toStrictEqual({});
    });

    it('should set scope if given', () => {
      const instance = new IamRequestBasedTokenManager({ scope: SCOPE });
      expect(instance.scope).toBe(SCOPE);
    });

    it('should set the client id and secret if given', () => {
      const instance = new IamRequestBasedTokenManager({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
      });
      expect(instance.clientId).toBe(CLIENT_ID);
      expect(instance.clientSecret).toBe(CLIENT_SECRET);
    });

    it('should invoke logger if client id is given, and client secret is not', () => {
      const instance = new IamRequestBasedTokenManager({
        clientId: CLIENT_ID,
      });
      expect(instance.clientId).toBe(CLIENT_ID);
      expect(instance.clientSecret).toBeUndefined();

      // verify warning was triggered
      expect(logger.warn).toHaveBeenCalled();
      expect(logger.warn.mock.calls[0][0]).toBe(CLIENT_ID_SECRET_WARNING);
    });

    it('should invoke logger if client secret is given, and client id is not', () => {
      const instance = new IamRequestBasedTokenManager({
        clientSecret: CLIENT_SECRET,
      });
      expect(instance.clientId).toBeUndefined();
      expect(instance.clientSecret).toBe(CLIENT_SECRET);

      // verify warning was triggered
      expect(logger.warn).toHaveBeenCalled();
      expect(logger.warn.mock.calls[0][0]).toBe(CLIENT_ID_SECRET_WARNING);
    });
  });

  describe('setters', () => {
    it('should set scope with the setter', () => {
      const instance = new IamRequestBasedTokenManager();
      expect(instance.scope).toBeUndefined();

      instance.setScope(SCOPE);
      expect(instance.scope).toBe(SCOPE);
    });

    it('should set client id and secret with the setter', () => {
      const instance = new IamRequestBasedTokenManager();
      expect(instance.clientId).toBeUndefined();
      expect(instance.clientSecret).toBeUndefined();

      instance.setClientIdAndSecret(CLIENT_ID, CLIENT_SECRET);
      expect(instance.clientId).toBe(CLIENT_ID);
      expect(instance.clientSecret).toBe(CLIENT_SECRET);
    });

    it('should invoke logger if client id/secret setter is only called with id', () => {
      const instance = new IamRequestBasedTokenManager();
      expect(instance.clientId).toBeUndefined();
      expect(instance.clientSecret).toBeUndefined();

      instance.setClientIdAndSecret(CLIENT_ID);
      expect(instance.clientId).toBe(CLIENT_ID);
      expect(instance.clientSecret).toBeUndefined();

      // verify warning was triggered
      expect(logger.warn).toHaveBeenCalled();
      expect(logger.warn.mock.calls[0][0]).toBe(CLIENT_ID_SECRET_WARNING);
    });

    it('should invoke logger if client id/secret setter is only called with secret', () => {
      const instance = new IamRequestBasedTokenManager();
      expect(instance.clientId).toBeUndefined();
      expect(instance.clientSecret).toBeUndefined();

      instance.setClientIdAndSecret(null, CLIENT_SECRET);
      expect(instance.clientId).toBeNull();
      expect(instance.clientSecret).toBe(CLIENT_SECRET);

      // verify warning was triggered
      expect(logger.warn).toHaveBeenCalled();
      expect(logger.warn.mock.calls[0][0]).toBe(CLIENT_ID_SECRET_WARNING);
    });
  });

  describe('request token', () => {
    it('should set required headers by default', async () => {
      const instance = new IamRequestBasedTokenManager();

      await instance.requestToken();

      const requestOptions = getRequestOptions(sendRequestMock);
      expect(requestOptions.headers).toBeDefined();
      expect(requestOptions.headers['Content-type']).toBe('application/x-www-form-urlencoded');
    });

    // add custom headers if set
    it('should set custom headers if given', async () => {
      const instance = new IamRequestBasedTokenManager({
        headers: {
          'My-Header': 'some-value',
        },
      });

      await instance.requestToken();

      const requestOptions = getRequestOptions(sendRequestMock);
      expect(requestOptions.headers).toBeDefined();
      expect(requestOptions.headers['Content-type']).toBeDefined(); // verify default headers aren't overwritten
      expect(requestOptions.headers['My-Header']).toBe('some-value');
    });

    // set correct auth header if included
    it('should set authorization header if client id and secret are given', async () => {
      const instance = new IamRequestBasedTokenManager({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
      });

      await instance.requestToken();

      const requestOptions = getRequestOptions(sendRequestMock);
      expect(requestOptions.headers).toBeDefined();
      expect(requestOptions.headers.Authorization).toBeDefined();
      expect(requestOptions.headers.Authorization).toBe('Basic c29tZS1pZDpzb21lLXNlY3JldA==');
    });

    // dont include auth header if not set
    it('should not set authorization header if client id and secret are not given', async () => {
      const instance = new IamRequestBasedTokenManager();

      await instance.requestToken();

      const requestOptions = getRequestOptions(sendRequestMock);
      expect(requestOptions.headers).toBeDefined();
      expect(requestOptions.headers.Authorization).toBeUndefined();
    });

    // set scope in form data if it's there
    it('should set scope in the form data if it is present', async () => {
      const instance = new IamRequestBasedTokenManager({ scope: SCOPE });

      await instance.requestToken();

      const requestOptions = getRequestOptions(sendRequestMock);
      expect(requestOptions.form).toBeDefined();
      expect(requestOptions.form.scope).toBeDefined();
      expect(requestOptions.form.scope).toBe(SCOPE);
    });

    // there should be no scope if not there
    it('should not set scope in the form data if it is not present', async () => {
      const instance = new IamRequestBasedTokenManager();

      await instance.requestToken();

      const requestOptions = getRequestOptions(sendRequestMock);
      expect(requestOptions.form).toBeDefined();
      expect(requestOptions.form.scope).toBeUndefined();
    });

    // maybe check all of the request options fields
    it('should set all other default iam request data', async () => {
      const instance = new IamRequestBasedTokenManager();

      await instance.requestToken();

      const requestOptions = getRequestOptions(sendRequestMock);
      expect(requestOptions.url).toBeDefined();
      expect(requestOptions.url).toBe('https://iam.cloud.ibm.com/identity/token');

      expect(requestOptions.method).toBeDefined();
      expect(requestOptions.method).toBe('POST');

      expect(requestOptions.form).toBeDefined();
      expect(requestOptions.form).toStrictEqual({});

      expect(requestOptions.rejectUnauthorized).toBeDefined();
      expect(requestOptions.rejectUnauthorized).toBe(true);
    });

    it('should add the operation path to the stored URL at request time', async () => {
      const instance = new IamRequestBasedTokenManager({ url: URL });
      expect(instance.url).toBe(URL);

      await instance.requestToken();

      const requestOptions = getRequestOptions(sendRequestMock);
      expect(requestOptions.url).toBe(`${URL}/identity/token`);
    });

    // mock and check send request
    it('should pass all request options to `sendRequest`', async () => {
      const instance = new IamRequestBasedTokenManager({ scope: SCOPE });

      await instance.requestToken();
      expect(sendRequestMock).toHaveBeenCalled();
    });
  });
});
