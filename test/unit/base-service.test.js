const util = require('util');

// create a mock for the read-external-sources module
const readExternalSourcesModule = require('../../dist/auth/utils/read-external-sources');

readExternalSourcesModule.readExternalSources = jest.fn();
const readExternalSourcesMock = readExternalSourcesModule.readExternalSources;

// mock the request wrapper
const requestWrapperLocation = '../../dist/lib/request-wrapper';
jest.mock(requestWrapperLocation);
const { RequestWrapper } = require(requestWrapperLocation);
const sendRequestMock = jest.fn();
const getHttpClientMock = jest.fn().mockImplementation(() => 'axios');
const setCompressRequestDataMock = jest.fn();
const enableRetriesMock = jest.fn();
const disableRetriesMock = jest.fn();

RequestWrapper.mockImplementation(() => ({
  sendRequest: sendRequestMock,
  getHttpClient: getHttpClientMock,
  setCompressRequestData: setCompressRequestDataMock,
  enableRetries: enableRetriesMock,
  disableRetries: disableRetriesMock,
}));

// mock the authenticator
const noAuthLocation = '../../dist/auth/authenticators/no-auth-authenticator';
jest.mock(noAuthLocation);
const { NoAuthAuthenticator } = require(noAuthLocation);
const authenticateMock = jest.fn();

NoAuthAuthenticator.mockImplementation(() => ({
  authenticate: authenticateMock,
}));

// mocks need to happen before this is imported
const { BaseService } = require('../../dist/lib/base-service');

// constants
const DEFAULT_URL = 'https://gateway.watsonplatform.net/test/api';
const DEFAULT_NAME = 'test';
const AUTHENTICATOR = new NoAuthAuthenticator();
const EMPTY_OBJECT = {}; // careful that nothing is ever added to this object

setupFakeService(); // set up the TestService "class"

