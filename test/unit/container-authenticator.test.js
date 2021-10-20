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

const { Authenticator, ContainerAuthenticator } = require('../../dist/auth');
const { ContainerTokenManager } = require('../../dist/auth');

// mock the `getToken` method in the token manager - dont make any rest calls
const fakeToken = 'iam-acess-token';
const mockedTokenManager = new ContainerTokenManager({ iamProfileName: 'some-name' });

const getTokenSpy = jest
  .spyOn(mockedTokenManager, 'getToken')
  .mockImplementation(() => Promise.resolve(fakeToken));

describe('Container Authenticator', () => {
  const config = {
    crTokenFilename: '/path/to/file',
    iamProfileName: 'some-name',
    iamProfileId: 'some-id',
    url: 'iam.staging.com',
    clientId: 'my-id',
    clientSecret: 'my-secret',
    disableSslVerification: true,
    headers: {
      'X-My-Header': 'some-value',
    },
    scope: 'A B C D',
  };

  it('should store all config options on the class', () => {
    const authenticator = new ContainerAuthenticator(config);

    expect(authenticator.authenticationType()).toEqual(Authenticator.AUTHTYPE_CONTAINER);
    expect(authenticator.crTokenFilename).toBe(config.crTokenFilename);
    expect(authenticator.iamProfileName).toBe(config.iamProfileName);
    expect(authenticator.iamProfileId).toBe(config.iamProfileId);
    expect(authenticator.url).toBe(config.url);
    expect(authenticator.clientId).toBe(config.clientId);
    expect(authenticator.clientSecret).toBe(config.clientSecret);
    expect(authenticator.disableSslVerification).toBe(config.disableSslVerification);
    expect(authenticator.headers).toEqual(config.headers);
    expect(authenticator.scope).toEqual(config.scope);

    // should also create a token manager
    expect(authenticator.tokenManager).toBeInstanceOf(ContainerTokenManager);
  });

  it('should throw an error when neither iamProfileName nor iamProfileId is provided', () => {
    expect(() => {
      const unused = new ContainerAuthenticator();
    }).toThrow('At least one of `iamProfileName` or `iamProfileId` must be specified.');
  });

  it('should re-set crTokenFilename using the setter', () => {
    const authenticator = new ContainerAuthenticator({ iamProfileName: config.iamProfileName });
    expect(authenticator.crTokenFilename).toBeUndefined();
    // the default is set on the token manager
    expect(authenticator.tokenManager.crTokenFilename).toBeDefined();
    expect(authenticator.tokenManager.crTokenFilename).not.toBe(config.crTokenFilename);

    authenticator.setCrTokenFilename(config.crTokenFilename);
    expect(authenticator.crTokenFilename).toEqual(config.crTokenFilename);

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.crTokenFilename).toEqual(config.crTokenFilename);
  });

  it('should re-set iamProfileName using the setter', () => {
    const authenticator = new ContainerAuthenticator({ iamProfileName: 'test' });
    expect(authenticator.iamProfileName).not.toBe(config.iamProfileName);
    expect(authenticator.tokenManager.iamProfileName).not.toBe(config.iamProfileName);

    authenticator.setIamProfileName(config.iamProfileName);
    expect(authenticator.iamProfileName).toEqual(config.iamProfileName);

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.iamProfileName).toEqual(config.iamProfileName);
  });

  it('should re-set iamProfileId using the setter', () => {
    const authenticator = new ContainerAuthenticator({ iamProfileName: config.iamProfileName });
    expect(authenticator.iamProfileId).toBeUndefined();
    expect(authenticator.tokenManager.iamProfileId).toBeUndefined();

    authenticator.setIamProfileId(config.iamProfileId);
    expect(authenticator.iamProfileId).toEqual(config.iamProfileId);

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.iamProfileId).toEqual(config.iamProfileId);
  });

  // "end to end" style test, to make sure this authenticator ingregates properly with parent classes
  it('should update the options and resolve with `null` when `authenticate` is called', async () => {
    const authenticator = new ContainerAuthenticator({ iamProfileName: config.iamProfileName });

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

  it('should return the refresh token stored in the token manager', () => {
    const token = 'some-token';
    const authenticator = new ContainerAuthenticator({ iamProfileName: config.iamProfileName });
    expect(authenticator.tokenManager.refreshToken).toBeUndefined();
    authenticator.tokenManager.refreshToken = token;
    expect(authenticator.getRefreshToken()).toEqual(token);
  });
});
