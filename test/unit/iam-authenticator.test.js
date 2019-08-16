'use strict';

const { IamAuthenticator } = require('../../auth');
const { IamTokenManagerV1 } = require('../../auth');

// mock the `getToken` method in the token manager - dont make any rest calls
const fakeToken = 'iam-acess-token';
const mockedTokenManager = new IamTokenManagerV1({ apikey: '123' });
const getTokenSpy = jest.spyOn(mockedTokenManager, 'getToken').mockImplementation(callback => {
  callback(null, fakeToken);
});

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
  };

  it('should store all config options on the class', () => {
    const authenticator = new IamAuthenticator(config);

    expect(authenticator.apikey).toBe(config.apikey);
    expect(authenticator.url).toBe(config.url);
    expect(authenticator.clientId).toBe(config.clientId);
    expect(authenticator.clientSecret).toBe(config.clientSecret);
    expect(authenticator.disableSslVerification).toBe(config.disableSslVerification);
    expect(authenticator.headers).toEqual(config.headers);

    // should also create a token manager
    expect(authenticator.tokenManager).toBeInstanceOf(IamTokenManagerV1);
  });

  it('should throw an error when apikey is not provided', () => {
    expect(() => {
      new IamAuthenticator();
    }).toThrow();
  });

  it('should update the options and send `null` in the callback', done => {
    const authenticator = new IamAuthenticator({ apikey: 'testjustanapikey' });

    // override the created token manager with the mocked one
    authenticator.tokenManager = mockedTokenManager;

    const options = { headers: { 'X-Some-Header': 'user-supplied header' } };

    authenticator.authenticate(options, err => {
      expect(err).toBeNull();
      expect(options.headers.Authorization).toBe(`Bearer ${fakeToken}`);
      expect(getTokenSpy).toHaveBeenCalled();

      // verify that the original options are kept intact
      expect(options.headers['X-Some-Header']).toBe('user-supplied header');
      done();
    });
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
});
