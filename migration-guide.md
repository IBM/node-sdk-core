# Migration Guide for v1

## Breaking Changes

### Node Versions
Node versions 6 and 8 are no longer supported.

### Callback arguments
The old callback argument structure of `(error, body, response)` has been changed to `(error, response)`. The body is available under the `result` property of the response. The `data` property has been removed in favor of `result`.

### Authentication
Credentials are no longer passed in as constructor parameters. Rather, a single `Authenticator` is instantiated and passed in to the constructor. Example:

```js
const authenticator = new IamAuthenticator({
  apikey: 'abc-123',
});

const service = new MyService({
  authenticator,
});
```

- The method `getServiceCredentials` has been removed from the `BaseService` class. This is replaced by `getAuthenticator`, which returns the authenticator instance.
- Reading credentials from external sources (like environment variables) no longer happens for _credentials_ by default if none are passed to the `Authenticator` (The service URL can still be read automatically). The method `getAuthenticatorFromEnvironment` will return an `Authenticator` by reading from the external sources.
  - Note that this method will only read from _one external source at a time_. It will not combine credentials from multiple sources, which was the behavior previously.

#### Token Managers
- `Icp4dTokenManagerV1` renamed to `Cp4dTokenManagerV1`
- Token managers no longer support the `accessToken` parameter. There is no need for a token manager when a user is managing their own token. This behavior is replaced by the `BearerTokenAuthenticator` class.