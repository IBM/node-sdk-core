'use strict';

const requestWrapper = require('../../lib/requestwrapper');
requestWrapper.sendRequest = jest.fn();

const IamTokenManagerV1 = require('../../iam-token-manager/v1').IamTokenManagerV1;

describe('iam_token_manager_v1', function() {
  beforeEach(() => {
    requestWrapper.sendRequest.mockReset();
  });

  afterAll(() => {
    requestWrapper.sendRequest.mockRestore();
  });

  it('should return an access token given by the user', function(done) {
    const userManagedToken = 'abcd-1234';
    const instance = new IamTokenManagerV1({ iamAccessToken: userManagedToken });
    const requestMock = jest.spyOn(instance, 'requestToken');
    const refreshMock = jest.spyOn(instance, 'refreshToken');

    instance.getToken(function(err, token) {
      expect(token).toBe(userManagedToken);
      expect(requestMock).not.toHaveBeenCalled();
      expect(refreshMock).not.toHaveBeenCalled();
      done();
    });
  });

  it('should turn an iam apikey into an access token', function(done) {
    const instance = new IamTokenManagerV1({ iamApikey: 'abcd-1234' });
    const refreshMock = jest.spyOn(instance, 'refreshToken');

    const accessToken = '9012';
    const iamResponse = {
      access_token: accessToken,
      refresh_token: '3456',
      token_type: 'Bearer',
      expires_in: 3600,
      expiration: Math.floor(Date.now() / 1000) + 3600,
    };

    requestWrapper.sendRequest.mockImplementation((parameters, _callback) => {
      _callback(null, iamResponse);
    });

    instance.getToken(function(err, token) {
      expect(token).toBe(accessToken);
      expect(refreshMock).not.toHaveBeenCalled();
      done();
    });
  });

  it('should refresh an expired access token', function(done) {
    const instance = new IamTokenManagerV1({ iamApikey: 'abcd-1234' });
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

    requestWrapper.sendRequest.mockImplementation((parameters, _callback) => {
      _callback(null, iamResponse);
    });

    instance.getToken(function(err, token) {
      expect(token).toBe(accessToken);
      expect(requestMock).not.toHaveBeenCalled();
      done();
    });
  });

  it('should use a valid access token if one is stored', function(done) {
    const instance = new IamTokenManagerV1({ iamApikey: 'abcd-1234' });
    const requestMock = jest.spyOn(instance, 'requestToken');
    const refreshMock = jest.spyOn(instance, 'refreshToken');

    const accessToken = '1234';
    const currentTokenInfo = {
      access_token: accessToken,
      refresh_token: '5678',
      token_type: 'Bearer',
      expires_in: 3600,
      expiration: Math.floor(Date.now() / 1000) + 3000,
    };

    instance.tokenInfo = currentTokenInfo;

    instance.getToken(function(err, token) {
      expect(token).toBe(accessToken);
      expect(refreshMock).not.toHaveBeenCalled();
      expect(requestMock).not.toHaveBeenCalled();
      done();
    });
  });

  it('should return a user-managed access token if one is set post-construction', function(done) {
    const instance = new IamTokenManagerV1({ iamApikey: 'abcd-1234' });
    const requestMock = jest.spyOn(instance, 'requestToken');
    const refreshMock = jest.spyOn(instance, 'refreshToken');

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
      expect(refreshMock).not.toHaveBeenCalled();
      expect(requestMock).not.toHaveBeenCalled();
      done();
    });
  });

  it('should refresh an access token without expires_in field', function(done) {
    const instance = new IamTokenManagerV1({ iamApikey: 'abcd-1234' });
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

    requestWrapper.sendRequest.mockImplementation((parameters, _callback) => {
      _callback(null, iamResponse);
    });

    instance.getToken(function(err, token) {
      expect(token).toBe(accessToken);
      expect(requestMock).not.toHaveBeenCalled();
      done();
    });
  });

  it('should request a new token when refresh token does not have expiration field', function(done) {
    const instance = new IamTokenManagerV1({ iamApikey: 'abcd-1234' });
    const refreshMock = jest.spyOn(instance, 'refreshToken');

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

    requestWrapper.sendRequest.mockImplementation((parameters, _callback) => {
      _callback(null, iamResponse);
    });

    instance.getToken(function(err, token) {
      expect(token).toBe(accessToken);
      expect(refreshMock).not.toHaveBeenCalled();
      done();
    });
  });

  it('should use the default Authorization header - no clientid, no secret', function(done) {
    const instance = new IamTokenManagerV1({ iamApikey: 'abcd-1234' });

    requestWrapper.sendRequest.mockImplementation((parameters, _callback) => {
      _callback();
    });

    instance.getToken(function() {
      const sendRequestArgs = requestWrapper.sendRequest.mock.calls[0][0];
      const authHeader = sendRequestArgs.options.headers.Authorization;
      expect(authHeader).toBe('Basic Yng6Yng=');
      done();
    });
  });

  it('should use a non-default Authorization header - client id and secret via ctor', function(done) {
    const instance = new IamTokenManagerV1({
      iamApikey: 'abcd-1234',
      iamClientId: 'foo',
      iamSecret: 'bar',
    });

    requestWrapper.sendRequest.mockImplementation((parameters, _callback) => {
      _callback();
    });

    instance.getToken(function() {
      const sendRequestArgs = requestWrapper.sendRequest.mock.calls[0][0];
      const authHeader = sendRequestArgs.options.headers.Authorization;
      expect(authHeader).not.toBe('Basic Yng6Yng=');
      done();
    });
  });

  it('should use the default Authorization header - clientid only via ctor', function(done) {
    const instance = new IamTokenManagerV1({
      iamApikey: 'abcd-1234',
      iamClientId: 'foo',
    });

    requestWrapper.sendRequest.mockImplementation((parameters, _callback) => {
      _callback();
    });

    instance.getToken(function() {
      const sendRequestArgs = requestWrapper.sendRequest.mock.calls[0][0];
      const authHeader = sendRequestArgs.options.headers.Authorization;
      expect(authHeader).toBe('Basic Yng6Yng=');
      done();
    });
  });

  it('should use the default Authorization header, secret only via ctor', function(done) {
    const instance = new IamTokenManagerV1({
      iamApikey: 'abcd-1234',
      iamSecret: 'bar',
    });

    requestWrapper.sendRequest.mockImplementation((parameters, _callback) => {
      _callback();
    });

    instance.getToken(function() {
      const sendRequestArgs = requestWrapper.sendRequest.mock.calls[0][0];
      const authHeader = sendRequestArgs.options.headers.Authorization;
      expect(authHeader).toBe('Basic Yng6Yng=');
      done();
    });
  });

  it('should use a non-default Authorization header - client id and secret via setter', function(done) {
    const instance = new IamTokenManagerV1({
      iamApikey: 'abcd-1234',
    });

    instance.setIamAuthorizationInfo('foo', 'bar');

    requestWrapper.sendRequest.mockImplementation((parameters, _callback) => {
      _callback();
    });

    instance.getToken(function() {
      const sendRequestArgs = requestWrapper.sendRequest.mock.calls[0][0];
      const authHeader = sendRequestArgs.options.headers.Authorization;
      expect(authHeader).not.toBe('Basic Yng6Yng=');
      done();
    });
  });

  it('should use the default Authorization header - clientid only via setter', function(done) {
    const instance = new IamTokenManagerV1({
      iamApikey: 'abcd-1234',
    });

    instance.setIamAuthorizationInfo('foo', null);

    requestWrapper.sendRequest.mockImplementation((parameters, _callback) => {
      _callback();
    });

    instance.getToken(function() {
      const sendRequestArgs = requestWrapper.sendRequest.mock.calls[0][0];
      const authHeader = sendRequestArgs.options.headers.Authorization;
      expect(authHeader).toBe('Basic Yng6Yng=');
      done();
    });
  });

  it('should use the default Authorization header, secret only via ctor', function(done) {
    const instance = new IamTokenManagerV1({
      iamApikey: 'abcd-1234',
      iamSecret: 'bar',
    });

    instance.setIamAuthorizationInfo(null, 'bar');

    requestWrapper.sendRequest.mockImplementation((parameters, _callback) => {
      _callback();
    });

    instance.getToken(function() {
      const sendRequestArgs = requestWrapper.sendRequest.mock.calls[0][0];
      const authHeader = sendRequestArgs.options.headers.Authorization;
      expect(authHeader).toBe('Basic Yng6Yng=');
      done();
    });
  });

  it('should use the default Authorization header, nulls passed to setter', function(done) {
    const instance = new IamTokenManagerV1({
      iamApikey: 'abcd-1234',
      iamSecret: 'bar',
    });

    instance.setIamAuthorizationInfo(null, null);

    requestWrapper.sendRequest.mockImplementation((parameters, _callback) => {
      _callback();
    });

    instance.getToken(function() {
      const sendRequestArgs = requestWrapper.sendRequest.mock.calls[0][0];
      const authHeader = sendRequestArgs.options.headers.Authorization;
      expect(authHeader).toBe('Basic Yng6Yng=');
      done();
    });
  });
});
