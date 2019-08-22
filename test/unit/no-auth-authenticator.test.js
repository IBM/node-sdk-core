'use strict';

const { NoAuthAuthenticator } = require('../../auth');

describe('NoAuth Authenticator', () => {
  it('should call callback on authenticate', done => {
    const authenticator = new NoAuthAuthenticator();
    authenticator.authenticate({}, err => {
      expect(err).toBeNull();
      done();
    });
  });
});
