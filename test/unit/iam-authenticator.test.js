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

const { Authenticator, IamAuthenticator } = require('../../dist/auth');
const { IamTokenManager } = require('../../dist/auth');

// mock the `getToken` method in the token manager - dont make any rest calls
const fakeToken = 'iam-acess-token';
const mockedTokenManager = new IamTokenManager({ apikey: '123' });

const getTokenSpy = jest
  .spyOn(mockedTokenManager, 'getToken')
  .mockImplementation(() => Promise.resolve(fakeToken));

describe('IAM Authenticator', () => {
  const config = {
    apikey: 'myapikey123',
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
    const authenticator = new IamAuthenticator(config);

    expect(authenticator.authenticationType()).toEqual(Authenticator.AUTHTYPE_IAM);
    expect(authenticator.apikey).toBe(config.apikey);
    expect(authenticator.url).toBe(config.url);
    expect(authenticator.clientId).toBe(config.clientId);
    expect(authenticator.clientSecret).toBe(config.clientSecret);
    expect(authenticator.disableSslVerification).toBe(config.disableSslVerification);
    expect(authenticator.headers).toEqual(config.headers);
    expect(authenticator.scope).toEqual(config.scope);

    // should also create a token manager
    expect(authenticator.tokenManager).toBeInstanceOf(IamTokenManager);
  });

  it('should throw an error when apikey is not provided', () => {
    expect(() => {
      const unused = new IamAuthenticator();
    }).toThrow();
  });

  it('should throw an error when apikey has a bad character', () => {
    expect(() => {
      const unused = new IamAuthenticator({ apikey: '"<your-apikey>"' });
    }).toThrow(/Revise these credentials/);
  });

  it('should update the options and resolve with `null` when `authenticate` is called', async () => {
    const authenticator = new IamAuthenticator({ apikey: 'testjustanapikey' });

    // override the created token manager with the mocked one
    authenticator.tokenManager = mockedTokenManager;

    const options = { headers: { 'X-Some-Header': 'user-supplied header' } };
    const result = await authenticator.authenticate(options);

    expect(result).toBeUndefined();
    expect(options.headers.Authorization).toBe(`Bearer ${fakeToken}`);
    expect(getTokenSpy).toHaveBeenCalled();

    // verify that the original options are kept intact
    expect(options.headers['X-Some-Header']).toBe('user-supplied header');
    // verify the scope param wasn't set
    expect(authenticator.scope).toBeUndefined();
    expect(authenticator.tokenManager.scope).toBeUndefined();
  });

  it('should re-set the client id and secret using the setter', () => {
    const authenticator = new IamAuthenticator(config);
    expect(authenticator.clientId).toBe(config.clientId);

    const newClientId = 'updated-id';
    const newClientSecret = 'updated-secret';
    authenticator.setClientIdAndSecret(newClientId, newClientSecret);
    expect(authenticator.clientId).toBe(newClientId);
    expect(authenticator.clientSecret).toBe(newClientSecret);

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.clientId).toBe(newClientId);
    expect(authenticator.tokenManager.clientSecret).toBe(newClientSecret);
  });

  it('should re-set disableSslVerification using the setter', () => {
    const authenticator = new IamAuthenticator(config);
    expect(authenticator.disableSslVerification).toBe(config.disableSslVerification);

    const newValue = false;
    authenticator.setDisableSslVerification(newValue);
    expect(authenticator.disableSslVerification).toBe(newValue);

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.disableSslVerification).toBe(newValue);
  });

  it('should re-set the headers using the setter', () => {
    const authenticator = new IamAuthenticator(config);
    expect(authenticator.headers).toEqual(config.headers);

    const newHeader = { 'X-New-Header': 'updated-header' };
    authenticator.setHeaders(newHeader);
    expect(authenticator.headers).toEqual(newHeader);

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.headers).toEqual(newHeader);
  });

  it('should re-set the scope using the setter', () => {
    const authenticator = new IamAuthenticator(config);
    expect(authenticator.headers).toEqual(config.headers);

    const newScope = 'john snow';
    authenticator.setScope(newScope);
    expect(authenticator.scope).toEqual(newScope);

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.scope).toEqual(newScope);
  });
});
