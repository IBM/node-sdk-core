'use strict';

const { TokenRequestBasedAuthenticator } = require('../../dist/auth');
const { JwtTokenManager } = require('../../dist/auth');

describe('Request Based Token Authenticator', () => {
  const config = {
    url: 'auth.com',
    disableSslVerification: true,
    headers: {
      'X-My-Header': 'some-value',
    },
  };

  it('should store all config options on the class', () => {
    const authenticator = new TokenRequestBasedAuthenticator(config);

    expect(authenticator.url).toBe(config.url);
    expect(authenticator.disableSslVerification).toBe(config.disableSslVerification);
    expect(authenticator.headers).toEqual(config.headers);

    // should also create a token manager
    expect(authenticator.tokenManager).toBeInstanceOf(JwtTokenManager);
  });

  it('should not re-set headers when a non-object is passed to the setter', () => {
    const authenticator = new TokenRequestBasedAuthenticator(config);
    expect(authenticator.headers).toEqual(config.headers);

    const badHeader = 42;
    authenticator.setHeaders(badHeader);
    expect(authenticator.headers).toEqual(config.headers);

    // also, verify that the underlying token manager has been updated
    expect(authenticator.tokenManager.headers).toEqual(config.headers);
  });

  it('should reject the Promise in authenticate with an error if the token request fails', done => {
    const authenticator = new TokenRequestBasedAuthenticator(config);
    const fakeError = new Error('fake error');
    const getTokenSpy = jest
      .spyOn(authenticator.tokenManager, 'getToken')
      .mockImplementation(() => Promise.reject(fakeError));

    authenticator.authenticate({}).then(
      res => {
        done(`Promise unexpectedly resolved with value: ${res}`);
      },
      err => {
        expect(getTokenSpy).toHaveBeenCalled();
        expect(err).toBe(fakeError);
        done();
      }
    );
  });
});
