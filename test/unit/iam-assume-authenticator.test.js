/**
 * (C) Copyright IBM Corp. 2024.
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

const { Authenticator, IamAssumeAuthenticator } = require('../../dist/auth');
const { IamAssumeTokenManager } = require('../../dist/auth');

// Mock the `getToken` method in the token manager - dont make any rest calls.
const fakeToken = 'iam-acess-token';
const mockedTokenManager = new IamAssumeTokenManager({
  apikey: 'some-key',
  iamProfileId: 'some-id',
});

const getTokenSpy = jest
  .spyOn(mockedTokenManager, 'getToken')
  .mockImplementation(() => Promise.resolve(fakeToken));

describe('IAM Assume Authenticator', () => {
  const config = {
    apikey: 'some-key',
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
    const authenticator = new IamAssumeAuthenticator(config);

    expect(authenticator.authenticationType()).toEqual(Authenticator.AUTHTYPE_IAM_ASSUME);
    expect(authenticator.url).toBe(config.url);
    expect(authenticator.clientId).toBe(config.clientId);
    expect(authenticator.clientSecret).toBe(config.clientSecret);
    expect(authenticator.disableSslVerification).toBe(config.disableSslVerification);
    expect(authenticator.headers).toEqual(config.headers);
    expect(authenticator.scope).toEqual(config.scope);

    // Should also create a token manager. Note that the options like `iamProfileId`
    // aren't stored in the authenticator, but in the token manager.
    expect(authenticator.tokenManager).toBeInstanceOf(IamAssumeTokenManager);
    expect(authenticator.tokenManager.iamProfileId).toBe(config.iamProfileId);
  });

  it('should throw an error when no api key is provided', () => {
    expect(() => {
      const unused = new IamAssumeAuthenticator();
    }).toThrow('Missing required parameters: apikey');
  });

  it('should throw an error when no profile information is provided', () => {
    expect(() => {
      const unused = new IamAssumeAuthenticator({ apikey: config.apikey });
    }).toThrow(
      'Exactly one of `iamProfileName`, `iamProfileCrn`, or `iamProfileId` must be specified.'
    );
  });

  it('should throw an error when too much profile information is provided', () => {
    expect(() => {
      const unused = new IamAssumeAuthenticator({
        apikey: config.apikey,
        iamProfileId: 'some-id',
        iamProfileCrn: 'some-crn',
      });
    }).toThrow(
      'Exactly one of `iamProfileName`, `iamProfileCrn`, or `iamProfileId` must be specified.'
    );
  });

  it('should throw an error when a profile name is provided without an account id', () => {
    expect(() => {
      const unused = new IamAssumeAuthenticator({
        apikey: config.apikey,
        iamProfileName: 'some-id',
      });
    }).toThrow('`iamProfileName` and `iamAccountId` must be provided together, or not at all');
  });

  it('should throw an error when an account id is provided without a profile name', () => {
    expect(() => {
      const unused = new IamAssumeAuthenticator({
        apikey: config.apikey,
        iamProfileId: 'some-id',
        iamAccountId: 'some-account',
      });
    }).toThrow('`iamProfileName` and `iamAccountId` must be provided together, or not at all');
  });

  // "End to end" style test, to make sure this authenticator integrates properly with parent classes.
  it('should update the options and resolve with `null` when `authenticate` is called', async () => {
    const authenticator = new IamAssumeAuthenticator({
      apikey: config.apikey,
      iamProfileId: config.iamProfileId,
    });

    // Override the created token manager with the mocked one.
    authenticator.tokenManager = mockedTokenManager;

    const options = { headers: { 'X-Some-Header': 'user-supplied header' } };
    const result = await authenticator.authenticate(options);

    expect(result).toBeUndefined();
    expect(options.headers.Authorization).toBe(`Bearer ${fakeToken}`);
    expect(getTokenSpy).toHaveBeenCalled();

    // Verify that the original options are kept intact.
    expect(options.headers['X-Some-Header']).toBe('user-supplied header');
  });
});
