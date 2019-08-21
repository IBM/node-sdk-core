'use strict';

const { NoauthAuthenticator } = require('../../auth');

describe('Noauth Authenticator', () => {
  it('should call callback on authenticate', done => {
    const authenticator = new NoauthAuthenticator();
    authenticator.authenticate({}, err => {
      expect(err).toBeNull();
      done();
    });
  });
});
