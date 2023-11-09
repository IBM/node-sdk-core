/* eslint-disable no-alert, no-console */

/**
 * (C) Copyright IBM Corp. 2023.
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

const { McspTokenManager } = require('../../dist/auth');

// mock sendRequest
jest.mock('../../dist/lib/request-wrapper');
const { RequestWrapper } = require('../../dist/lib/request-wrapper');

const mockSendRequest = jest.fn();
RequestWrapper.mockImplementation(() => ({
  sendRequest: mockSendRequest,
}));

const APIKEY = 'my-api-key';
const URL = 'https://mcsp.ibm.com';
const FULL_URL = `${URL}/siusermgr/api/1.0/apikeys/token`;

describe('MCSP Token Manager', () => {
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
    afterEach(() => {
      mockSendRequest.mockClear();
    });

    it('should call sendRequest with all request options', () => {
      const instance = new McspTokenManager({
        url: URL,
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
      expect(params.options.headers.Accept).toBe('application/json');
      expect(params.options.body).toBeDefined();
      expect(params.options.body.apikey).toBe(APIKEY);
    });
  });
});
