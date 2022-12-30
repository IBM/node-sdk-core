/* eslint-disable no-alert, no-console */

/**
 * (C) Copyright IBM Corp. 2019, 2021.
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

jest.mock('../../dist/lib/request-wrapper');
const { RequestWrapper } = require('../../dist/lib/request-wrapper');

const { IamTokenManager } = require('../../dist/auth');

const mockSendRequest = jest.fn();

RequestWrapper.mockImplementation(() => ({
  sendRequest: mockSendRequest,
}));

const ACCESS_TOKEN = '9012';
const CURRENT_ACCESS_TOKEN = '1234';
const REFRESH_TOKEN = '3456';
const IAM_RESPONSE = {
  result: {
    access_token: ACCESS_TOKEN,
    refresh_token: REFRESH_TOKEN,
    token_type: 'Bearer',
    expires_in: 3600,
    expiration: Math.floor(Date.now() / 1000) + 3600,
  },
};

describe('IAM Token Manager', () => {
  beforeEach(() => {
    mockSendRequest.mockReset();
  });

  afterAll(() => {
    mockSendRequest.mockRestore();
  });

  it('should throw an error if apikey is not provided', () => {
    expect(() => new IamTokenManager()).toThrow();
  });

  it('should initialize form data', async () => {
    const apikey = 'abcd-1234';
    const instance = new IamTokenManager({ apikey });

    expect(instance.apikey).toBe(apikey);

    const { formData } = instance;
    expect(formData).toBeDefined();
    expect(formData.apikey).toBe(apikey);
    expect(formData.grant_type).toBe('urn:ibm:params:oauth:grant-type:apikey');
    expect(formData.response_type).toBe('cloud_iam');
  });

  it('should save and expose the refresh token', async () => {
    const instance = new IamTokenManager({
      apikey: 'abcd-1234',
    });

    mockSendRequest.mockImplementation((parameters) => Promise.resolve(IAM_RESPONSE));

    await instance.getToken();

    expect(instance.refreshToken).toBe(REFRESH_TOKEN);
    expect(instance.getRefreshToken()).toBe(REFRESH_TOKEN);
  });

  // the following tests are more end-to-end style tests that verify this token manager
  // functions properly with its parent classes

  it('should turn an iam apikey into an access token', async () => {
    const instance = new IamTokenManager({ apikey: 'abcd-1234' });

    mockSendRequest.mockImplementation((parameters) => Promise.resolve(IAM_RESPONSE));

    const token = await instance.getToken();

    expect(token).toBe(ACCESS_TOKEN);
  });

  it('should refresh an expired access token', async () => {
    const instance = new IamTokenManager({ apikey: 'abcd-1234' });
    const requestMock = jest.spyOn(instance, 'requestToken');

    const currentTokenInfo = {
      access_token: CURRENT_ACCESS_TOKEN,
    };

    instance.tokenInfo = currentTokenInfo;
    instance.expireTime = Math.floor(Date.now() / 1000) - 1;

    mockSendRequest.mockImplementation((parameters) => Promise.resolve(IAM_RESPONSE));

    const token = await instance.getToken();
    expect(token).toBe(ACCESS_TOKEN);
    expect(requestMock).toHaveBeenCalled();
  });

  it('should refresh an access token whose refreshTime has passed', async () => {
    const instance = new IamTokenManager({ apikey: 'abcd-1234' });
    const requestMock = jest.spyOn(instance, 'requestToken');

    const currentTokenInfo = {
      access_token: CURRENT_ACCESS_TOKEN,
    };

    instance.tokenInfo = currentTokenInfo;
    instance.accessToken = CURRENT_ACCESS_TOKEN;
    instance.expireTime = Math.floor(Date.now() / 1000) + 60;
    instance.refreshTime = Math.floor(Date.now() / 1000) - 1;

    const requestTokenSpy = jest
      .spyOn(instance, 'requestToken')
      .mockImplementation(() => Promise.resolve({ result: { access_token: ACCESS_TOKEN } }));

    mockSendRequest.mockImplementation((parameters) => Promise.resolve(IAM_RESPONSE));

    const token = await instance.getToken();
    expect(token).toBe(CURRENT_ACCESS_TOKEN);
    expect(requestMock).toHaveBeenCalled();
    expect(requestTokenSpy).toHaveBeenCalled();

    requestTokenSpy.mockRestore();
  });

  it('should use a valid access token if one is stored', async () => {
    const instance = new IamTokenManager({ apikey: 'abcd-1234' });
    const requestMock = jest.spyOn(instance, 'requestToken');

    const currentTokenInfo = {
      access_token: ACCESS_TOKEN,
    };

    instance.tokenInfo = currentTokenInfo;
    instance.accessToken = ACCESS_TOKEN;
    instance.expireTime = Math.floor(Date.now() / 1000) + 60 * 60;
    instance.refreshTime = Math.floor(Date.now() / 1000) + 48 * 60;

    const token = await instance.getToken();
    expect(token).toBe(ACCESS_TOKEN);
    expect(requestMock).not.toHaveBeenCalled();
  });
});
