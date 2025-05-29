/* eslint-disable no-alert, no-console */

/**
 * (C) Copyright IBM Corp. 2023, 2024.
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
const { McspTokenManager } = require('../../dist/auth');

// mock sendRequest
jest.mock('../../dist/lib/request-wrapper');
const { RequestWrapper } = require('../../dist/lib/request-wrapper');
const { getRequestOptions } = require('./utils');
const { getCurrentTime } = require('../../dist/auth/utils/helpers');

const APIKEY = 'my-api-key';
const URL = 'https://mcsp.ibm.com';
const FULL_URL = `${URL}/siusermgr/api/1.0/apikeys/token`;
const ACCESS_TOKEN = 'access-token';
const IAM_RESPONSE = {
  result: {
    token: ACCESS_TOKEN,
    token_type: 'Bearer',
    expires_in: 3600,
    expiration: getCurrentTime() + 3600,
  },
  status: 200,
};

describe('MCSP V1 Token Manager', () => {
  describe('constructor', () => {
    it('should initialize base variables', () => {
      const instance = new McspTokenManager({
        url: URL,
        apikey: APIKEY,
      });

      expect(instance.tokenName).toBe('token');
      expect(instance.apikey).toBe(APIKEY);
      expect(instance.disableSslVerification).toBe(false);
    });

    it('should set disableSslVerification', () => {
      const instance = new McspTokenManager({
        apikey: APIKEY,
        url: URL,
        disableSslVerification: true,
      });

      expect(instance.disableSslVerification).toBe(true);
    });

    it('should throw an error if `url` is not given', () => {
      expect(
        () =>
          new McspTokenManager({
            apikey: APIKEY,
          })
      ).toThrow(/Missing required parameter/);
    });

    it('should throw an error if `apikey` is not given', () => {
      expect(
        () =>
          new McspTokenManager({
            url: URL,
          })
      ).toThrow(/Missing required parameter/);
    });
  });

  describe('requestToken', () => {
    const sendRequestMock = jest.fn();
    sendRequestMock.mockResolvedValue(IAM_RESPONSE);
    RequestWrapper.mockImplementation(() => ({
      sendRequest: sendRequestMock,
    }));
    afterEach(() => {
      sendRequestMock.mockClear();
    });

    it('should call sendRequest with all request options', async () => {
      const instance = new McspTokenManager({
        url: URL,
        apikey: APIKEY,
      });

      const response = await instance.requestToken();
      expect(response).toBe(IAM_RESPONSE);

      const requestOptions = getRequestOptions(sendRequestMock);
      expect(requestOptions.url).toBe(FULL_URL);
      expect(requestOptions.method).toBe('POST');
      expect(requestOptions.rejectUnauthorized).toBe(true);
      expect(requestOptions.headers).toBeDefined();
      expect(requestOptions.headers['Content-Type']).toBe('application/json');
      expect(requestOptions.headers.Accept).toBe('application/json');
      expect(requestOptions.body).toBeDefined();
      expect(requestOptions.body.apikey).toBe(APIKEY);
    });

    it('should set User-Agent header', async () => {
      const instance = new McspTokenManager({
        url: URL,
        apikey: APIKEY,
      });

      const response = await instance.requestToken();
      expect(response).toBe(IAM_RESPONSE);

      const requestOptions = getRequestOptions(sendRequestMock);
      expect(requestOptions.headers).toBeDefined();
      expect(requestOptions.headers['User-Agent']).toMatch(
        /^ibm-node-sdk-core\/mcsp-authenticator.*$/
      );
    });

    it('use getToken to invoke requestToken', async () => {
      const instance = new McspTokenManager({
        url: URL,
        apikey: APIKEY,
      });

      const accessToken = await instance.getToken();
      expect(accessToken).toBe(ACCESS_TOKEN);
    });
  });
});
