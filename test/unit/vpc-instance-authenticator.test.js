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

const { Authenticator, VpcInstanceAuthenticator } = require('../../dist/auth');
const { VpcInstanceTokenManager } = require('../../dist/auth');

// mock the `getToken` method in the token manager - dont make any rest calls
const fakeToken = 'iam-acess-token';
const mockedTokenManager = new VpcInstanceTokenManager();

const getTokenSpy = jest
  .spyOn(mockedTokenManager, 'getToken')
  .mockImplementation(() => Promise.resolve(fakeToken));

describe('VPC Instance Authenticator', () => {
  const config = {
    iamProfileId: 'some-id',
    url: 'someurl.com',
    disableSslVerification: true,
    headers: {
      'X-My-Header': 'some-value',
    },
  };

  it('should store all config options on the class', () => {
    const authenticator = new VpcInstanceAuthenticator(config);

    expect(authenticator.authenticationType()).toEqual(Authenticator.AUTHTYPE_VPC);
    expect(authenticator.iamProfileCrn).not.toBeDefined();
    expect(authenticator.iamProfileId).toBe(config.iamProfileId);
    expect(authenticator.url).toBe(config.url);
    expect(authenticator.disableSslVerification).toBe(config.disableSslVerification);
    expect(authenticator.headers).toEqual(config.headers);

    // should also create a token manager
    expect(authenticator.tokenManager).toBeInstanceOf(VpcInstanceTokenManager);
  });

  it('should throw an error when both iamProfileCrn and iamProfileId are provided', () => {
    expect(() => {
      const unused = new VpcInstanceAuthenticator({
        iamProfileCrn: 'crn',
        iamProfileId: 'id',
      });
    }).toThrow('At most one of `iamProfileId` or `iamProfileCrn` may be specified.');
  });

  it('should re-set iamProfileCrn using the setter', () => {
    const authenticator = new VpcInstanceAuthenticator({ iamProfileCrn: 'test' });
    expect(authenticator.iamProfileCrn).not.toBe(config.iamProfileCrn);
    expect(authenticator.tokenManager.iamProfileCrn).not.toBe(config.iamProfileCrn);

    authenticator.setIamProfileCrn(config.iamProfileCrn);
    expect(authenticator.iamProfileCrn).toEqual(config.iamProfileCrn);

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.iamProfileCrn).toEqual(config.iamProfileCrn);
  });

  it('should re-set iamProfileId using the setter', () => {
    const authenticator = new VpcInstanceAuthenticator();
    expect(authenticator.iamProfileId).toBeUndefined();
    expect(authenticator.tokenManager.iamProfileId).toBeUndefined();

    authenticator.setIamProfileId(config.iamProfileId);
    expect(authenticator.iamProfileId).toEqual(config.iamProfileId);

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.iamProfileId).toEqual(config.iamProfileId);
  });

  // "end to end" style test, to make sure this authenticator ingregates properly with parent classes
  it('should update the options and resolve with `null` when `authenticate` is called', async () => {
    const authenticator = new VpcInstanceAuthenticator({ iamProfileCrn: config.iamProfileCrn });

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
});
