/* eslint-disable no-alert, no-console */

/**
 * (C) Copyright IBM Corp. 2025.
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
const { McspV2TokenManager } = require('../../dist/auth');

// mock sendRequest
jest.mock('../../dist/lib/request-wrapper');
const { RequestWrapper } = require('../../dist/lib/request-wrapper');
const { getRequestOptions } = require('./utils');
const { getCurrentTime } = require('../../dist/auth/utils/helpers');

// Mock values used for testing.
const MOCK_APIKEY = 'mock-apikey';
const MOCK_URL = 'https://mcspv2.ibm.com';
const MOCK_SCOPE_COLLECTION_TYPE = 'accounts';
const MOCK_SCOPE_ID = 'global_account';

const MOCK_CALLER_EXT_CLAIM = {
  productID: 'prod-123',
};

const MOCK_HEADERS = {
  'X-My-Header': 'my-value',
};

const MOCK_TOKEN_INITIAL = 'initial-mcspv2-access-token';
const MOCK_TOKEN = 'mcspv2-access-token';
const MOCK_TOKEN_RESPONSE = {
  result: {
    token: MOCK_TOKEN,
    token_type: 'Bearer',
    expires_in: 7200,
    expiration: getCurrentTime() + 7200,
  },
  status: 200,
};

// This path contains unresolved path parameter references on purpose.
// We use this string to compare against the request url computed by the underlying token manager.
// Unfortunately, the path parameter references are not resolved to their actual values
// because of the mocking that we do. So, we'll leave those references unresolved here
// so that we're comparing things correctly in our tests below.
const MOCK_FULL_URL = `${MOCK_URL}/api/2.0/{scopeCollectionType}/{scopeId}/apikeys/token`;

describe('MCSP V2 Token Manager', () => {
  describe('constructor', () => {
    it('create tokenmgr with required properties', () => {
      const instance = new McspV2TokenManager({
        url: MOCK_URL,
        apikey: MOCK_APIKEY,
        scopeCollectionType: MOCK_SCOPE_COLLECTION_TYPE,
        scopeId: MOCK_SCOPE_ID,
      });

      expect(instance.tokenName).toBe('token');
      expect(instance.url).toBe(MOCK_URL);
      expect(instance.apikey).toBe(MOCK_APIKEY);
      expect(instance.scopeCollectionType).toBe(MOCK_SCOPE_COLLECTION_TYPE);
      expect(instance.scopeId).toBe(MOCK_SCOPE_ID);
      expect(instance.includeBuiltinActions).toBe(false);
      expect(instance.includeCustomActions).toBe(false);
      expect(instance.includeRoles).toBe(true);
      expect(instance.prefixRoles).toBe(false);
      expect(instance.callerExtClaim).toBeUndefined();
      expect(instance.disableSslVerification).toBe(false);
      expect(instance.headers).toEqual({});
    });
    it('create tokenmgr with all properties', () => {
      const instance = new McspV2TokenManager({
        url: MOCK_URL,
        apikey: MOCK_APIKEY,
        scopeCollectionType: MOCK_SCOPE_COLLECTION_TYPE,
        scopeId: MOCK_SCOPE_ID,
        includeBuiltinActions: true,
        includeCustomActions: true,
        includeRoles: false,
        prefixRoles: true,
        callerExtClaim: MOCK_CALLER_EXT_CLAIM,
        disableSslVerification: true,
        headers: MOCK_HEADERS,
      });

      expect(instance.tokenName).toBe('token');
      expect(instance.url).toBe(MOCK_URL);
      expect(instance.apikey).toBe(MOCK_APIKEY);
      expect(instance.scopeCollectionType).toBe(MOCK_SCOPE_COLLECTION_TYPE);
      expect(instance.scopeId).toBe(MOCK_SCOPE_ID);
      expect(instance.includeBuiltinActions).toBe(true);
      expect(instance.includeCustomActions).toBe(true);
      expect(instance.includeRoles).toBe(false);
      expect(instance.prefixRoles).toBe(true);
      expect(instance.callerExtClaim).toEqual(MOCK_CALLER_EXT_CLAIM);
      expect(instance.disableSslVerification).toBe(true);
      expect(instance.headers).toEqual(MOCK_HEADERS);
    });
    it('create authenticator using credentials', () => {
      // Testing the token manager using all string values for options
      // simulates the scenarios where we retrieve config properties
      // (credentials) and pass those as strings to the authenticator ctor.
      const instance = new McspV2TokenManager({
        apikey: MOCK_APIKEY,
        url: MOCK_URL,
        scopeCollectionType: MOCK_SCOPE_COLLECTION_TYPE,
        scopeId: MOCK_SCOPE_ID,
        includeBuiltinActions: 'nope',
        includeCustomActions: 'TRUE',
        includeRoles: 'false',
        prefixRoles: 'true',
        callerExtClaim: JSON.stringify(MOCK_CALLER_EXT_CLAIM, null),
      });
      expect(instance).toBeInstanceOf(McspV2TokenManager);
      expect(instance.apikey).toBe(MOCK_APIKEY);
      expect(instance.url).toBe(MOCK_URL);
      expect(instance.scopeCollectionType).toBe(MOCK_SCOPE_COLLECTION_TYPE);
      expect(instance.scopeId).toBe(MOCK_SCOPE_ID);
      expect(instance.includeBuiltinActions).toBe(false);
      expect(instance.includeCustomActions).toBe(true);
      expect(instance.includeRoles).toBe(false);
      expect(instance.prefixRoles).toBe(true);
      expect(instance.callerExtClaim).toEqual(MOCK_CALLER_EXT_CLAIM);
    });

    it('input validation errors', () => {
      // Verify missing required properties.
      expect(
        () =>
          new McspV2TokenManager({
            // apikey: MOCK_APIKEY,
            url: MOCK_URL,
            scopeCollectionType: MOCK_SCOPE_COLLECTION_TYPE,
            scopeId: MOCK_SCOPE_ID,
          })
      ).toThrow(/Missing required parameter/);
      expect(
        () =>
          new McspV2TokenManager({
            apikey: MOCK_APIKEY,
            // url: MOCK_URL,
            scopeCollectionType: MOCK_SCOPE_COLLECTION_TYPE,
            scopeId: MOCK_SCOPE_ID,
          })
      ).toThrow(/Missing required parameter/);
      expect(
        () =>
          new McspV2TokenManager({
            apikey: MOCK_APIKEY,
            url: MOCK_URL,
            // scopeCollectionType: MOCK_SCOPE_COLLECTION_TYPE,
            scopeId: MOCK_SCOPE_ID,
          })
      ).toThrow(/Missing required parameter/);
      expect(
        () =>
          new McspV2TokenManager({
            apikey: MOCK_APIKEY,
            url: MOCK_URL,
            scopeCollectionType: MOCK_SCOPE_COLLECTION_TYPE,
            // scopeId: MOCK_SCOPE_ID,
          })
      ).toThrow(/Missing required parameter/);

      // Verify that an invalid json string causes an exception.
      expect(
        () =>
          new McspV2TokenManager({
            apikey: MOCK_APIKEY,
            url: MOCK_URL,
            scopeCollectionType: MOCK_SCOPE_COLLECTION_TYPE,
            scopeId: MOCK_SCOPE_ID,
            callerExtClaim: 'not json',
          })
      ).toThrow(/An error occurred while parsing the callerExtClaim value/);
    });
  });

  describe('requestToken', () => {
    // Mock the RequestWrapper.sendRequest() method.
    const sendRequestMock = jest.fn();
    sendRequestMock.mockResolvedValue(MOCK_TOKEN_RESPONSE);
    RequestWrapper.mockImplementation(() => ({
      sendRequest: sendRequestMock,
    }));

    afterEach(() => {
      sendRequestMock.mockClear();
    });

    it('should call sendRequest with correct request options', async () => {
      const instance = new McspV2TokenManager({
        url: MOCK_URL,
        apikey: MOCK_APIKEY,
        scopeCollectionType: MOCK_SCOPE_COLLECTION_TYPE,
        scopeId: MOCK_SCOPE_ID,
        callerExtClaim: MOCK_CALLER_EXT_CLAIM,
      });

      const response = await instance.requestToken();
      expect(response).toBe(MOCK_TOKEN_RESPONSE);

      // Verify sendRequest() was called with the correct options.
      const requestOptions = getRequestOptions(sendRequestMock);
      expect(requestOptions.method).toBe('POST');
      expect(requestOptions.url).toBe(MOCK_FULL_URL);
      expect(requestOptions.rejectUnauthorized).toBe(true);
      expect(requestOptions.headers).toBeDefined();
      expect(requestOptions.headers['Content-Type']).toBe('application/json');
      expect(requestOptions.headers.Accept).toBe('application/json');
      expect(requestOptions.headers['User-Agent']).toMatch(
        /^ibm-node-sdk-core\/mcspv2-authenticator.*$/
      );
      expect(requestOptions.body).toBeDefined();
      expect(requestOptions.body.apikey).toBe(MOCK_APIKEY);
      expect(requestOptions.body.callerExtClaim).toBe(MOCK_CALLER_EXT_CLAIM);
      expect(requestOptions.qs.includeBuiltinActions).toBe(false);
      expect(requestOptions.qs.includeCustomActions).toBe(false);
      expect(requestOptions.qs.includeRoles).toBe(true);
      expect(requestOptions.qs.prefixRolesWithDefinitionScope).toBe(false);
    });

    it('use getToken to invoke requestToken', async () => {
      const instance = new McspV2TokenManager({
        url: MOCK_URL,
        apikey: MOCK_APIKEY,
        scopeCollectionType: MOCK_SCOPE_COLLECTION_TYPE,
        scopeId: MOCK_SCOPE_ID,
      });

      const accessToken = await instance.getToken();
      expect(accessToken).toBe(MOCK_TOKEN);
    });

    it('should refresh an expired access token', async () => {
      const instance = new McspV2TokenManager({
        url: MOCK_URL,
        apikey: MOCK_APIKEY,
        scopeCollectionType: MOCK_SCOPE_COLLECTION_TYPE,
        scopeId: MOCK_SCOPE_ID,
      });

      const requestMock = jest.spyOn(instance, 'requestToken');

      // Set up the token manager to contain an initial access token.
      instance.accessToken = MOCK_TOKEN_INITIAL;
      instance.expireTime = getCurrentTime() + 7200;
      instance.refreshTime = getCurrentTime() + 7200;

      // Call getToken() and verify that it returned the initial access token.
      let token = await instance.getToken();
      expect(token).toBe(MOCK_TOKEN_INITIAL);

      // Set the expiration time so that we'll consider the initial access token expired.
      instance.expireTime = getCurrentTime();

      // Call getToken() again and verify it returned the second access token.
      token = await instance.getToken();
      expect(token).toBe(MOCK_TOKEN);
      expect(requestMock).toHaveBeenCalled();
    });

    it('should refresh an access token whose refreshTime has passed', async () => {
      const instance = new McspV2TokenManager({
        url: MOCK_URL,
        apikey: MOCK_APIKEY,
        scopeCollectionType: MOCK_SCOPE_COLLECTION_TYPE,
        scopeId: MOCK_SCOPE_ID,
      });
      const requestMock = jest.spyOn(instance, 'requestToken');

      // Set up the token manager to contain an initial access token that expires in
      // 60s and puts us 1 second past the refresh time.  This means that we're within
      // that "refresh window" where the currently cached token is still valid and can be
      // used, but we should also trigger a refresh in the background.
      instance.accessToken = MOCK_TOKEN_INITIAL;
      instance.expireTime = getCurrentTime() + 60;
      instance.refreshTime = getCurrentTime() - 1;

      // Set up the requestToken() mock to return the new access token.
      const requestTokenSpy = jest
        .spyOn(instance, 'requestToken')
        .mockImplementation(() => Promise.resolve({ result: { token: MOCK_TOKEN } }));

      // Call getToken() and verify that it returned the INITIAL access token.
      // We should still get back the initial access token while we also trigger the
      // refresh in the background.
      const token = await instance.getToken();
      expect(token).toBe(MOCK_TOKEN_INITIAL);
      expect(requestMock).toHaveBeenCalled();
      expect(requestTokenSpy).toHaveBeenCalled();

      requestTokenSpy.mockRestore();
    });

    it('should use a valid cached access token', async () => {
      const instance = new McspV2TokenManager({
        url: MOCK_URL,
        apikey: MOCK_APIKEY,
        scopeCollectionType: MOCK_SCOPE_COLLECTION_TYPE,
        scopeId: MOCK_SCOPE_ID,
      });
      const requestMock = jest.spyOn(instance, 'requestToken');

      instance.accessToken = MOCK_TOKEN_INITIAL;
      instance.expireTime = getCurrentTime() + 60 * 60;
      instance.refreshTime = getCurrentTime() + 48 * 60;

      const token = await instance.getToken();
      expect(token).toBe(MOCK_TOKEN_INITIAL);
      expect(requestMock).not.toHaveBeenCalled();
    });
  });
});
