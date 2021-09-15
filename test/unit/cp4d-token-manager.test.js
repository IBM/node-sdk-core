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

const { Cp4dTokenManager } = require('../../dist/auth');

// mock sendRequest
jest.mock('../../dist/lib/request-wrapper');
const { RequestWrapper } = require('../../dist/lib/request-wrapper');

const mockSendRequest = jest.fn();
RequestWrapper.mockImplementation(() => ({
  sendRequest: mockSendRequest,
}));

const USERNAME = 'sherlock';
const PASSWORD = 'holmes';
const APIKEY = '221b-b4k3r';
const URL = 'tokenservice.com';
const FULL_URL = 'tokenservice.com/v1/authorize';

describe('CP4D Token Manager', () => {
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
    afterEach(() => {
      mockSendRequest.mockClear();
    });

    it('should call sendRequest with all request options - password edition', () => {
      const instance = new Cp4dTokenManager({
        url: URL,
        username: USERNAME,
        password: PASSWORD,
      });

      instance.requestToken();

      // extract arguments sendRequest was called with
      const params = mockSendRequest.mock.calls[0][0];

      expect(mockSendRequest).toHaveBeenCalled();
      expect(params.options).toBeDefined();
      expect(params.options.url).toBe(FULL_URL);
      expect(params.options.method).toBe('POST');
      expect(params.options.rejectUnauthorized).toBe(true);
      expect(params.options.headers).toBeDefined();
      expect(params.options.headers['Content-Type']).toBe('application/json');
      expect(params.options.body).toBeDefined();
      expect(params.options.body.username).toBe(USERNAME);
      expect(params.options.body.password).toBe(PASSWORD);
      expect(params.options.body.api_key).toBeUndefined();
    });

    it('should call sendRequest with all request options - API key edition', () => {
      const instance = new Cp4dTokenManager({
        url: URL,
        username: USERNAME,
        apikey: APIKEY,
      });

      instance.requestToken();

      // extract arguments sendRequest was called with
      const params = mockSendRequest.mock.calls[0][0];

      expect(mockSendRequest).toHaveBeenCalled();
      expect(params.options).toBeDefined();
      expect(params.options.url).toBe(FULL_URL);
      expect(params.options.method).toBe('POST');
      expect(params.options.rejectUnauthorized).toBe(true);
      expect(params.options.headers).toBeDefined();
      expect(params.options.headers['Content-Type']).toBe('application/json');
      expect(params.options.body).toBeDefined();
      expect(params.options.body.username).toBe(USERNAME);
      // expect(params.options.body.api_key).toBe(APIKEY);
      expect(params.options.body.password).toBeUndefined();
    });
  });
});
