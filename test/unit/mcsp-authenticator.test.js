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

const { Authenticator, McspAuthenticator } = require('../../dist/auth');
const { McspTokenManager } = require('../../dist/auth');

const APIKEY = '32611';
const URL = 'https://mcsp.ibm.com';
const CONFIG = {
  apikey: APIKEY,
  url: URL,
  disableSslVerification: true,
  headers: {
    'X-My-Header': 'some-value',
  },
};

// mock the `getToken` method in the token manager - dont make any rest calls
const fakeToken = 'mcsp-acess-token';
const mockedTokenManager = new McspTokenManager({
  url: URL,
  apikey: APIKEY,
});

const getTokenSpy = jest
  .spyOn(mockedTokenManager, 'getToken')
  .mockImplementation(() => Promise.resolve(fakeToken));

describe('MCSP Authenticator', () => {
  it('should store all CONFIG options on the class', () => {
    const authenticator = new McspAuthenticator(CONFIG);
    expect(authenticator.authenticationType()).toEqual(Authenticator.AUTHTYPE_MCSP);
    expect(authenticator.apikey).toBe(CONFIG.apikey);
    expect(authenticator.url).toBe(CONFIG.url);
    expect(authenticator.disableSslVerification).toBe(CONFIG.disableSslVerification);
    expect(authenticator.headers).toEqual(CONFIG.headers);

    // should also create a token manager
    expect(authenticator.tokenManager).toBeInstanceOf(McspTokenManager);
  });

  it('should store apikey and url on the class if provided', () => {
    const authenticator = new McspAuthenticator({
      url: URL,
      apikey: APIKEY,
    });

    expect(authenticator.apikey).toBe(APIKEY);
    expect(authenticator.url).toBe(URL);
  });

  it('should throw an error when apikey is not provided', () => {
    expect(() => {
      const unused = new McspAuthenticator({ url: URL });
    }).toThrow(/Missing required parameter/);
  });

  it('should throw an error when url is not provided', () => {
    expect(() => {
      const unused = new McspAuthenticator({ apikey: APIKEY });
    }).toThrow(/Missing required parameter/);
  });

  it('should update the options and resolve with `null`', async () => {
    const authenticator = new McspAuthenticator(CONFIG);

    // override the created token manager with the mocked one
    authenticator.tokenManager = mockedTokenManager;

    const options = { headers: { 'X-Some-Header': 'user-supplied header' } };
    const result = await authenticator.authenticate(options);

    expect(result).toBeUndefined();
    expect(options.headers.Authorization).toBe(`Bearer ${fakeToken}`);
    expect(getTokenSpy).toHaveBeenCalled();

    // verify that the original options are kept intact
    expect(options.headers['X-Some-Header']).toBe('user-supplied header');
  });

  it('should re-set disableSslVerification using the setter', () => {
    const authenticator = new McspAuthenticator(CONFIG);
    expect(authenticator.disableSslVerification).toBe(CONFIG.disableSslVerification);

    const newValue = false;
    authenticator.setDisableSslVerification(newValue);
    expect(authenticator.disableSslVerification).toBe(newValue);

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.disableSslVerification).toBe(newValue);
  });

  it('should re-set the headers using the setter', () => {
    const authenticator = new McspAuthenticator(CONFIG);
    expect(authenticator.headers).toEqual(CONFIG.headers);

    const newHeader = { 'X-New-Header': 'updated-header' };
    authenticator.setHeaders(newHeader);
    expect(authenticator.headers).toEqual(newHeader);

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.headers).toEqual(newHeader);
  });
});
