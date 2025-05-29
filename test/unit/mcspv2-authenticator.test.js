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

const { Authenticator, McspV2Authenticator } = require('../../dist/auth');
const { McspV2TokenManager } = require('../../dist/auth');

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

const MOCK_TOKEN = 'mcspv2-access-token';
const mockedTokenManager = new McspV2TokenManager({
  url: MOCK_URL,
  apikey: MOCK_APIKEY,
  scopeCollectionType: MOCK_SCOPE_COLLECTION_TYPE,
  scopeId: MOCK_SCOPE_ID,
});
const getTokenSpy = jest
  .spyOn(mockedTokenManager, 'getToken')
  .mockImplementation(() => Promise.resolve(MOCK_TOKEN));

describe('MCSP V2 Authenticator', () => {
  it('create authenticator with only required properties', () => {
    const authenticator = new McspV2Authenticator({
      apikey: MOCK_APIKEY,
      url: MOCK_URL,
      scopeCollectionType: MOCK_SCOPE_COLLECTION_TYPE,
      scopeId: MOCK_SCOPE_ID,
    });
    expect(authenticator.authenticationType()).toBe(Authenticator.AUTHTYPE_MCSPV2);
    expect(authenticator.tokenManager).toBeInstanceOf(McspV2TokenManager);
    expect(authenticator.tokenManager.apikey).toBe(MOCK_APIKEY);
    expect(authenticator.tokenManager.url).toBe(MOCK_URL);
    expect(authenticator.tokenManager.scopeCollectionType).toBe(MOCK_SCOPE_COLLECTION_TYPE);
    expect(authenticator.tokenManager.scopeId).toBe(MOCK_SCOPE_ID);
    expect(authenticator.tokenManager.includeBuiltinActions).toBe(false);
    expect(authenticator.tokenManager.includeCustomActions).toBe(false);
    expect(authenticator.tokenManager.includeRoles).toBe(true);
    expect(authenticator.tokenManager.prefixRoles).toBe(false);
    expect(authenticator.tokenManager.callerExtClaim).toBeUndefined();
    expect(authenticator.tokenManager.disableSslVerification).toBe(false);
    expect(authenticator.tokenManager.headers).toEqual({});
  });
  it('create authenticator with all properties', () => {
    const authenticator = new McspV2Authenticator({
      apikey: MOCK_APIKEY,
      url: MOCK_URL,
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
    expect(authenticator.authenticationType()).toBe(Authenticator.AUTHTYPE_MCSPV2);
    expect(authenticator.tokenManager).toBeInstanceOf(McspV2TokenManager);
    expect(authenticator.tokenManager.apikey).toBe(MOCK_APIKEY);
    expect(authenticator.tokenManager.url).toBe(MOCK_URL);
    expect(authenticator.tokenManager.scopeCollectionType).toBe(MOCK_SCOPE_COLLECTION_TYPE);
    expect(authenticator.tokenManager.scopeId).toBe(MOCK_SCOPE_ID);
    expect(authenticator.tokenManager.includeBuiltinActions).toBe(true);
    expect(authenticator.tokenManager.includeCustomActions).toBe(true);
    expect(authenticator.tokenManager.includeRoles).toBe(false);
    expect(authenticator.tokenManager.prefixRoles).toBe(true);
    expect(authenticator.tokenManager.callerExtClaim).toEqual(MOCK_CALLER_EXT_CLAIM);
    expect(authenticator.tokenManager.disableSslVerification).toBe(true);
    expect(authenticator.tokenManager.headers).toEqual(MOCK_HEADERS);
  });
  it('create authenticator with strings for non-string options', () => {
    const authenticator = new McspV2Authenticator({
      apikey: MOCK_APIKEY,
      url: MOCK_URL,
      scopeCollectionType: MOCK_SCOPE_COLLECTION_TYPE,
      scopeId: MOCK_SCOPE_ID,
      includeBuiltinActions: 'nope',
      includeCustomActions: 'TRUE',
      includeRoles: 'false',
      prefixRoles: 'true',
      callerExtClaim: JSON.stringify(MOCK_CALLER_EXT_CLAIM, null),
      disableSslVerification: true,
      headers: MOCK_HEADERS,
    });
    expect(authenticator.authenticationType()).toBe(Authenticator.AUTHTYPE_MCSPV2);
    expect(authenticator.tokenManager).toBeInstanceOf(McspV2TokenManager);
    expect(authenticator.tokenManager.apikey).toBe(MOCK_APIKEY);
    expect(authenticator.tokenManager.url).toBe(MOCK_URL);
    expect(authenticator.tokenManager.scopeCollectionType).toBe(MOCK_SCOPE_COLLECTION_TYPE);
    expect(authenticator.tokenManager.scopeId).toBe(MOCK_SCOPE_ID);
    expect(authenticator.tokenManager.includeBuiltinActions).toBe(false);
    expect(authenticator.tokenManager.includeCustomActions).toBe(true);
    expect(authenticator.tokenManager.includeRoles).toBe(false);
    expect(authenticator.tokenManager.prefixRoles).toBe(true);
    expect(authenticator.tokenManager.callerExtClaim).toEqual(MOCK_CALLER_EXT_CLAIM);
    expect(authenticator.tokenManager.disableSslVerification).toBe(true);
    expect(authenticator.tokenManager.headers).toEqual(MOCK_HEADERS);
  });

  it('required property is missing', () => {
    expect(() => {
      const unused = new McspV2Authenticator({
        // url: MOCK_URL,
        apikey: MOCK_APIKEY,
        scopeCollectionType: MOCK_SCOPE_COLLECTION_TYPE,
        scopeId: MOCK_SCOPE_ID,
      });
    }).toThrow(/Missing required parameter/);
    expect(() => {
      const unused = new McspV2Authenticator({
        url: MOCK_URL,
        // apikey: MOCK_APIKEY,
        scopeCollectionType: MOCK_SCOPE_COLLECTION_TYPE,
        scopeId: MOCK_SCOPE_ID,
      });
    }).toThrow(/Missing required parameter/);
    expect(() => {
      const unused = new McspV2Authenticator({
        url: MOCK_URL,
        apikey: MOCK_APIKEY,
        // scopeCollectionType: MOCK_SCOPE_COLLECTION_TYPE,
        scopeId: MOCK_SCOPE_ID,
      });
    }).toThrow(/Missing required parameter/);
    expect(() => {
      const unused = new McspV2Authenticator({
        url: MOCK_URL,
        apikey: MOCK_APIKEY,
        scopeCollectionType: MOCK_SCOPE_COLLECTION_TYPE,
        // scopeId: MOCK_SCOPE_ID,
      });
    }).toThrow(/Missing required parameter/);
  });

  it('create authenticator and authenticate request', async () => {
    const authenticator = new McspV2Authenticator({
      url: MOCK_URL,
      apikey: MOCK_APIKEY,
      scopeCollectionType: MOCK_SCOPE_COLLECTION_TYPE,
      scopeId: MOCK_SCOPE_ID,
    });

    // Override the created token manager with the mocked one.
    authenticator.tokenManager = mockedTokenManager;

    const request = { headers: { 'X-Some-Header': 'user-supplied header' } };
    const result = await authenticator.authenticate(request);

    expect(result).toBeUndefined();
    expect(request.headers.Authorization).toBe(`Bearer ${MOCK_TOKEN}`);
    expect(getTokenSpy).toHaveBeenCalled();

    // Verify that the original headers are kept intact in the request.
    expect(request.headers['X-Some-Header']).toBe('user-supplied header');
  });
});
