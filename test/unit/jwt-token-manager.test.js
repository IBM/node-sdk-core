/* eslint-disable no-alert, no-console */
'use strict';

const { JwtTokenManager } = require('../../dist/auth');
const jwt = require('jsonwebtoken');

function getCurrentTime() {
  return Math.floor(Date.now() / 1000);
}

const ACCESS_TOKEN = 'abc123';

describe('JWT Token Manager', () => {
  it('should initialize base variables', () => {
    const url = 'service.com';
    const instance = new JwtTokenManager({ url });

    expect(instance.url).toBe(url);
    expect(instance.tokenName).toBe('access_token');
    expect(instance.tokenInfo).toEqual({});
    expect(instance.requestWrapperInstance).toBeDefined();
  });

  it('should pass all options to the request wrapper instance', () => {
    const instance = new JwtTokenManager({ proxy: false });
    expect(instance.requestWrapperInstance.axiosInstance.defaults.proxy).toBe(false);
  });

  describe('getToken', () => {
    it('should request a token if no token is stored', async done => {
      const instance = new JwtTokenManager();
      const saveTokenInfoSpy = jest.spyOn(instance, 'saveTokenInfo');

      const decodeSpy = jest
        .spyOn(jwt, 'decode')
        .mockImplementation(token => ({ iat: 0, exp: 100 }));

      const requestTokenSpy = jest
        .spyOn(instance, 'requestToken')
        .mockImplementation(() => Promise.resolve({ result: { access_token: ACCESS_TOKEN } }));

      const token = await instance.getToken();
      expect(requestTokenSpy).toHaveBeenCalled();
      expect(saveTokenInfoSpy).toHaveBeenCalled();
      expect(decodeSpy).toHaveBeenCalled();
      expect(token).toBe(ACCESS_TOKEN);

      saveTokenInfoSpy.mockRestore();
      decodeSpy.mockRestore();
      requestTokenSpy.mockRestore();
      done();
    });

    it('should request a token if token is stored but expired', async done => {
      const instance = new JwtTokenManager();
      instance.tokenInfo.access_token = '987zxc';

      const saveTokenInfoSpy = jest.spyOn(instance, 'saveTokenInfo');
      const decodeSpy = jest
        .spyOn(jwt, 'decode')
        .mockImplementation(token => ({ iat: 0, exp: 100 }));

      const requestTokenSpy = jest
        .spyOn(instance, 'requestToken')
        .mockImplementation(() => Promise.resolve({ result: { access_token: ACCESS_TOKEN } }));

      const token = await instance.getToken();
      expect(requestTokenSpy).toHaveBeenCalled();
      expect(saveTokenInfoSpy).toHaveBeenCalled();
      expect(decodeSpy).toHaveBeenCalled();
      expect(token).toBe(ACCESS_TOKEN);

      saveTokenInfoSpy.mockRestore();
      decodeSpy.mockRestore();
      requestTokenSpy.mockRestore();
      done();
    });

    it('should not save token info if token request returned an error', async done => {
      const instance = new JwtTokenManager();

      const saveTokenInfoSpy = jest.spyOn(instance, 'saveTokenInfo');
      const requestTokenSpy = jest
        .spyOn(instance, 'requestToken')
        .mockImplementation(() => Promise.reject(new Error()));

      let token;
      let err;
      try {
        token = await instance.getToken();
      } catch (e) {
        err = e;
      }
      expect(requestTokenSpy).toHaveBeenCalled();
      expect(saveTokenInfoSpy).not.toHaveBeenCalled();
      expect(err).toBeInstanceOf(Error);
      expect(token).toBeUndefined();

      saveTokenInfoSpy.mockRestore();
      requestTokenSpy.mockRestore();
      done();
    });

    it('should catch and reject lower level errors', async done => {
      const instance = new JwtTokenManager();
      const saveTokenInfoSpy = jest.spyOn(instance, 'saveTokenInfo');

      // because there is no access token, calling `saveTokenInfo` will
      // throw an error to be caught and rejected in the Promise
      const requestTokenSpy = jest
        .spyOn(instance, 'requestToken')
        .mockImplementation(() => Promise.resolve({ result: { arbitrary_data: '12345' } }));

      let token;
      let err;
      try {
        token = await instance.getToken();
      } catch (e) {
        err = e;
      }

      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('Access token not present in response');
      expect(token).toBeUndefined();

      saveTokenInfoSpy.mockRestore();
      requestTokenSpy.mockRestore();
      done();
    });

    it('should use an sdk-managed token if present and not expired', async done => {
      const instance = new JwtTokenManager();
      instance.tokenInfo.access_token = ACCESS_TOKEN;
      instance.expireTime = getCurrentTime() + 1000;
      const token = await instance.getToken();
      expect(token).toBe(ACCESS_TOKEN);
      done();
    });
  });

  it('should reject with error if requestToken is not overriden', async done => {
    const instance = new JwtTokenManager();

    let err;
    let token;
    try {
      token = await instance.requestToken();
    } catch (e) {
      err = e;
    }

    expect(err).toBeInstanceOf(Error);
    expect(token).toBeUndefined();
    done();
  });

  describe('isTokenExpired', () => {
    it('should return true if current time is past expire time', () => {
      const instance = new JwtTokenManager();
      instance.expireTime = getCurrentTime() - 1000;

      expect(instance.isTokenExpired()).toBe(true);
    });

    it('should return false if current time has not reached expire time', () => {
      const instance = new JwtTokenManager();
      instance.expireTime = getCurrentTime() + 1000;

      expect(instance.isTokenExpired()).toBe(false);
    });

    it('should return true if expire time has not been set', () => {
      const instance = new JwtTokenManager();
      expect(instance.isTokenExpired()).toBe(true);
    });
  });

  describe('saveTokenInfo', () => {
    it('should save information to object state', () => {
      const instance = new JwtTokenManager();

      const expireTime = 100;
      instance.calculateTimeForNewToken = jest.fn(token => expireTime);

      const tokenResponse = { access_token: ACCESS_TOKEN };

      instance.saveTokenInfo(tokenResponse);
      expect(instance.expireTime).toBe(expireTime);
      expect(instance.tokenInfo).toEqual(tokenResponse);
      expect(instance.calculateTimeForNewToken).toHaveBeenCalledWith(ACCESS_TOKEN);
    });

    it('should throw an error when access token is undefined', () => {
      const instance = new JwtTokenManager();
      const tokenResponse = {};

      expect(() => instance.saveTokenInfo(tokenResponse)).toThrow();
    });
  });

  describe('calculateTimeForNewToken', () => {
    it('should calculate time for new token based on valid jwt', () => {
      const instance = new JwtTokenManager();
      const decodeSpy = jest
        .spyOn(jwt, 'decode')
        .mockImplementation(token => ({ iat: 0, exp: 100 }));

      expect(instance.calculateTimeForNewToken(ACCESS_TOKEN)).toBe(80);
      decodeSpy.mockRestore();
    });

    it('should throw an error if token is not a valid jwt', () => {
      const instance = new JwtTokenManager();
      expect(() => instance.calculateTimeForNewToken()).toThrow();
    });
  });
});
