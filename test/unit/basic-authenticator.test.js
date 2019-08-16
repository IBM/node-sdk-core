'use strict';

const { BasicAuthenticator } = require('../../auth');

const USERNAME = 'dave';
const PASSWORD = 'grohl';
const CONFIG = {
  username: USERNAME,
  password: PASSWORD,
};

describe('Basic Authenticator', () => {
  it('should store the username and password on the class', () => {
    const authenticator = new BasicAuthenticator(CONFIG);

    expect(authenticator.username).toBe(USERNAME);
    expect(authenticator.password).toBe(PASSWORD);
  });

  it('should throw an error when username is not provided', () => {
    expect(() => {
      new BasicAuthenticator({ password: PASSWORD });
    }).toThrow();
  });

  it('should throw an error when password is not provided', () => {
    expect(() => {
      new BasicAuthenticator({ username: USERNAME });
    }).toThrow();
  });

  it('should throw an error when username has a bad character', () => {
    expect(() => {
      new BasicAuthenticator({ username: '"<your-username>"', password: PASSWORD });
    }).toThrow(/Revise these credentials/);
  });

  it('should throw an error when password has a bad character', () => {
    expect(() => {
      new BasicAuthenticator({ username: USERNAME, password: '{some-password}' });
    }).toThrow(/Revise these credentials/);
  });

  it('should update the options and send `null` in the callback', done => {
    const authenticator = new BasicAuthenticator(CONFIG);

    const options = {};

    authenticator.authenticate(options, err => {
      expect(err).toBeNull();
      expect(options.headers.Authorization).toBe('Basic ZGF2ZTpncm9obA==');
      done();
    });
  });
});
