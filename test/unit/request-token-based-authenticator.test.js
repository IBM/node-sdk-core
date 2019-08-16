'use strict';

const { TokenRequestBasedAuthenticator } = require('../../auth');
const { JwtTokenManagerV1 } = require('../../auth');

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
    expect(authenticator.tokenManager).toBeInstanceOf(JwtTokenManagerV1);
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
});
