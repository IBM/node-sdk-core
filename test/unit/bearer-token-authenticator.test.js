'use strict';

const { BearerTokenAuthenticator } = require('../../auth');

describe('Bearer Token Authenticator', () => {
  const config = {
    bearerToken: 'thisisthetoken',
  };

  it('should store the bearer token on the class', () => {
    const authenticator = new BearerTokenAuthenticator(config);

    expect(authenticator.bearerToken).toBe(config.bearerToken);
  });

  it('should throw an error when bearer token is not provided', () => {
    expect(() => {
      new BearerTokenAuthenticator();
    }).toThrow();
  });

  it('should update the options and send `null` in the callback', done => {
    const authenticator = new BearerTokenAuthenticator(config);

    const options = {};

    authenticator.authenticate(options, err => {
      expect(err).toBeNull();
      expect(options.headers.Authorization).toBe(`Bearer ${config.bearerToken}`);
      done();
    });
  });

  it('should re-set the bearer token using the setter', () => {
    const authenticator = new BearerTokenAuthenticator(config);
    expect(authenticator.bearerToken).toBe(config.bearerToken);

    const newToken = 'updatedtoken';
    authenticator.setBearerToken(newToken);
    expect(authenticator.bearerToken).toBe(newToken);
  });
});
