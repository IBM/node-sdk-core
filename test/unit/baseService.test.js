'use strict';

jest.mock('../../lib/requestwrapper');
const { RequestWrapper } = require('../../lib/requestwrapper');
const BaseService = require('../../lib/base_service').BaseService;
const mockSendRequest = jest.fn();

RequestWrapper.mockImplementation(() => {
  return {
    sendRequest: mockSendRequest,
  };
});
const util = require('util');

function TestService(options) {
  BaseService.call(this, options);
}
util.inherits(TestService, BaseService);
TestService.prototype.name = 'test';
TestService.prototype.version = 'v1';
TestService.URL = 'https://gateway.watsonplatform.net/test/api';

const responseMessage = 'response';

describe('BaseService', function() {
  let env;
  beforeEach(function() {
    env = process.env;
    process.env = {};
    RequestWrapper.mockClear();
  });
  afterEach(function() {
    process.env = env;
  });

  it('should fail to instantiate if the instance is not instantiated with new', () => {
    expect(() => {
      // prettier-ignore
      // eslint-disable-next-line new-cap
      BaseService({
        use_unauthenticated: true,
        version: 'v1',
      });
    }).toThrow();
  });

  it('should strip trailing slash of url during instantiation', () => {
    const testService = new TestService({
      use_unauthenticated: true,
      version: 'v1',
      url: 'https://example.ibm.com/',
    });
    expect(testService.getServiceCredentials().url).toBe('https://example.ibm.com');
  });

  it('should not fail without credentials if use_unauthenticated is true', function() {
    expect(function() {
      new TestService({
        use_unauthenticated: true,
        version: 'v1',
      });
    }).not.toThrow();
  });

  it('should fail without credentials if use_unauthenticated is false', function() {
    expect(function() {
      new TestService({
        use_unauthenticated: false,
        version: 'v1',
      });
    }).toThrow(/Insufficient credentials/);
  });

  it('should check for missing authentication', function() {
    expect(function() {
      new TestService({
        version: 'v1',
        username: 'user',
      });
    }).toThrow(/password/);

    expect(function() {
      new TestService({
        version: 'v1',
        password: 'pass',
      });
    }).toThrow(/username/);

    expect(function() {
      new TestService({
        password: 'pass',
        username: 'user',
        version: 'v1',
      });
    }).not.toThrow();
  });

  it('should support token auth', function() {
    const instance = new BaseService({ token: 'foo' });
    expect(instance._options.headers['X-Watson-Authorization-Token']).toBe('foo');
  });

  it('should return all credentials with getServiceCredentials', function() {
    const instance = new TestService({
      username: 'test',
      password: 'test',
      url: 'test',
      iam_access_token: 'test',
      iam_apikey: 'test',
      iam_url: 'test',
      iam_client_id: 'test',
      iam_client_secret: 'test',
      icp4d_access_token: 'test',
      icp4d_url: 'test',
      authentication_type: 'test',
    });
    const creds = instance.getServiceCredentials();

    expect(creds.username).toBeDefined();
    expect(creds.password).toBeDefined();
    expect(creds.url).toBeDefined();
    expect(creds.iam_access_token).toBeDefined();
    expect(creds.iam_apikey).toBeDefined();
    expect(creds.iam_url).toBeDefined();
    expect(creds.iam_client_id).toBeDefined();
    expect(creds.iam_client_secret).toBeDefined();
    expect(creds.icp4d_access_token).toBeDefined();
    expect(creds.icp4d_url).toBeDefined();
    expect(creds.authentication_type).toBeDefined();
  });

  it('should return hard-coded credentials', function() {
    const instance = new TestService({ username: 'user', password: 'pass' });
    const actual = instance.getServiceCredentials();
    const expected = {
      username: 'user',
      password: 'pass',
      url: 'https://gateway.watsonplatform.net/test/api',
    };
    expect(actual).toEqual(expected);
  });

  it('should return all credentials and url from the environment', function() {
    process.env.TEST_USERNAME = 'test';
    process.env.TEST_PASSWORD = 'test';
    process.env.TEST_URL = 'http://foo';
    process.env.TEST_API_KEY = 'test';
    process.env.TEST_IAM_ACCESS_TOKEN = 'test';
    process.env.TEST_IAM_APIKEY = 'test';
    process.env.TEST_IAM_URL = 'test';
    process.env.TEST_IAM_CLIENT_ID = 'test';
    process.env.TEST_IAM_CLIENT_SECRET = 'test';
    process.env.TEST_ICP4D_ACCESS_TOKEN = 'test';
    process.env.TEST_ICP4D_URL = 'test';
    process.env.TEST_AUTHENTICATION_TYPE = 'test';

    const instance = new TestService();
    const actual = instance.getServiceCredentials();
    const expected = {
      username: 'test',
      password: 'test',
      url: 'http://foo',
      iam_access_token: 'test',
      iam_apikey: 'test',
      iam_url: 'test',
      iam_client_id: 'test',
      iam_client_secret: 'test',
      icp4d_access_token: 'test',
      icp4d_url: 'test',
      authentication_type: 'test',
    };
    expect(actual).toEqual(expected);
  });

  it('should allow mixing credentials from the environment and the default url', function() {
    process.env.TEST_USERNAME = 'env_user';
    process.env.TEST_PASSWORD = 'env_pass';
    const instance = new TestService();
    const actual = instance.getServiceCredentials();
    const expected = {
      username: 'env_user',
      password: 'env_pass',
      url: 'https://gateway.watsonplatform.net/test/api',
    };
    expect(actual).toEqual(expected);
  });

  it('should return credentials from VCAP_SERVICES', function() {
    process.env.VCAP_SERVICES = JSON.stringify({
      test: [
        {
          credentials: {
            password: 'vcap_pass',
            url: 'https://gateway.watsonplatform.net/test/api',
            username: 'vcap_user',
          },
        },
      ],
    });
    const instance = new TestService();
    const actual = instance.getServiceCredentials();
    const expected = {
      username: 'vcap_user',
      password: 'vcap_pass',
      url: 'https://gateway.watsonplatform.net/test/api',
    };
    expect(actual).toEqual(expected);
  });

  it('should handle iam apikey credential from VCAP_SERVICES', function() {
    process.env.VCAP_SERVICES = JSON.stringify({
      test: [
        {
          credentials: {
            apikey: '123456789',
            iam_apikey_description: 'Auto generated apikey...',
            iam_apikey_name: 'auto-generated-apikey-111-222-333',
            iam_role_crn: 'crn:v1:bluemix:public:iam::::serviceRole:Manager',
            iam_serviceid_crn: 'crn:v1:staging:public:iam-identity::a/::serviceid:ServiceID-1234',
            url: 'https://gateway.watsonplatform.net/test/api',
          },
        },
      ],
    });
    const instance = new TestService();
    const actual = instance.getServiceCredentials();
    const expected = {
      iam_apikey: '123456789',
      url: 'https://gateway.watsonplatform.net/test/api',
    };
    expect(actual).toEqual(expected);
    expect(instance.tokenManager).toBeDefined();
    expect(instance.tokenManager).not.toBeNull();
  });

  it('should prefer hard-coded credentials over ibm credentials file', function() {
    process.env.IBM_CREDENTIALS_FILE = __dirname + '/../resources/ibm-credentials.env';
    const instance = new TestService({ username: 'user', password: 'pass' });
    const actual = instance.getServiceCredentials();
    const expected = {
      username: 'user',
      password: 'pass',
      url: 'https://gateway.watsonplatform.net/test/api',
    };
    expect(actual).toEqual(expected);
  });

  it('should prefer ibm credentials file over environment properties', function() {
    process.env.IBM_CREDENTIALS_FILE = __dirname + '/../resources/ibm-credentials.env';
    process.env.TEST_USERNAME = 'env_user';
    process.env.TEST_PASSWORD = 'env_pass';
    const instance = new TestService();
    const actual = instance.getServiceCredentials();
    const expected = {
      username: '123456789',
      password: 'abcd',
      url: 'https://gateway.watsonplatform.net/test/api',
    };
    expect(actual).toEqual(expected);
  });

  it('should prefer environment properties over vcap_services', function() {
    process.env.VCAP_SERVICES = JSON.stringify({
      test: [
        {
          credentials: {
            password: 'vcap_pass',
            url: 'https://gateway.watsonplatform.net/test/api',
            username: 'vcap_user',
          },
        },
      ],
    });
    process.env.TEST_USERNAME = 'env_user';
    process.env.TEST_PASSWORD = 'env_pass';
    const instance = new TestService();
    const actual = instance.getServiceCredentials();
    const expected = {
      username: 'env_user',
      password: 'env_pass',
      url: 'https://gateway.watsonplatform.net/test/api',
    };
    expect(actual).toEqual(expected);
  });

  it('should set authorization header after getting a token from the token manager', function(done) {
    const instance = new TestService({ iam_apikey: 'abcd-1234' });
    const accessToken = '567890';
    const parameters = {
      defaultOptions: {
        headers: {},
      },
    };

    const getTokenMock = jest.spyOn(instance.tokenManager, 'getToken');
    getTokenMock.mockImplementation(cb => {
      cb(null, accessToken);
    });

    mockSendRequest.mockImplementation((param, callback) => {
      callback(null, responseMessage);
    });

    instance.createRequest(parameters, function(err, res) {
      const authHeader = mockSendRequest.mock.calls[0][0].defaultOptions.headers.Authorization;
      expect(`Bearer ${accessToken}`).toBe(authHeader);
      expect(res).toBe(responseMessage);

      getTokenMock.mockReset();
      mockSendRequest.mockClear();
      done();
    });
  });

  it('should send an error back to the user if the token request went bad', function(done) {
    const instance = new TestService({ iam_apikey: 'abcd-1234' });
    const errorMessage = 'Error in the token request.';

    const getTokenMock = jest.spyOn(instance.tokenManager, 'getToken');
    getTokenMock.mockImplementation(cb => {
      cb(errorMessage);
    });

    instance.createRequest({}, function(err, res) {
      expect(err).toBe(errorMessage);
      expect(mockSendRequest).not.toHaveBeenCalled();
      getTokenMock.mockReset();
      done();
    });
  });

  it('should call sendRequest right away if token manager is null', function(done) {
    const instance = new TestService({ username: 'user', password: 'pass' });
    instance.createRequest({}, function(err, res) {
      expect(res).toBe(responseMessage);
      expect(instance.tokenManager).toBeNull();
      done();
    });
  });

  it('should pass all credentials to token manager when given iam creds', function() {
    const instance = new TestService({
      iam_apikey: 'key1234',
      iam_access_token: 'real-token-84',
      iam_url: 'iam.com/api',
      iam_client_id: 'abc',
      iam_client_secret: 'abc',
    });

    expect(instance.tokenManager).toBeDefined();
    expect(instance.tokenManager).not.toBeNull();
    expect(instance.tokenManager.iamApikey).toBeDefined();
    expect(instance.tokenManager.userAccessToken).toBeDefined();
    expect(instance.tokenManager.url).toBeDefined();
    expect(instance.tokenManager.iamClientId).toBeDefined();
    expect(instance.tokenManager.iamClientSecret).toBeDefined();
  });

  it('should pass all credentials to token manager when given iam with basic', function() {
    const instance = new TestService({
      username: 'apikey',
      password: 'key1234',
      iam_url: 'iam.com/api',
      iam_client_id: 'abc',
      iam_client_secret: 'abc',
    });

    expect(instance.tokenManager).toBeDefined();
    expect(instance.tokenManager).not.toBeNull();
    expect(instance.tokenManager.iamApikey).toBeDefined();
    expect(instance.tokenManager.url).toBeDefined();
    expect(instance.tokenManager.iamClientId).toBeDefined();
    expect(instance.tokenManager.iamClientSecret).toBeDefined();
  });

  it('should not fail if setAccessToken is called and token manager is null', function() {
    const instance = new TestService({ username: 'user', password: 'pass' });
    expect(instance.tokenManager).toBeNull();

    instance.setAccessToken('abcd-1234');
    expect(instance.tokenManager).toBeDefined();
    expect(instance.tokenManager).not.toBeNull();
  });

  it('should create an icp4d token manager if setAccessToken is called and auth type is `icp4d`', function() {
    const instance = new TestService({
      username: 'user',
      password: 'pass',
      url: 'service.com',
    });
    expect(instance.tokenManager).toBeNull();

    // this is sort of a bizarre use case...
    instance._options.authentication_type = 'icp4d';

    instance.setAccessToken('abcd-1234');
    expect(instance.tokenManager).toBeDefined();
    expect(instance.tokenManager).not.toBeNull();
  });

  it('should create a token manager instance if env variables specify iam credentials', function() {
    process.env.TEST_IAM_APIKEY = 'test1234';
    const instance = new TestService();
    const actual = instance.getServiceCredentials();
    const expected = {
      iam_apikey: 'test1234',
      url: 'https://gateway.watsonplatform.net/test/api',
    };
    expect(actual).toEqual(expected);
    expect(instance.tokenManager).toBeDefined();
    expect(instance.tokenManager).not.toBeNull();
  });

  it('should create a iam token manger instance if env variables specify apikey credential', function() {
    process.env.TEST_APIKEY = 'test1234';
    const instance = new TestService();
    const actual = instance.getServiceCredentials();
    const expected = {
      iam_apikey: 'test1234',
      url: 'https://gateway.watsonplatform.net/test/api',
    };
    expect(actual).toEqual(expected);
    expect(instance.tokenManager).toBeDefined();
    expect(instance.tokenManager).not.toBeNull();
  });

  it('should create a token manager instance if username is `apikey` and use the password as the API key', function() {
    const apikey = 'abcd-1234';
    const instance = new TestService({
      username: 'apikey',
      password: apikey,
    });
    expect(instance.tokenManager).toBeDefined();
    expect(instance.tokenManager).not.toBeNull();
    expect(instance.tokenManager.iamApikey).toBe(apikey);
    expect(instance._options.headers).toBeUndefined();
  });

  it('should create an iam token manager instance if authentication_type is `iam`', function() {
    const apikey = 'abcd-1234';
    const instance = new TestService({
      authentication_type: 'iam',
      iam_apikey: apikey,
    });
    expect(instance.tokenManager).toBeDefined();
    expect(instance.tokenManager).not.toBeNull();
    expect(instance.tokenManager.iamApikey).toBe(apikey);
    expect(instance._options.headers).toBeUndefined();
  });

  it('should create an icp4d token manager instance if authentication_type is `icp4d`', function() {
    const instance = new TestService({
      authentication_type: 'ICP4D', // using all caps to prove case insensitivity
      username: 'test',
      password: 'test',
      url: 'service.com/api',
      icp4d_url: 'host.com:1234',
    });
    expect(instance.tokenManager).toBeDefined();
    expect(instance.tokenManager).not.toBeNull();
    expect(instance._options.headers).toBeUndefined();
  });

  it('should create an icp4d token manager instance if given icp4d_access_token', function() {
    const instance = new TestService({
      icp4d_access_token: 'test',
      url: 'service.com',
    });
    expect(instance.tokenManager).toBeDefined();
    expect(instance.tokenManager).not.toBeNull();
    expect(instance._options.headers).toBeUndefined();
  });

  it('should throw an error if an icp4d url is not given when using sdk-managed tokens', function() {
    expect(() => {
      new TestService({
        username: 'test',
        password: 'test',
        authentication_type: 'icp4d',
        url: 'service.com',
      });
    }).toThrow();
  });

  it('should not throw an error if an icp4d url is missing when using user-managed tokens', function() {
    const instance = new TestService({
      icp4d_access_token: 'test',
      url: 'service.com',
    });
    expect(instance.tokenManager).toBeDefined();
    expect(instance.tokenManager).not.toBeNull();
    expect(instance._options.headers).toBeUndefined();
  });

  it('should not create a basic auth header if iam creds are given', function() {
    const apikey = 'abcd-1234';
    const instance = new TestService({
      iam_apikey: apikey,
      username: 'notarealuser',
      password: 'badpassword1',
    });
    expect(instance.tokenManager).toBeDefined();
    expect(instance.tokenManager).not.toBeNull();
    expect(instance.tokenManager.iamApikey).toBe(apikey);
    expect(instance._options.headers).toBeUndefined();
  });

  it('should create a basic auth header if username is `apikey` and password starts with `icp-`', function() {
    const instance = new TestService({
      username: 'apikey',
      password: 'icp-1234',
    });
    const authHeader = instance._options.headers.Authorization;
    expect(instance.tokenManager).toBeNull();
    expect(authHeader.startsWith('Basic')).toBe(true);
  });

  it('should set rejectUnauthorized to `false` if `disable_ssl_verification` is `true`', function() {
    const instance = new TestService({
      username: 'apikey',
      password: 'icp-1234',
      disable_ssl_verification: true,
    });
    expect(instance._options.rejectUnauthorized).toBe(false);
  });

  it('should set rejectUnauthorized to `true` if `disable_ssl_verification` is `false`', function() {
    const instance = new TestService({
      username: 'apikey',
      password: 'icp-1234',
      disable_ssl_verification: false,
    });
    expect(instance._options.rejectUnauthorized).toBe(true);
  });

  it('should set rejectUnauthorized to `true` if `disable_ssl_verification` is not set', function() {
    const instance = new TestService({
      username: 'apikey',
      password: 'icp-1234',
    });
    expect(instance._options.rejectUnauthorized).toBe(true);
  });

  it('should convert an iam_apikey that starts with "icp-" to basic auth', () => {
    const icpKey = 'icp-1234';
    const instance = new TestService({
      iam_apikey: icpKey,
      username: 'thiswillbegone',
      password: 'thiswillbegone',
    });

    const authHeader = instance._options.headers.Authorization;

    expect(instance._options.username).toBe('apikey');
    expect(instance._options.password).toBe(icpKey);
    expect(instance._options.iam_apikey).not.toBeDefined();
    expect(instance.tokenManager).toBeNull();
    expect(authHeader.startsWith('Basic')).toBe(true);
  });

  it('should convert authentication_type to lower case', function() {
    const instance = new TestService({
      authentication_type: 'ICP4D',
      icp4d_access_token: 'abc123',
      url: 'someservice.com',
    });

    expect(instance._options.authentication_type).toBe('icp4d');
  });

  describe('check credentials for common problems', function() {
    function assertConstructorThrows(params) {
      expect(() => {
        new TestService(params);
      }).toThrowError(
        'Revise these credentials - they should not start or end with curly brackets or quotes.'
      );
    }

    it('should throw when username starts with {', function() {
      assertConstructorThrows({
        username: '{batman}',
        password: 'goodpass',
      });
    });

    it('should throw when username starts with "', function() {
      assertConstructorThrows({
        username: '"<batman">',
        password: 'goodpass',
      });
    });

    it('should throw when password starts with {', function() {
      assertConstructorThrows({
        username: 'batman',
        password: '{badpass}',
      });
    });

    it('should throw when password starts with "', function() {
      assertConstructorThrows({
        username: 'batman',
        password: '"badpass"',
      });
    });

    it('should throw when iam_apikey starts with {', function() {
      assertConstructorThrows({
        iam_apikey: '{abc123}',
      });
    });

    it('should throw when iam_apikey starts with "', function() {
      assertConstructorThrows({
        iam_apikey: '"<abc123',
      });
    });

    it('should throw when url starts with {', function() {
      assertConstructorThrows({
        username: 'batman',
        password: 'goodpass',
        url: '{watson-url}/some-api/v1/endpoint',
      });
    });

    it('should throw when url ends with }', function() {
      assertConstructorThrows({
        username: 'batman',
        password: 'goodpass',
        url: 'watson-url.com/some-api/v1/endpoint}',
      });
    });

    it('should throw when url starts with "', function() {
      assertConstructorThrows({
        username: 'batman',
        password: 'goodpass',
        url: '"watson-url.com/some-api/v1/endpoint',
      });
    });

    it('should throw when mutiple creds are bad', function() {
      assertConstructorThrows({
        username: '{batman}',
        password: '"<badpass>"',
        url: '{watson-url}/some-api/v1/endpoint',
      });
    });
  });
});
