const { NoAuthAuthenticator } = require('../../dist/auth');

describe('NoAuth Authenticator', () => {
  it('should resolve Promise on authenticate', async (done) => {
    const authenticator = new NoAuthAuthenticator();
    const result = await authenticator.authenticate({});

    expect(result).toBeUndefined();
    done();
  });
});
