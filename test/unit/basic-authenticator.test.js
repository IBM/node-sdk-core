'use strict';

const { BasicAuthenticator } = require('../../dist/auth');

const USERNAME = 'dave';
const PASSWORD = 'grohl';
const CONFIG = {
  username: USERNAME,
  password: PASSWORD,
};

describe('Basic Authenticator', () => {
  it('should store the username and password on the class', () => {
    const authenticator = new BasicAuthenticator(CONFIG);
    expect(authenticator.authHeader).toEqual({
      Authorization: 'Basic ZGF2ZTpncm9obA==',
    });
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

  it('should update the options and resolve the Promise with `null`', async done => {
    const authenticator = new BasicAuthenticator(CONFIG);
    const options = {};
    const result = await authenticator.authenticate(options);

    expect(result).toBeUndefined();
    expect(options.headers.Authorization).toBe('Basic ZGF2ZTpncm9obA==');
    done();
  });
});
