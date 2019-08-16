/* eslint-disable no-alert, no-console */
'use strict';

jest.mock('../../lib/requestwrapper');
const { RequestWrapper } = require('../../lib/requestwrapper');

const jwt = require('jsonwebtoken');
jwt.decode = jest.fn(() => {
  return { exp: 100, iat: 100 };
});

const { IamTokenManagerV1 } = require('../../auth');
const mockSendRequest = jest.fn();

RequestWrapper.mockImplementation(() => {
  return {
    sendRequest: mockSendRequest,
  };
});

const CLIENT_ID_SECRET_WARNING =
  'Warning: Client ID and Secret must BOTH be given, or the defaults will be used.';

describe('iam_token_manager_v1', function() {
  beforeEach(() => {
    mockSendRequest.mockReset();
  });

  afterAll(() => {
    mockSendRequest.mockRestore();
  });

  it('should turn an iam apikey into an access token', function(done) {
    const instance = new IamTokenManagerV1({ apikey: 'abcd-1234' });

    const accessToken = '9012';
    const iamResponse = {
      access_token: accessToken,
      refresh_token: '3456',
      token_type: 'Bearer',
      expires_in: 3600,
      expiration: Math.floor(Date.now() / 1000) + 3600,
    };

    mockSendRequest.mockImplementation((parameters, _callback) => {
      _callback(null, iamResponse);
    });

    instance.getToken(function(err, token) {
      expect(token).toBe(accessToken);
      done();
    });
  });

  it('should refresh an expired access token', function(done) {
    const instance = new IamTokenManagerV1({ apikey: 'abcd-1234' });
    const requestMock = jest.spyOn(instance, 'requestToken');

    const currentTokenInfo = {
      access_token: '1234',
      refresh_token: '5678',
      token_type: 'Bearer',
      expires_in: 3600,
      expiration: Math.floor(Date.now() / 1000),
    };

    instance.tokenInfo = currentTokenInfo;

    const accessToken = '9012';
    const iamResponse = {
      access_token: accessToken,
      refresh_token: '3456',
      token_type: 'Bearer',
      expires_in: 3600,
      expiration: Math.floor(Date.now() / 1000) + 3600,
    };

    mockSendRequest.mockImplementation((parameters, _callback) => {
      _callback(null, iamResponse);
    });

    instance.getToken(function(err, token) {
      expect(token).toBe(accessToken);
      expect(requestMock).toHaveBeenCalled();
      done();
    });
  });

  it('should use a valid access token if one is stored', function(done) {
    const instance = new IamTokenManagerV1({ apikey: 'abcd-1234' });
    const requestMock = jest.spyOn(instance, 'requestToken');

    const accessToken = '1234';
    const currentTokenInfo = {
      access_token: accessToken,
      refresh_token: '5678',
      token_type: 'Bearer',
      expires_in: 3600,
      expiration: Math.floor(Date.now() / 1000) + 3000,
    };

    instance.tokenInfo = currentTokenInfo;
    instance.timeToLive = currentTokenInfo.expires_in;
    instance.expireTime = currentTokenInfo.expiration;

    instance.getToken(function(err, token) {
      expect(token).toBe(accessToken);
      expect(requestMock).not.toHaveBeenCalled();
      done();
    });
  });

  it('should return a user-managed access token if one is set post-construction', function(done) {
    const instance = new IamTokenManagerV1({ apikey: 'abcd-1234' });
    const requestMock = jest.spyOn(instance, 'requestToken');

    const accessToken = '9012';
    const currentTokenInfo = {
      access_token: '1234',
      refresh_token: '5678',
      token_type: 'Bearer',
      expires_in: 3600,
      expiration: Math.floor(Date.now() / 1000) + 3000,
    };

    instance.tokenInfo = currentTokenInfo;
    instance.setAccessToken(accessToken);

    instance.getToken(function(err, token) {
      expect(token).toBe(accessToken);
      expect(requestMock).not.toHaveBeenCalled();
      done();
    });
  });

  it('should refresh an access token without expires_in field', function(done) {
    const instance = new IamTokenManagerV1({ apikey: 'abcd-1234' });
    const requestMock = jest.spyOn(instance, 'requestToken');

    const currentTokenInfo = {
      access_token: '1234',
      refresh_token: '5678',
      token_type: 'Bearer',
      expiration: Math.floor(Date.now() / 1000),
    };

    instance.tokenInfo = currentTokenInfo;

    const accessToken = '9012';
    const iamResponse = {
      access_token: accessToken,
      refresh_token: '3456',
      token_type: 'Bearer',
      expires_in: 3600,
      expiration: Math.floor(Date.now() / 1000) + 3600,
    };

    mockSendRequest.mockImplementation((parameters, _callback) => {
      _callback(null, iamResponse);
    });

    instance.getToken(function(err, token) {
      expect(token).toBe(accessToken);
      expect(requestMock).toHaveBeenCalled();
      done();
    });
  });

  it('should request a new token when refresh token does not have expiration field', function(done) {
    const instance = new IamTokenManagerV1({ apikey: 'abcd-1234' });

    const currentTokenInfo = {
      access_token: '1234',
      refresh_token: '5678',
      token_type: 'Bearer',
    };

    instance.tokenInfo = currentTokenInfo;

    const accessToken = '9012';
    const iamResponse = {
      access_token: accessToken,
      refresh_token: '3456',
      token_type: 'Bearer',
      expires_in: 3600,
      expiration: Math.floor(Date.now() / 1000) + 3600,
    };

    mockSendRequest.mockImplementation((parameters, _callback) => {
      _callback(null, iamResponse);
    });

    instance.getToken(function(err, token) {
      expect(token).toBe(accessToken);
      done();
    });
  });

  it('should use the default Authorization header - no clientid, no secret', function(done) {
    const instance = new IamTokenManagerV1({ apikey: 'abcd-1234' });

    mockSendRequest.mockImplementation((parameters, _callback) => {
      _callback(null, { access_token: 'abcd' });
    });

    instance.getToken(function() {
      const sendRequestArgs = mockSendRequest.mock.calls[0][0];
      const authHeader = sendRequestArgs.options.headers.Authorization;
      expect(authHeader).toBe('Basic Yng6Yng=');
      done();
    });
  });

  it('should use a non-default Authorization header - client id and secret via ctor', function(done) {
    const instance = new IamTokenManagerV1({
      apikey: 'abcd-1234',
      clientId: 'foo',
      clientSecret: 'bar',
    });

    mockSendRequest.mockImplementation((parameters, _callback) => {
      _callback(null, { access_token: 'abcd' });
    });

    instance.getToken(function() {
      const sendRequestArgs = mockSendRequest.mock.calls[0][0];
      const authHeader = sendRequestArgs.options.headers.Authorization;
      expect(authHeader).not.toBe('Basic Yng6Yng=');
      done();
    });
  });

  it('should use the default Authorization header - clientid only via ctor', function(done) {
    jest.spyOn(console, 'log').mockImplementation(() => {});

    const instance = new IamTokenManagerV1({
      apikey: 'abcd-1234',
      clientId: 'foo',
    });

    // verify warning was triggered
    expect(console.log).toHaveBeenCalled();
    expect(console.log.mock.calls[0][0]).toBe(CLIENT_ID_SECRET_WARNING);
    console.log.mockRestore();

    mockSendRequest.mockImplementation((parameters, _callback) => {
      _callback(null, { access_token: 'abcd' });
    });

    instance.getToken(function() {
      const sendRequestArgs = mockSendRequest.mock.calls[0][0];
      const authHeader = sendRequestArgs.options.headers.Authorization;
      expect(authHeader).toBe('Basic Yng6Yng=');
      done();
    });
  });

  it('should use the default Authorization header, secret only via ctor', function(done) {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    const instance = new IamTokenManagerV1({
      apikey: 'abcd-1234',
      clientSecret: 'bar',
    });

    // verify warning was triggered
    expect(console.log).toHaveBeenCalled();
    expect(console.log.mock.calls[0][0]).toBe(CLIENT_ID_SECRET_WARNING);
    console.log.mockRestore();

    mockSendRequest.mockImplementation((parameters, _callback) => {
      _callback(null, { access_token: 'abcd' });
    });

    instance.getToken(function() {
      const sendRequestArgs = mockSendRequest.mock.calls[0][0];
      const authHeader = sendRequestArgs.options.headers.Authorization;
      expect(authHeader).toBe('Basic Yng6Yng=');
      done();
    });
  });

  it('should use a non-default Authorization header - client id and secret via setter', function(done) {
    const instance = new IamTokenManagerV1({
      apikey: 'abcd-1234',
    });

    instance.setAuthorizationInfo('foo', 'bar');

    mockSendRequest.mockImplementation((parameters, _callback) => {
      _callback(null, { access_token: 'abcd' });
    });

    instance.getToken(function() {
      const sendRequestArgs = mockSendRequest.mock.calls[0][0];
      const authHeader = sendRequestArgs.options.headers.Authorization;
      expect(authHeader).not.toBe('Basic Yng6Yng=');
      done();
    });
  });

  it('should use the default Authorization header - clientid only via setter', function(done) {
    const instance = new IamTokenManagerV1({
      apikey: 'abcd-1234',
    });

    jest.spyOn(console, 'log').mockImplementation(() => {});

    instance.setAuthorizationInfo('foo', null);

    // verify warning was triggered
    expect(console.log).toHaveBeenCalled();
    expect(console.log.mock.calls[0][0]).toBe(CLIENT_ID_SECRET_WARNING);
    console.log.mockRestore();

    mockSendRequest.mockImplementation((parameters, _callback) => {
      _callback(null, { access_token: 'abcd' });
    });

    instance.getToken(function() {
      const sendRequestArgs = mockSendRequest.mock.calls[0][0];
      const authHeader = sendRequestArgs.options.headers.Authorization;
      expect(authHeader).toBe('Basic Yng6Yng=');
      done();
    });
  });

  it('should use the default Authorization header, secret only via setter', function(done) {
    const instance = new IamTokenManagerV1({
      apikey: 'abcd-1234',
    });

    jest.spyOn(console, 'log').mockImplementation(() => {});

    instance.setAuthorizationInfo(null, 'bar');

    // verify warning was triggered
    expect(console.log).toHaveBeenCalled();
    expect(console.log.mock.calls[0][0]).toBe(CLIENT_ID_SECRET_WARNING);
    console.log.mockRestore();

    mockSendRequest.mockImplementation((parameters, _callback) => {
      _callback(null, { access_token: 'abcd' });
    });

    instance.getToken(function() {
      const sendRequestArgs = mockSendRequest.mock.calls[0][0];
      const authHeader = sendRequestArgs.options.headers.Authorization;
      expect(authHeader).toBe('Basic Yng6Yng=');
      done();
    });
  });

  it('should use the default Authorization header, nulls passed to setter', function(done) {
    const instance = new IamTokenManagerV1({
      apikey: 'abcd-1234',
    });

    instance.setAuthorizationInfo(null, null);

    mockSendRequest.mockImplementation((parameters, _callback) => {
      _callback(null, { access_token: 'abcd' });
    });

    instance.getToken(function() {
      const sendRequestArgs = mockSendRequest.mock.calls[0][0];
      const authHeader = sendRequestArgs.options.headers.Authorization;
      expect(authHeader).toBe('Basic Yng6Yng=');
      done();
    });
  });
});
