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

const { CloudPakForDataAuthenticator } = require('../../dist/auth');
const { Cp4dTokenManager } = require('../../dist/auth');

const USERNAME = 'danmullen';
const PASSWORD = 'gogators';
const APIKEY = '32611';
const URL = 'myicp.com:1234';
const CONFIG = {
  username: USERNAME,
  password: PASSWORD,
  url: URL,
  disableSslVerification: true,
  headers: {
    'X-My-Header': 'some-value',
  },
};

// mock the `getToken` method in the token manager - dont make any rest calls
const fakeToken = 'iam-acess-token';
const mockedTokenManager = new Cp4dTokenManager({
  username: USERNAME,
  password: PASSWORD,
  url: URL,
});

const getTokenSpy = jest
  .spyOn(mockedTokenManager, 'getToken')
  .mockImplementation(() => Promise.resolve(fakeToken));

describe('CP4D Authenticator', () => {
  it('should store all CONFIG options on the class', () => {
    const authenticator = new CloudPakForDataAuthenticator(CONFIG);
    expect(authenticator.username).toBe(CONFIG.username);
    expect(authenticator.password).toBe(CONFIG.password);
    expect(authenticator.url).toBe(CONFIG.url);
    expect(authenticator.disableSslVerification).toBe(CONFIG.disableSslVerification);
    expect(authenticator.headers).toEqual(CONFIG.headers);

    // should also create a token manager
    expect(authenticator.tokenManager).toBeInstanceOf(Cp4dTokenManager);
  });

  it('should store apikey on the class if provided', () => {
    const authenticator = new CloudPakForDataAuthenticator({
      url: URL,
      username: USERNAME,
      apikey: APIKEY,
    });

    expect(authenticator.apikey).toBe(APIKEY);
  });

  it('should throw an error when username is not provided', () => {
    expect(() => {
      const unused = new CloudPakForDataAuthenticator({ url: URL, password: PASSWORD });
    }).toThrow(/Missing required parameter/);
  });

  it('should throw an error when url is not provided', () => {
    expect(() => {
      const unused = new CloudPakForDataAuthenticator({ password: PASSWORD, username: USERNAME });
    }).toThrow(/Missing required parameter/);
  });

  it('should throw an error when both password and apikey are missing', () => {
    expect(() => {
      const unused = new CloudPakForDataAuthenticator({ username: USERNAME, url: URL });
    }).toThrow(/Exactly one of `apikey` or `password` must be specified/);
  });

  it('should throw an error when both password and apikey are present', () => {
    expect(() => {
      const unused = new CloudPakForDataAuthenticator({
        username: USERNAME,
        url: URL,
        password: PASSWORD,
        apikey: APIKEY,
      });
    }).toThrow(/Exactly one of `apikey` or `password` must be specified/);
  });

  it('should throw an error when username has a bad character', () => {
    expect(() => {
      const unused = new CloudPakForDataAuthenticator({
        username: '"<your-username>"',
        password: PASSWORD,
        url: URL,
      });
    }).toThrow(/Revise these credentials/);
  });

  it('should throw an error when password has a bad character', () => {
    expect(() => {
      const unused = new CloudPakForDataAuthenticator({
        username: USERNAME,
        password: '{some-password}',
        url: URL,
      });
    }).toThrow(/Revise these credentials/);
  });

  it('should throw an error when apikey has a bad character', () => {
    expect(() => {
      const unused = new CloudPakForDataAuthenticator({
        username: USERNAME,
        apikey: '{some-apikey}',
        url: URL,
      });
    }).toThrow(/Revise these credentials/);
  });

  it('should update the options and resolve with `null`', async (done) => {
    const authenticator = new CloudPakForDataAuthenticator(CONFIG);

    // override the created token manager with the mocked one
    authenticator.tokenManager = mockedTokenManager;

    const options = { headers: { 'X-Some-Header': 'user-supplied header' } };
    const result = await authenticator.authenticate(options);

    expect(result).toBeUndefined();
    expect(options.headers.Authorization).toBe(`Bearer ${fakeToken}`);
    expect(getTokenSpy).toHaveBeenCalled();

    // verify that the original options are kept intact
    expect(options.headers['X-Some-Header']).toBe('user-supplied header');
    done();
  });

  it('should re-set disableSslVerification using the setter', () => {
    const authenticator = new CloudPakForDataAuthenticator(CONFIG);
    expect(authenticator.disableSslVerification).toBe(CONFIG.disableSslVerification);

    const newValue = false;
    authenticator.setDisableSslVerification(newValue);
    expect(authenticator.disableSslVerification).toBe(newValue);

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.disableSslVerification).toBe(newValue);
  });

  it('should re-set the headers using the setter', () => {
    const authenticator = new CloudPakForDataAuthenticator(CONFIG);
    expect(authenticator.headers).toEqual(CONFIG.headers);

    const newHeader = { 'X-New-Header': 'updated-header' };
    authenticator.setHeaders(newHeader);
    expect(authenticator.headers).toEqual(newHeader);

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.headers).toEqual(newHeader);
  });
});
