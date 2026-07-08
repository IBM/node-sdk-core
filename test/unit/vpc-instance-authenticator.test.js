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

// Constants for repeated values
const SERVICE_VERSION_2022 = '2022-03-01';
const SERVICE_VERSION_2025 = '2025-08-26';
const DEFAULT_TOKEN_LIFETIME = 300;
const CUSTOM_TOKEN_LIFETIME = 600;
const INVALID_SERVICE_VERSION_ERROR = `Invalid serviceVersion. Must be one of: ${SERVICE_VERSION_2022}, ${SERVICE_VERSION_2025}`;
const IAM_PROFILE_NAME = 'some-name';

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
    }).toThrow(
      'At most one of `iamProfileId`, `iamProfileCrn` or `iamProfileName` may be specified.'
    );
  });

  it('should throw an error when both iamProfileCrn and iamProfileName are provided', () => {
    expect(() => {
      const unused = new VpcInstanceAuthenticator({
        iamProfileCrn: 'crn',
        iamProfileName: IAM_PROFILE_NAME,
      });
    }).toThrow(
      'At most one of `iamProfileId`, `iamProfileCrn` or `iamProfileName` may be specified.'
    );
  });

  it('should throw an error when both iamProfileId and iamProfileName are provided', () => {
    expect(() => {
      const unused = new VpcInstanceAuthenticator({
        iamProfileId: 'id',
        iamProfileName: IAM_PROFILE_NAME,
      });
    }).toThrow(
      'At most one of `iamProfileId`, `iamProfileCrn` or `iamProfileName` may be specified.'
    );
  });

  it('should store iamProfileName when provided in config', () => {
    const authenticator = new VpcInstanceAuthenticator({ iamProfileName: IAM_PROFILE_NAME });

    expect(authenticator.iamProfileName).toBe(IAM_PROFILE_NAME);
    expect(authenticator.iamProfileCrn).toBeUndefined();
    expect(authenticator.iamProfileId).toBeUndefined();

    // should also be set on the token manager
    expect(authenticator.tokenManager.iamProfileName).toBe(IAM_PROFILE_NAME);
  });

  it('should re-set iamProfileName using the setter', () => {
    const authenticator = new VpcInstanceAuthenticator({ iamProfileName: 'initial-name' });
    expect(authenticator.iamProfileName).toBe('initial-name');

    authenticator.setIamProfileName(IAM_PROFILE_NAME);
    expect(authenticator.iamProfileName).toBe(IAM_PROFILE_NAME);

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.iamProfileName).toBe(IAM_PROFILE_NAME);
  });

  it('should set iamProfileName using the setter when not declared in constructor', () => {
    const authenticator = new VpcInstanceAuthenticator();
    expect(authenticator.iamProfileName).toBeUndefined();
    expect(authenticator.tokenManager.iamProfileName).toBeUndefined();

    authenticator.setIamProfileName(IAM_PROFILE_NAME);
    expect(authenticator.iamProfileName).toBe(IAM_PROFILE_NAME);

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.iamProfileName).toBe(IAM_PROFILE_NAME);
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
      serviceVersion: SERVICE_VERSION_2025,
      tokenLifetime: CUSTOM_TOKEN_LIFETIME,
    });

    expect(authenticator.serviceVersion).toBe(SERVICE_VERSION_2025);
    expect(authenticator.tokenManager.serviceVersion).toBe(SERVICE_VERSION_2025);
    expect(authenticator.tokenLifetime).toBe(CUSTOM_TOKEN_LIFETIME);
    expect(authenticator.tokenManager.tokenLifetime).toBe(CUSTOM_TOKEN_LIFETIME);
  });

  it('should use default serviceVersion and tokenLifetime when not provided', () => {
    const authenticator = new VpcInstanceAuthenticator();

    expect(authenticator.tokenManager.serviceVersion).toBe(SERVICE_VERSION_2022);
    expect(authenticator.tokenManager.tokenLifetime).toBe(DEFAULT_TOKEN_LIFETIME);
  });

  it('should set serviceVersion using the setter even when not declared in constructor', () => {
    const authenticator = new VpcInstanceAuthenticator();

    // Initially should be undefined on authenticator (but token manager has default)
    expect(authenticator.serviceVersion).toBeUndefined();
    expect(authenticator.tokenManager.serviceVersion).toBe(SERVICE_VERSION_2022);

    authenticator.setServiceVersion(SERVICE_VERSION_2025);
    expect(authenticator.serviceVersion).toBe(SERVICE_VERSION_2025);

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.serviceVersion).toBe(SERVICE_VERSION_2025);
  });

  it('should set tokenLifetime using the setter even when not declared in constructor', () => {
    const authenticator = new VpcInstanceAuthenticator();

    // Initially should be undefined on authenticator (but token manager has default)
    expect(authenticator.tokenLifetime).toBeUndefined();
    expect(authenticator.tokenManager.tokenLifetime).toBe(DEFAULT_TOKEN_LIFETIME);

    authenticator.setTokenLifetime(900);
    expect(authenticator.tokenLifetime).toBe(900);

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.tokenLifetime).toBe(900);
  });

  it('should re-set tokenLifetime using the setter when already set in constructor', () => {
    const authenticator = new VpcInstanceAuthenticator({
      tokenLifetime: DEFAULT_TOKEN_LIFETIME,
    });

    expect(authenticator.tokenLifetime).toBe(DEFAULT_TOKEN_LIFETIME);
    expect(authenticator.tokenManager.tokenLifetime).toBe(DEFAULT_TOKEN_LIFETIME);

    authenticator.setTokenLifetime(900);
    expect(authenticator.tokenLifetime).toBe(900);

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.tokenLifetime).toBe(900);
  });

  it('should pass all config options to token manager', () => {
    const fullConfig = {
      iamProfileId: 'some-id',
      url: 'someurl.com',
      serviceVersion: SERVICE_VERSION_2025,
      tokenLifetime: CUSTOM_TOKEN_LIFETIME,
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
      serviceVersion: SERVICE_VERSION_2025, // This would come from SERVICE_NAME_SERVICE_VERSION env var
    };

    const authenticator = new VpcInstanceAuthenticator(envConfig);

    expect(authenticator.serviceVersion).toBe(SERVICE_VERSION_2025);
    expect(authenticator.tokenManager.serviceVersion).toBe(SERVICE_VERSION_2025);
    expect(authenticator.iamProfileId).toBe('some-id');
  });

  it('should throw an error for invalid service version', () => {
    expect(
      () =>
        new VpcInstanceAuthenticator({
          serviceVersion: 'invalid-version',
        })
    ).toThrow(INVALID_SERVICE_VERSION_ERROR);
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
