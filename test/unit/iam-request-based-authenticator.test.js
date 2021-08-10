const { IamRequestBasedAuthenticator, IamRequestBasedTokenManager } = require('../../dist/auth');

const SCOPE = 'some-scope';
const CLIENT_ID = 'some-id';
const CLIENT_SECRET = 'some-secret';

describe('IAM Request Based Authenticator', () => {
  describe('constructor', () => {
    it('should store all config options on the class', () => {
      const authenticator = new IamRequestBasedAuthenticator({
        scope: SCOPE,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
      });

      expect(authenticator.clientId).toBe(CLIENT_ID);
      expect(authenticator.clientSecret).toBe(CLIENT_SECRET);
      expect(authenticator.scope).toEqual(SCOPE);

      // should also create a token manager
      expect(authenticator.tokenManager).toBeInstanceOf(IamRequestBasedTokenManager);
    });
  });

  describe('setters', () => {
    it('should re-set the scope using the setter', () => {
      const authenticator = new IamRequestBasedAuthenticator();
      expect(authenticator.scope).toBeUndefined();

      expect(authenticator.tokenManager.scope).toBeUndefined();

      authenticator.setScope(SCOPE);
      expect(authenticator.scope).toEqual(SCOPE);

      // also, verify that the underlying token manager has been updated
      expect(authenticator.tokenManager.scope).toEqual(SCOPE);
    });

    it('should re-set the client id and secret using the setter', () => {
      const authenticator = new IamRequestBasedAuthenticator();
      expect(authenticator.clientId).toBeUndefined();
      expect(authenticator.clientSecret).toBeUndefined();

      expect(authenticator.tokenManager.clientId).toBeUndefined();
      expect(authenticator.tokenManager.clientSecret).toBeUndefined();

      authenticator.setClientIdAndSecret(CLIENT_ID, CLIENT_SECRET);
      expect(authenticator.clientId).toEqual(CLIENT_ID);
      expect(authenticator.clientSecret).toEqual(CLIENT_SECRET);

      // also, verify that the underlying token manager has been updated
      expect(authenticator.tokenManager.clientId).toEqual(CLIENT_ID);
      expect(authenticator.tokenManager.clientSecret).toEqual(CLIENT_SECRET);
    });
  });
});
