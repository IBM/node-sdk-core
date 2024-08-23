/* eslint-disable no-alert, no-console */

/**
 * (C) Copyright IBM Corp. 2019, 2024.
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

jest.mock('jsonwebtoken/decode');
const decode = require('jsonwebtoken/decode');

decode.mockImplementation(() => ({ exp: 100, iat: 100 }));

const { Cp4dTokenManager } = require('../../dist/auth');

// mock sendRequest
jest.mock('../../dist/lib/request-wrapper');
const { RequestWrapper } = require('../../dist/lib/request-wrapper');
const { getRequestOptions } = require('./utils');

const USERNAME = 'sherlock';
const PASSWORD = 'holmes';
const APIKEY = '221b-b4k3r';
const URL = 'tokenservice.com';
const FULL_URL = 'tokenservice.com/v1/authorize';
const ACCESS_TOKEN = 'access-token';
const CP4D_RESPONSE = {
  result: {
    token: ACCESS_TOKEN,
  },
  status: 200,
};

describe('CP4D Token Manager', () => {
  const sendRequestMock = jest.fn();
  sendRequestMock.mockResolvedValue(CP4D_RESPONSE);
  RequestWrapper.mockImplementation(() => ({
    sendRequest: sendRequestMock,
  }));
  afterEach(() => {
    sendRequestMock.mockClear();
  });

  describe('constructor', () => {
    it('should initialize base variables - password edition', () => {
      const instance = new Cp4dTokenManager({
        url: 'tokenservice.com',
        username: USERNAME,
        password: PASSWORD,
      });

      expect(instance.tokenName).toBe('token');
      expect(instance.url).toBe(FULL_URL);
      expect(instance.username).toBe(USERNAME);
      expect(instance.password).toBe(PASSWORD);
      expect(instance.disableSslVerification).toBe(false);
    });

    it('should initialize base variables - apikey edition', () => {
      const instance = new Cp4dTokenManager({
        url: 'tokenservice.com',
        username: USERNAME,
        apikey: APIKEY,
      });

      expect(instance.tokenName).toBe('token');
      expect(instance.url).toBe(FULL_URL);
      expect(instance.username).toBe(USERNAME);
      expect(instance.apikey).toBe(APIKEY);
      expect(instance.disableSslVerification).toBe(false);
    });

    it('should not append the token path if supplied by user', () => {
      const url = FULL_URL;
      const instance = new Cp4dTokenManager({
        url,
        username: USERNAME,
        password: PASSWORD,
      });

      expect(instance.url).toBe(url);
    });

    it('should set disableSslVerification', () => {
      const instance = new Cp4dTokenManager({
        username: USERNAME,
        password: PASSWORD,
        url: URL,
        disableSslVerification: true,
      });

      expect(instance.disableSslVerification).toBe(true);
    });

    it('should throw an error if `url` is not given', () => {
      expect(
        () =>
          new Cp4dTokenManager({
            username: USERNAME,
            password: PASSWORD,
          })
      ).toThrow(/Missing required parameter/);
    });

    it('should throw an error if `username` is not given', () => {
      expect(
        () =>
          new Cp4dTokenManager({
            password: PASSWORD,
            url: URL,
          })
      ).toThrow(/Missing required parameter/);
    });

    it('should throw an error if neither `password` nor `apikey` are given', () => {
      expect(
        () =>
          new Cp4dTokenManager({
            username: USERNAME,
            url: URL,
          })
      ).toThrow(/Exactly one of `apikey` or `password` must be specified/);
    });

    it('should throw an error if both `password` and `apikey` are given', () => {
      expect(
        () =>
          new Cp4dTokenManager({
            username: USERNAME,
            url: URL,
            password: PASSWORD,
            apikey: APIKEY,
          })
      ).toThrow(/Exactly one of `apikey` or `password` must be specified/);
    });
  });

  describe('requestToken', () => {
    it('should call sendRequest with all request options - password edition', async () => {
      const instance = new Cp4dTokenManager({
        url: URL,
        username: USERNAME,
        password: PASSWORD,
      });

      const response = await instance.requestToken();
      expect(response).toBe(CP4D_RESPONSE);

      const requestOptions = getRequestOptions(sendRequestMock);
      expect(requestOptions.url).toBe(FULL_URL);
      expect(requestOptions.method).toBe('POST');
      expect(requestOptions.rejectUnauthorized).toBe(true);
      expect(requestOptions.headers).toBeDefined();
      expect(requestOptions.headers['Content-Type']).toBe('application/json');
      expect(requestOptions.body).toBeDefined();
      expect(requestOptions.body.username).toBe(USERNAME);
      expect(requestOptions.body.password).toBe(PASSWORD);
      expect(requestOptions.body.api_key).toBeUndefined();
    });

    it('should call sendRequest with all request options - API key edition', async () => {
      const instance = new Cp4dTokenManager({
        url: URL,
        username: USERNAME,
        apikey: APIKEY,
      });

      const response = await instance.requestToken();
      expect(response).toBe(CP4D_RESPONSE);

      const requestOptions = getRequestOptions(sendRequestMock);
      expect(sendRequestMock).toHaveBeenCalled();
      expect(requestOptions).toBeDefined();
      expect(requestOptions.url).toBe(FULL_URL);
      expect(requestOptions.method).toBe('POST');
      expect(requestOptions.rejectUnauthorized).toBe(true);
      expect(requestOptions.headers).toBeDefined();
      expect(requestOptions.headers['Content-Type']).toBe('application/json');
      expect(requestOptions.body).toBeDefined();
      expect(requestOptions.body.username).toBe(USERNAME);
      expect(requestOptions.body.api_key).toBe(APIKEY);
      expect(requestOptions.body.password).toBeUndefined();
    });

    it('should set User-Agent header', async () => {
      const instance = new Cp4dTokenManager({
        url: URL,
        username: USERNAME,
        password: PASSWORD,
      });

      await instance.requestToken();

      const requestOptions = getRequestOptions(sendRequestMock);
      expect(requestOptions.headers).toBeDefined();
      expect(requestOptions.headers['User-Agent']).toMatch(
        /^ibm-node-sdk-core\/cp4d-authenticator.*$/
      );
    });
    it('use getToken to exercise requestToken', async () => {
      const instance = new Cp4dTokenManager({
        url: URL,
        username: USERNAME,
        apikey: APIKEY,
      });

      const token = await instance.getToken();
      expect(token).toBe(ACCESS_TOKEN);
    });
  });
});
