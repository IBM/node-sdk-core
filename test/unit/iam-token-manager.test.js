/* eslint-disable no-alert, no-console */
'use strict';

jest.mock('../../dist/lib/request-wrapper');
const { RequestWrapper } = require('../../dist/lib/request-wrapper');
const logger = require('../../dist/lib/logger').default;

const jwt = require('jsonwebtoken');
jwt.decode = jest.fn(() => {
  return { exp: 100, iat: 100 };
});

const { IamTokenManager } = require('../../dist/auth');
const mockSendRequest = jest.fn();

RequestWrapper.mockImplementation(() => {
  return {
    sendRequest: mockSendRequest,
  };
});

const ACCESS_TOKEN = '9012';
const CURRENT_ACCESS_TOKEN = '1234';
const IAM_RESPONSE = {
  result: {
    access_token: ACCESS_TOKEN,
    refresh_token: '3456',
    token_type: 'Bearer',
    expires_in: 3600,
    expiration: Math.floor(Date.now() / 1000) + 3600,
  },
};

const CLIENT_ID_SECRET_WARNING =
  'Warning: Client ID and Secret must BOTH be given, or the header will not be included.';

describe('iam_token_manager_v1', function() {
  beforeEach(() => {
    mockSendRequest.mockReset();
  });

  afterAll(() => {
    mockSendRequest.mockRestore();
  });

  it('should throw an error if apikey is not provided', () => {
    expect(() => new IamTokenManager()).toThrow();
  });

  it('should turn an iam apikey into an access token', async done => {
    const instance = new IamTokenManager({ apikey: 'abcd-1234' });

    mockSendRequest.mockImplementation(parameters => Promise.resolve(IAM_RESPONSE));

    const token = await instance.getToken();

    expect(token).toBe(ACCESS_TOKEN);
    done();
  });

  it('should refresh an expired access token', async done => {
    const instance = new IamTokenManager({ apikey: 'abcd-1234' });
    const requestMock = jest.spyOn(instance, 'requestToken');

    const currentTokenInfo = {
      access_token: CURRENT_ACCESS_TOKEN,
    };

    instance.tokenInfo = currentTokenInfo;
    instance.expireTime = Math.floor(Date.now() / 1000) - 1;

    mockSendRequest.mockImplementation(parameters => Promise.resolve(IAM_RESPONSE));

    const token = await instance.getToken();
    expect(token).toBe(ACCESS_TOKEN);
    expect(requestMock).toHaveBeenCalled();
    done();
  });

  it('should refresh an access token whose refreshTime has passed', async done => {
    const instance = new IamTokenManager({ apikey: 'abcd-1234' });
    const requestMock = jest.spyOn(instance, 'requestToken');

    const currentTokenInfo = {
      access_token: CURRENT_ACCESS_TOKEN,
    };

    instance.tokenInfo = currentTokenInfo;
    instance.accessToken = CURRENT_ACCESS_TOKEN;
    instance.expireTime = Math.floor(Date.now() / 1000) + 60;
    instance.refreshTime = Math.floor(Date.now() / 1000) - 1;

    const requestTokenSpy = jest
      .spyOn(instance, 'requestToken')
      .mockImplementation(() => Promise.resolve({ result: { access_token: ACCESS_TOKEN } }));

    mockSendRequest.mockImplementation(parameters => Promise.resolve(IAM_RESPONSE));

    const token = await instance.getToken();
    expect(token).toBe(CURRENT_ACCESS_TOKEN);
    expect(requestMock).toHaveBeenCalled();
    expect(requestTokenSpy).toHaveBeenCalled();

    requestTokenSpy.mockRestore();
    done();
  });

  it('should use a valid access token if one is stored', async done => {
    const instance = new IamTokenManager({ apikey: 'abcd-1234' });
    const requestMock = jest.spyOn(instance, 'requestToken');

    const currentTokenInfo = {
      access_token: ACCESS_TOKEN,
    };

    instance.tokenInfo = currentTokenInfo;
    instance.accessToken = ACCESS_TOKEN;
    instance.expireTime = Math.floor(Date.now() / 1000) + 60 * 60;
    instance.refreshTime = Math.floor(Date.now() / 1000) + 48 * 60;

    const token = await instance.getToken();
    expect(token).toBe(ACCESS_TOKEN);
    expect(requestMock).not.toHaveBeenCalled();
    done();
  });

  it('should not specify an Authorization header if user provides no clientid, no secret', async done => {
    const instance = new IamTokenManager({ apikey: 'abcd-1234' });

    mockSendRequest.mockImplementation(parameters => Promise.resolve(IAM_RESPONSE));

    await instance.getToken();
    const sendRequestArgs = mockSendRequest.mock.calls[0][0];
    const authHeader = sendRequestArgs.options.headers.Authorization;
    expect(authHeader).toBeUndefined();
    done();
  });

  it('should use an Authorization header based on client id and secret via ctor', async done => {
    const instance = new IamTokenManager({
      apikey: 'abcd-1234',
      clientId: 'foo',
      clientSecret: 'bar',
    });

    mockSendRequest.mockImplementation(parameters => Promise.resolve(IAM_RESPONSE));

    await instance.getToken();
    const sendRequestArgs = mockSendRequest.mock.calls[0][0];
    const authHeader = sendRequestArgs.options.headers.Authorization;
    expect(authHeader).toBe('Basic Zm9vOmJhcg==');
    done();
  });

  it('should not use an Authorization header - clientid only via ctor', async done => {
    jest.spyOn(logger, 'warn').mockImplementation(() => {});

    const instance = new IamTokenManager({
      apikey: 'abcd-1234',
      clientId: 'foo',
    });

    // verify warning was triggered
    expect(logger.warn).toHaveBeenCalled();
    expect(logger.warn.mock.calls[0][0]).toBe(CLIENT_ID_SECRET_WARNING);

    mockSendRequest.mockImplementation(parameters => Promise.resolve(IAM_RESPONSE));

    await instance.getToken();
    const sendRequestArgs = mockSendRequest.mock.calls[0][0];
    const authHeader = sendRequestArgs.options.headers.Authorization;
    expect(authHeader).toBeUndefined();
    done();
  });

  it('should not use an Authorization header - secret only via ctor', async done => {
    jest.spyOn(logger, 'warn').mockImplementation(() => {});
    const instance = new IamTokenManager({
      apikey: 'abcd-1234',
      clientSecret: 'bar',
    });

    // verify warning was triggered
    expect(logger.warn).toHaveBeenCalled();
    expect(logger.warn.mock.calls[0][0]).toBe(CLIENT_ID_SECRET_WARNING);

    mockSendRequest.mockImplementation(parameters => Promise.resolve(IAM_RESPONSE));

    await instance.getToken();
    const sendRequestArgs = mockSendRequest.mock.calls[0][0];
    const authHeader = sendRequestArgs.options.headers.Authorization;
    expect(authHeader).toBeUndefined();
    done();
  });

  it('should use an Authorization header based on client id and secret via setter', async done => {
    const instance = new IamTokenManager({
      apikey: 'abcd-1234',
    });

    instance.setClientIdAndSecret('foo', 'bar');

    mockSendRequest.mockImplementation(parameters => Promise.resolve(IAM_RESPONSE));

    await instance.getToken();
    const sendRequestArgs = mockSendRequest.mock.calls[0][0];
    const authHeader = sendRequestArgs.options.headers.Authorization;
    expect(authHeader).toBe('Basic Zm9vOmJhcg==');
    done();
  });

  it('should not use an Authorization header -- clientid only via setter', async done => {
    const instance = new IamTokenManager({
      apikey: 'abcd-1234',
    });

    jest.spyOn(logger, 'warn').mockImplementation(() => {});

    instance.setClientIdAndSecret('foo', null);

    // verify warning was triggered
    expect(logger.warn).toHaveBeenCalled();
    expect(logger.warn.mock.calls[0][0]).toBe(CLIENT_ID_SECRET_WARNING);

    mockSendRequest.mockImplementation(parameters => Promise.resolve(IAM_RESPONSE));

    await instance.getToken();
    const sendRequestArgs = mockSendRequest.mock.calls[0][0];
    const authHeader = sendRequestArgs.options.headers.Authorization;
    expect(authHeader).toBeUndefined();
    done();
  });

  it('should not use an Authorization header - secret only via setter', async done => {
    const instance = new IamTokenManager({
      apikey: 'abcd-1234',
    });

    jest.spyOn(logger, 'warn').mockImplementation(() => {});

    instance.setClientIdAndSecret(null, 'bar');

    // verify warning was triggered
    expect(logger.warn).toHaveBeenCalled();
    expect(logger.warn.mock.calls[0][0]).toBe(CLIENT_ID_SECRET_WARNING);

    mockSendRequest.mockImplementation(parameters => Promise.resolve(IAM_RESPONSE));

    await instance.getToken();
    const sendRequestArgs = mockSendRequest.mock.calls[0][0];
    const authHeader = sendRequestArgs.options.headers.Authorization;
    expect(authHeader).toBeUndefined();
    done();
  });

  it('should not use an Authorization header - nulls passed to setter', async done => {
    const instance = new IamTokenManager({
      apikey: 'abcd-1234',
    });

    instance.setClientIdAndSecret(null, null);

    mockSendRequest.mockImplementation(parameters => Promise.resolve(IAM_RESPONSE));

    await instance.getToken();
    const sendRequestArgs = mockSendRequest.mock.calls[0][0];
    const authHeader = sendRequestArgs.options.headers.Authorization;
    expect(authHeader).toBeUndefined();
    done();
  });
});
