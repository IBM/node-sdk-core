'use strict';

const { CloudPakForDataAuthenticator } = require('../../auth');
const { Cp4dTokenManagerV1 } = require('../../auth');

// mock the `getToken` method in the token manager - dont make any rest calls
const fakeToken = 'iam-acess-token';
const mockedTokenManager = new Cp4dTokenManagerV1({
  username: 'abc',
  password: '123',
  url: 'myicp.com:1234',
});
const getTokenSpy = jest.spyOn(mockedTokenManager, 'getToken').mockImplementation(callback => {
  callback(null, fakeToken);
});

describe('CP4D Authenticator', () => {
  const config = {
    username: 'danmullen',
    password: 'gogators',
    url: 'myicp.com:1234',
    disableSslVerification: true,
    headers: {
      'X-My-Header': 'some-value',
    },
  };

  it('should store all config options on the class', () => {
    const authenticator = new CloudPakForDataAuthenticator(config);

    expect(authenticator.username).toBe(config.username);
    expect(authenticator.password).toBe(config.password);
    expect(authenticator.url).toBe(config.url);
    expect(authenticator.disableSslVerification).toBe(config.disableSslVerification);
    expect(authenticator.headers).toEqual(config.headers);

    // should also create a token manager
    expect(authenticator.tokenManager).toBeInstanceOf(Cp4dTokenManagerV1);
  });

  it('should throw an error when username is not provided', () => {
    expect(() => {
      new CloudPakForDataAuthenticator({ password: '123' });
    }).toThrow();
  });

  it('should throw an error when password is not provided', () => {
    expect(() => {
      new CloudPakForDataAuthenticator({ username: 'abc' });
    }).toThrow();
  });

  it('should throw an error when url is not provided', () => {
    expect(() => {
      new CloudPakForDataAuthenticator({ password: '123', username: 'abc' });
    }).toThrow();
  });

  it('should update the options and send `null` in the callback', done => {
    const authenticator = new CloudPakForDataAuthenticator(config);

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

  it('should re-set disableSslVerification using the setter', () => {
    const authenticator = new CloudPakForDataAuthenticator(config);
    expect(authenticator.disableSslVerification).toBe(config.disableSslVerification);

    const newValue = false;
    authenticator.setDisableSslVerification(newValue);
    expect(authenticator.disableSslVerification).toBe(newValue);

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.disableSslVerification).toBe(newValue);
  });

  it('should re-set the headers using the setter', () => {
    const authenticator = new CloudPakForDataAuthenticator(config);
    expect(authenticator.headers).toEqual(config.headers);

    const newHeader = { 'X-New-Header': 'updated-header' };
    authenticator.setHeaders(newHeader);
    expect(authenticator.headers).toEqual(newHeader);

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.headers).toEqual(newHeader);
  });
});