describe('Base Service', () => {
  // setup
  beforeEach(() => {
    // set defualt mocks, these may be overridden in the individual tests
    readExternalSourcesMock.mockImplementation(() => EMPTY_OBJECT);
    authenticateMock.mockImplementation(() => Promise.resolve(null));
  });

  afterEach(() => {
    // clear and the metadata attached to the mocks
    sendRequestMock.mockClear();
    getHttpClientMock.mockClear();
    RequestWrapper.mockClear();
    setCompressRequestDataMock.mockClear();
    enableRetriesMock.mockClear();
    disableRetriesMock.mockClear();
    // also, reset the implementation of the readExternalSourcesMock
    readExternalSourcesMock.mockReset();
    authenticateMock.mockReset();
    delete process.env.ENABLE_RETRIES;
    delete process.env.MAX_RETRIES;
    delete process.env.RETRY_INTERVAL;
  });

  // tests
  it('should throw an error if the instance is not instantiated with new', () => {
    expect(() => {
      // prettier-ignore
      // eslint-disable-next-line new-cap
      BaseService({
        authenticator: AUTHENTICATOR,
      });
    }).toThrow();
  });

  it('should strip trailing slash of serviceUrl during instantiation', () => {
    const testService = new TestService({
      authenticator: AUTHENTICATOR,
      serviceUrl: 'https://example.ibm.com/',
    });

    expect(testService.baseOptions.serviceUrl).toBe('https://example.ibm.com');

    testService.setServiceUrl('https://example.ibm.com/withSlash/');

    expect(testService.baseOptions.serviceUrl).toBe('https://example.ibm.com/withSlash');
  });

  it('should accept `url` instead of `serviceUrl` for compaitiblity', () => {
    const testService = new TestService({
      authenticator: AUTHENTICATOR,
      url: 'https://example.ibm.com/',
    });

    expect(testService.baseOptions.serviceUrl).toBe('https://example.ibm.com');
  });

  it('should support setting the service url after instantiation', () => {
    const testService = new TestService({
      authenticator: AUTHENTICATOR,
    });

    expect(testService.baseOptions.serviceUrl).toBe(DEFAULT_URL);

    const newUrl = 'new.com';
    testService.setServiceUrl(newUrl);
    expect(testService.baseOptions.serviceUrl).toBe(newUrl);
  });

  it('should support enabling gzip compression after instantiation', () => {
    const testService = new TestService({
      authenticator: AUTHENTICATOR,
    });

    expect(testService.baseOptions.enableGzipCompression).toBeFalsy();

    const on = true;
    testService.setEnableGzipCompression(on);
    expect(setCompressRequestDataMock).toHaveBeenCalledWith(on);
    expect(testService.baseOptions.enableGzipCompression).toBe(on);

    setCompressRequestDataMock.mockClear();
    const off = false;
    testService.setEnableGzipCompression(off);
    expect(setCompressRequestDataMock).toHaveBeenCalledWith(off);
    expect(testService.baseOptions.enableGzipCompression).toBe(off);
  });

  it('should throw an error if an authenticator is not passed in', () => {
    expect(() => new TestService()).toThrow();
  });

  it('should return the stored authenticator with getAuthenticator', () => {
    const testService = new TestService({
      authenticator: AUTHENTICATOR,
    });

    expect(testService.getAuthenticator()).toEqual(AUTHENTICATOR);
  });

  it('should return the stored, underlying axios instance with getHttpClient', () => {
    const testService = new TestService({
      authenticator: AUTHENTICATOR,
    });

    const httpClient = testService.getHttpClient();

    // the request wrapper instance is mocked to return the literal string 'axios'
    expect(httpClient).toEqual('axios');
    expect(getHttpClientMock).toHaveBeenCalled();
  });

  it('should store disableSslVerification when set', () => {
    const testService = new TestService({
      authenticator: AUTHENTICATOR,
      disableSslVerification: true,
    });

    expect(testService.baseOptions.disableSslVerification).toBe(true);
  });

  it('should store a cookie jar when set', () => {
    const testService = new TestService({
      authenticator: AUTHENTICATOR,
      jar: true,
    });

    expect(testService.baseOptions.jar).toBe(true);
  });

  it('should default disableSslVerification to false', () => {
    const testService = new TestService({
      authenticator: AUTHENTICATOR,
      disableSslVerification: 'true', // "truthy" values should not set this property
    });

    expect(testService.baseOptions.disableSslVerification).toBe(false);
  });

  it('should pass user given options to the request wrapper', () => {
    const unused = new TestService({
      authenticator: AUTHENTICATOR,
      proxy: false,
    });

    expect(RequestWrapper.mock.calls[0][0]).toEqual({
      authenticator: AUTHENTICATOR,
      disableSslVerification: false,
      proxy: false,
      serviceUrl: DEFAULT_URL,
      qs: EMPTY_OBJECT,
    });
  });

  it('should create the qs object', () => {
    const testService = new TestService({
      authenticator: AUTHENTICATOR,
    });

    expect(testService.baseOptions.qs).toBeDefined();
    expect(testService.baseOptions.qs).toEqual(EMPTY_OBJECT);
  });

  it('should use the default service serviceUrl', () => {
    const testService = new TestService({
      authenticator: AUTHENTICATOR,
    });

    expect(testService.baseOptions.serviceUrl).toBe(DEFAULT_URL);
  });

  it('should read serviceUrl and disableSslVerification from env', () => {
    const serviceUrl = 'abc123.com';
    const disableSsl = true;

    readExternalSourcesMock.mockImplementation(() => ({
      url: serviceUrl,
      disableSsl,
    }));

    const testService = new TestService({
      authenticator: AUTHENTICATOR,
    });

    const fromCredsFile = testService.readOptionsFromExternalConfig(DEFAULT_NAME);

    expect(fromCredsFile.serviceUrl).toBe(serviceUrl);
    expect(fromCredsFile.disableSslVerification).toBe(disableSsl);
    expect(readExternalSourcesMock).toHaveBeenCalled();
    expect(readExternalSourcesMock.mock.calls[0][0]).toBe(DEFAULT_NAME);
  });

  it('should build the base options without configuring service from external sources', () => {
    readExternalSourcesMock.mockImplementation(() => ({
      disableSsl: true,
    }));

    const testService = new TestService({
      authenticator: AUTHENTICATOR,
      serviceUrl: 'withtrailingslash.com/api/',
      proxy: false,
    });

    expect(testService.baseOptions).toEqual({
      serviceUrl: 'withtrailingslash.com/api',
      disableSslVerification: false,
      proxy: false,
      qs: EMPTY_OBJECT,
      authenticator: AUTHENTICATOR,
    });
    expect(readExternalSourcesMock).toHaveBeenCalledTimes(0);
  });

  it('should send the default options to the authenticate method', () => {
    const testService = new TestService({
      authenticator: AUTHENTICATOR,
    });

    const parameters = {
      defaultOptions: {
        serviceUrl: DEFAULT_URL,
        Accept: 'application/json',
      },
      options: {
        url: '/v2/assistants/{assistant_id}/sessions',
        method: 'POST',
        path: {
          id: '123',
        },
      },
    };

    testService.createRequest(parameters);
    const args = authenticateMock.mock.calls[0];

    expect(authenticateMock).toHaveBeenCalled();
    expect(args[0]).toEqual(parameters.defaultOptions);
  });

  it('should call sendRequest on authenticate() success', async (done) => {
    const testService = new TestService({
      authenticator: AUTHENTICATOR,
    });

    const parameters = {
      defaultOptions: {
        serviceUrl: DEFAULT_URL,
        Accept: 'application/json',
      },
      options: {
        url: '/v2/assistants/{assistant_id}/sessions',
        method: 'POST',
        path: {
          id: '123',
        },
      },
    };

    await testService.createRequest(parameters);

    expect(authenticateMock).toHaveBeenCalled();
    expect(sendRequestMock).toHaveBeenCalled();

    const args = sendRequestMock.mock.calls[0];
    expect(args[0]).toEqual(parameters);
    expect(testService.requestWrapperInstance.sendRequest).toBe(sendRequestMock); // verify it is calling the instance
    done();
  });

  it('createRequest should reject with an error if `serviceUrl` is not set', async (done) => {
    const testService = new TestService({
      authenticator: AUTHENTICATOR,
    });
    testService.setServiceUrl(undefined);

    const parameters = {
      defaultOptions: {
        body: 'post=body',
        formData: '',
        qs: {},
        method: 'POST',
        headers: {
          'test-header': 'test-header-value',
        },
        responseType: 'buffer',
      },
    };

    let res;
    let err;
    try {
      res = await testService.createRequest(parameters);
    } catch (e) {
      err = e;
    }

    // assert results
    expect(err).toBeInstanceOf(Error);
    expect(res).toBeUndefined();
    done();
  });

  it('should send error back to user on authenticate() failure', async (done) => {
    const testService = new TestService({
      authenticator: AUTHENTICATOR,
    });

    // note that the NoAuthAuthenticator can't actually reject with an error,
    // but others can
    const fakeError = new Error('token request failed');
    authenticateMock.mockImplementation(() => Promise.reject(fakeError));

    const parameters = {
      defaultOptions: {
        serviceUrl: 'https://foo.bar.baz/api',
      },
    };

    let err;
    try {
      await testService.createRequest(parameters);
    } catch (e) {
      err = e;
    }

    expect(err).toBe(fakeError);
    expect(authenticateMock).toHaveBeenCalled();
    done();
  });

  it('readOptionsFromExternalConfig should return an empty object if no properties are found', () => {
    readExternalSourcesMock.mockImplementation(() => null);
    const testService = new TestService({
      authenticator: AUTHENTICATOR,
    });

    expect(testService.readOptionsFromExternalConfig()).toEqual(EMPTY_OBJECT);
  });

  it('should check serviceUrl for common problems', () => {
    expect(() => {
      const unused = new TestService({
        authenticator: AUTHENTICATOR,
        serviceUrl: 'myapi.com/{instanceId}',
      });
    }).toThrow(/Revise these credentials/);
  });

  it('should have the default baseOptions values when instantiating', () => {
    const testService = new TestService({
      authenticator: AUTHENTICATOR,
    });
    expect(testService.baseOptions.serviceUrl).toEqual(DEFAULT_URL);
    expect(testService.baseOptions.disableSslVerification).toEqual(false);
    expect(testService.baseOptions.qs).toBeDefined();
    expect(testService.baseOptions.qs).toEqual(EMPTY_OBJECT);
  });

  it('should configure service by calling configureService method after instantiating', () => {
    const testService = new TestService({
      authenticator: AUTHENTICATOR,
    });

    expect(testService.baseOptions.serviceUrl).toEqual(
      'https://gateway.watsonplatform.net/test/api'
    );
    expect(testService.baseOptions.disableSslVerification).toEqual(false);

    readExternalSourcesMock.mockImplementation(() => ({
      url: 'abc123.com',
      disableSsl: true,
      enableGzip: true,
    }));

    testService.configureService(DEFAULT_NAME);

    expect(readExternalSourcesMock).toHaveBeenCalled();
    expect(testService.baseOptions.serviceUrl).toEqual('abc123.com');
    expect(testService.baseOptions.disableSslVerification).toEqual(true);
    expect(testService.baseOptions.enableGzipCompression).toEqual(true);
  });

  it('should configure service and enable retries when environment variables used', () => {
    const testService = new TestService({
      authenticator: AUTHENTICATOR,
    });

    process.env.ENABLE_RETRIES = true;
    process.env.MAX_RETRIES = 10;
    process.env.RETRY_INTERVAL = 35;

    testService.configureService(DEFAULT_NAME);

    expect(enableRetriesMock).toHaveBeenCalledWith({ maxRetries: 10, maxRetryInterval: 35 });
  });

  it('should enable retries with empty config with no MAX_RETRIES nor RETRY_INTERVAL', () => {
    const testService = new TestService({
      authenticator: AUTHENTICATOR,
    });

    process.env.ENABLE_RETRIES = true;

    testService.configureService(DEFAULT_NAME);

    expect(enableRetriesMock).toHaveBeenCalledWith({});
  });

  it('should NOT enable retries when ENABLE_RETRIES is not set', () => {
    const testService = new TestService({
      authenticator: AUTHENTICATOR,
    });

    testService.configureService(DEFAULT_NAME);

    expect(enableRetriesMock).toHaveBeenCalledTimes(0);
  });

  it('configureService method should throw error if service name is not provided', () => {
    const testService = new TestService({
      authenticator: AUTHENTICATOR,
    });
    const fakeError = new Error('Error configuring service. Service name is required.');
    let err;

    try {
      testService.configureService();
    } catch (e) {
      err = e;
    }

    expect(err).toStrictEqual(fakeError);
  });

  it('ensure enableRetries is called with the correct config', () => {
    const testService = new TestService({
      authenticator: AUTHENTICATOR,
    });
    const retryOptions = {
      maxRetries: 5,
      maxRetryInterval: 100,
    };
    testService.enableRetries(retryOptions);

    expect(enableRetriesMock).toHaveBeenCalledWith(retryOptions);
  });

  it('ensure disableRetries is called', () => {
    const testService = new TestService({
      authenticator: AUTHENTICATOR,
    });
    testService.disableRetries();

    expect(disableRetriesMock).toHaveBeenCalled();
  });
});

function TestService(options) {
  BaseService.call(this, options);
}

function setupFakeService() {
  util.inherits(TestService, BaseService);
  TestService.prototype.name = DEFAULT_NAME;
  TestService.prototype.version = 'v1';
  TestService.DEFAULT_SERVICE_URL = DEFAULT_URL;
}
