/* eslint-disable no-alert, no-console */
'use strict';

const { Icp4dTokenManagerV1 } = require('../../auth');

// mock sendRequest
jest.mock('../../lib/requestwrapper');
const { RequestWrapper } = require('../../lib/requestwrapper');
const mockSendRequest = jest.fn();
RequestWrapper.mockImplementation(() => {
  return {
    sendRequest: mockSendRequest,
  };
});

describe('icp4d_token_manager_v1', () => {
  describe('constructor', () => {
    it('should initialize base variables', () => {
      const instance = new Icp4dTokenManagerV1({
        url: 'tokenservice.com',
        username: 'sherlock',
        password: 'holmes',
        accessToken: 'abc123',
      });

      expect(instance.tokenName).toBe('accessToken');
      expect(instance.url).toBe('tokenservice.com/v1/preauth/validateAuth');
      expect(instance.username).toBe('sherlock');
      expect(instance.password).toBe('holmes');
      expect(instance.rejectUnauthorized).toBe(true);
      expect(instance.userAccessToken).toBe('abc123');
    });

    it('should set rejectUnauthorized based on disableSslVerification', () => {
      const instance = new Icp4dTokenManagerV1({
        url: 'tokenservice.com',
        disableSslVerification: true,
      });

      expect(instance.rejectUnauthorized).toBe(false);
    });

    it('should throw an error if `url` is not given', () => {
      expect(() => new Icp4dTokenManagerV1()).toThrow();
    });

    it('should not throw an error if `url` is not given but using user-managed access token', () => {
      expect(() => new Icp4dTokenManagerV1({ accessToken: 'token' })).not.toThrow();
    });
  });

  describe('requestToken', () => {
    it('should call sendRequest with all request options', () => {
      const noop = () => {};
      const instance = new Icp4dTokenManagerV1({ url: 'tokenservice.com' });
      instance.requestToken(noop);

      // extract arguments sendRequest was called with
      const params = mockSendRequest.mock.calls[0][0];
      const callback = mockSendRequest.mock.calls[0][1];

      expect(mockSendRequest).toHaveBeenCalled();
      expect(params.options).toBeDefined();
      expect(params.options.url).toBe('tokenservice.com/v1/preauth/validateAuth');
      expect(params.options.method).toBe('GET');
      expect(params.options.rejectUnauthorized).toBe(true);
      expect(params.options.headers).toBeDefined();

      // encoding of undefined:undefined
      expect(params.options.headers.Authorization).toBe('Basic dW5kZWZpbmVkOnVuZGVmaW5lZA==');
      expect(callback).toBe(noop);
    });
  });
});
