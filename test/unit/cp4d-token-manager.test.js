/* eslint-disable no-alert, no-console */
'use strict';

const { Cp4dTokenManager } = require('../../auth');

// mock sendRequest
jest.mock('../../lib/requestwrapper');
const { RequestWrapper } = require('../../lib/requestwrapper');
const mockSendRequest = jest.fn();
RequestWrapper.mockImplementation(() => {
  return {
    sendRequest: mockSendRequest,
  };
});

const USERNAME = 'sherlock';
const PASSWORD = 'holmes';
const URL = 'tokenservice.com';
const FULL_URL = 'tokenservice.com/v1/preauth/validateAuth';

describe('CP4D Token Manager', () => {
  describe('constructor', () => {
    it('should initialize base variables', () => {
      const instance = new Cp4dTokenManager({
        url: 'tokenservice.com',
        username: USERNAME,
        password: PASSWORD,
      });

      expect(instance.tokenName).toBe('accessToken');
      expect(instance.url).toBe(FULL_URL);
      expect(instance.username).toBe(USERNAME);
      expect(instance.password).toBe(PASSWORD);
      expect(instance.disableSslVerification).toBe(false);
    });

    it('should not append the token path if supplied by user', () => {
      const url = FULL_URL;
      const instance = new Cp4dTokenManager({
        url,
        username: USERNAME,
        password: PASSWORD,
      });

      expect(instance.url).toBe(url);
    });

    it('should set disableSslVerification', () => {
      const instance = new Cp4dTokenManager({
        username: USERNAME,
        password: PASSWORD,
        url: URL,
        disableSslVerification: true,
      });

      expect(instance.disableSslVerification).toBe(true);
    });

    it('should throw an error if `url` is not given', () => {
      expect(
        () =>
          new Cp4dTokenManager({
            username: USERNAME,
            password: PASSWORD,
          })
      ).toThrow();
    });

    it('should throw an error if `username` is not given', () => {
      expect(
        () =>
          new Cp4dTokenManager({
            password: PASSWORD,
            url: URL,
          })
      ).toThrow();
    });

    it('should throw an error if `password` is not given', () => {
      expect(
        () =>
          new Cp4dTokenManager({
            username: 'abc',
            url: URL,
          })
      ).toThrow();
    });
  });

  describe('requestToken', () => {
    it('should call sendRequest with all request options', () => {
      const instance = new Cp4dTokenManager({
        url: URL,
        username: USERNAME,
        password: PASSWORD,
      });

      instance.requestToken();

      // extract arguments sendRequest was called with
      const params = mockSendRequest.mock.calls[0][0];

      expect(mockSendRequest).toHaveBeenCalled();
      expect(params.options).toBeDefined();
      expect(params.options.url).toBe(FULL_URL);
      expect(params.options.method).toBe('GET');
      expect(params.options.rejectUnauthorized).toBe(true);
      expect(params.options.headers).toBeDefined();
      expect(params.options.headers.Authorization).toBe('Basic c2hlcmxvY2s6aG9sbWVz');
    });
  });
});
