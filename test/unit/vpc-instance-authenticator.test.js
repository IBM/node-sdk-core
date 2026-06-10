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
  };

  it('should store all config options on the class', () => {
    const authenticator = new VpcInstanceAuthenticator(config);

    expect(authenticator.authenticationType()).toEqual(Authenticator.AUTHTYPE_VPC);
    expect(authenticator.iamProfileCrn).not.toBeDefined();
    expect(authenticator.iamProfileId).toBe(config.iamProfileId);
    expect(authenticator.url).toBe(config.url);

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

  it('should store serviceVersion and tokenLifetime when provided in config', () => {
    const authenticator = new VpcInstanceAuthenticator({
      serviceVersion: '2025-08-26',
      tokenLifetime: 600,
    });

    expect(authenticator.serviceVersion).toBe('2025-08-26');
    expect(authenticator.tokenManager.serviceVersion).toBe('2025-08-26');
    expect(authenticator.tokenLifetime).toBe(600);
    expect(authenticator.tokenManager.tokenLifetime).toBe(600);
  });

  it('should use default serviceVersion and tokenLifetime when not provided', () => {
    const authenticator = new VpcInstanceAuthenticator();

    expect(authenticator.tokenManager.serviceVersion).toBe('2022-03-01');
    expect(authenticator.tokenManager.tokenLifetime).toBe(300);
  });

  it('should set serviceVersion using the setter even when not declared in constructor', () => {
    const authenticator = new VpcInstanceAuthenticator();

    // Initially should be undefined on authenticator (but token manager has default)
    expect(authenticator.serviceVersion).toBeUndefined();
    expect(authenticator.tokenManager.serviceVersion).toBe('2022-03-01');

    authenticator.setServiceVersion('2025-08-26');
    expect(authenticator.serviceVersion).toBe('2025-08-26');

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.serviceVersion).toBe('2025-08-26');
  });

  it('should set tokenLifetime using the setter even when not declared in constructor', () => {
    const authenticator = new VpcInstanceAuthenticator();

    // Initially should be undefined on authenticator (but token manager has default)
    expect(authenticator.tokenLifetime).toBeUndefined();
    expect(authenticator.tokenManager.tokenLifetime).toBe(300);

    authenticator.setTokenLifetime(900);
    expect(authenticator.tokenLifetime).toBe(900);

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.tokenLifetime).toBe(900);
  });

  it('should re-set serviceVersion using the setter when already set in constructor', () => {
    const authenticator = new VpcInstanceAuthenticator({
      serviceVersion: '2022-03-01',
    });

    expect(authenticator.serviceVersion).toBe('2022-03-01');
    expect(authenticator.tokenManager.serviceVersion).toBe('2022-03-01');

    authenticator.setServiceVersion('2025-05-26');
    expect(authenticator.serviceVersion).toBe('2025-05-26');

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.serviceVersion).toBe('2025-05-26');
  });

  it('should re-set tokenLifetime using the setter when already set in constructor', () => {
    const authenticator = new VpcInstanceAuthenticator({
      tokenLifetime: 300,
    });

    expect(authenticator.tokenLifetime).toBe(300);
    expect(authenticator.tokenManager.tokenLifetime).toBe(300);

    authenticator.setTokenLifetime(900);
    expect(authenticator.tokenLifetime).toBe(900);

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.tokenLifetime).toBe(900);
  });

  it('should pass all config options to token manager', () => {
    const fullConfig = {
      iamProfileId: 'some-id',
      url: 'someurl.com',
      serviceVersion: '2025-08-26',
      tokenLifetime: 600,
    };

    const authenticator = new VpcInstanceAuthenticator(fullConfig);

    expect(authenticator.tokenManager.iamProfileId).toBe(fullConfig.iamProfileId);
    expect(authenticator.tokenManager.url).toBe(fullConfig.url);
    expect(authenticator.tokenManager.serviceVersion).toBe(fullConfig.serviceVersion);
    expect(authenticator.tokenManager.tokenLifetime).toBe(fullConfig.tokenLifetime);
  });

  it('should accept serviceVersion from environment variables (via constructor)', () => {
    // This simulates how environment variables are passed to the authenticator
    // via getAuthenticatorFromEnvironment -> readExternalSources
    const envConfig = {
      iamProfileId: 'some-id',
      serviceVersion: '2025-08-26', // This would come from SERVICE_NAME_SERVICE_VERSION env var
    };

    const authenticator = new VpcInstanceAuthenticator(envConfig);

    expect(authenticator.serviceVersion).toBe('2025-08-26');
    expect(authenticator.tokenManager.serviceVersion).toBe('2025-08-26');
    expect(authenticator.iamProfileId).toBe('some-id');
  });

  it('should throw an error for invalid service version', () => {
    expect(
      () =>
        new VpcInstanceTokenManager({
          serviceVersion: '2024-01-01',
        })
    ).toThrow('Invalid serviceVersion. Must be one of: 2022-03-01, 2025-08-26');
  });

  // "end to end" style test, to make sure this authenticator integrates properly with parent classes
  it('should update the options and resolve with `null` when `authenticate` is called', async () => {
    const authenticator = new VpcInstanceAuthenticator({ iamProfileCrn: config.iamProfileCrn });

    // override the created token manager with the mocked one
    authenticator.tokenManager = mockedTokenManager;

    const options = {};
    const result = await authenticator.authenticate(options);

    expect(result).toBeUndefined();
    expect(options.headers.Authorization).toBe(`Bearer ${fakeToken}`);
    expect(getTokenSpy).toHaveBeenCalled();
  });
});
