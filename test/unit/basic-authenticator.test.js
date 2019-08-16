'use strict';

const { BasicAuthenticator } = require('../../auth');

describe('Basic Authenticator', () => {
  const config = {
    username: 'dave',
    password: 'grohl',
  };

  it('should store the username and password on the class', () => {
    const authenticator = new BasicAuthenticator(config);

    expect(authenticator.username).toBe(config.username);
    expect(authenticator.password).toBe(config.password);
  });

  it('should throw an error when username is not provided', () => {
    expect(() => {
      new BasicAuthenticator({ password: '123' });
    }).toThrow();
  });

  it('should throw an error when password is not provided', () => {
    expect(() => {
      new BasicAuthenticator({ username: 'abc' });
    }).toThrow();
  });

  it('should update the options and send `null` in the callback', done => {
    const authenticator = new BasicAuthenticator(config);

    const options = {};

    authenticator.authenticate(options, err => {
      expect(err).toBeNull();
      expect(options.headers.Authorization).toBe('Basic ZGF2ZTpncm9obA==');
      done();
    });
  });
});
