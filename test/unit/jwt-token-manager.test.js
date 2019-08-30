/* eslint-disable no-alert, no-console */
'use strict';

const { JwtTokenManager } = require('../../auth');
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
    it('should request a token if no token is stored', done => {
      const instance = new JwtTokenManager();
      const saveTokenInfoSpy = jest.spyOn(instance, 'saveTokenInfo');

      const decodeSpy = jest
        .spyOn(jwt, 'decode')
        .mockImplementation(token => ({ iat: 0, exp: 100 }));

      const requestTokenSpy = jest
        .spyOn(instance, 'requestToken')
        .mockImplementation(cb => cb(null, { result: { access_token: ACCESS_TOKEN } }));

      instance.getToken((err, res) => {
        expect(requestTokenSpy).toHaveBeenCalled();
        expect(saveTokenInfoSpy).toHaveBeenCalled();
        expect(decodeSpy).toHaveBeenCalled();
        expect(err).toBeNull();
        expect(res).toBe(ACCESS_TOKEN);

        saveTokenInfoSpy.mockRestore();
        decodeSpy.mockRestore();
        requestTokenSpy.mockRestore();
        done();
      });
    });

    it('should request a token if token is stored but expired', done => {
      const instance = new JwtTokenManager();
      instance.tokenInfo.access_token = '987zxc';

      const saveTokenInfoSpy = jest.spyOn(instance, 'saveTokenInfo');
      const decodeSpy = jest
        .spyOn(jwt, 'decode')
        .mockImplementation(token => ({ iat: 0, exp: 100 }));

      const requestTokenSpy = jest
        .spyOn(instance, 'requestToken')
        .mockImplementation(cb => cb(null, { result: { access_token: ACCESS_TOKEN } }));

      instance.getToken((err, res) => {
        expect(requestTokenSpy).toHaveBeenCalled();
        expect(saveTokenInfoSpy).toHaveBeenCalled();
        expect(decodeSpy).toHaveBeenCalled();
        expect(err).toBeNull();
        expect(res).toBe(ACCESS_TOKEN);

        saveTokenInfoSpy.mockRestore();
        decodeSpy.mockRestore();
        requestTokenSpy.mockRestore();
        done();
      });
    });

    it('should not save token info if token request returned an error', done => {
      const instance = new JwtTokenManager();

      const saveTokenInfoSpy = jest.spyOn(instance, 'saveTokenInfo');
      const requestTokenSpy = jest
        .spyOn(instance, 'requestToken')
        .mockImplementation(cb => cb(new Error(), null));

      instance.getToken((err, res) => {
        expect(requestTokenSpy).toHaveBeenCalled();
        expect(saveTokenInfoSpy).not.toHaveBeenCalled();
        expect(err).toBeInstanceOf(Error);
        expect(res).toBe(null);

        saveTokenInfoSpy.mockRestore();
        requestTokenSpy.mockRestore();
        done();
      });
    });

    it('should catch lower level errors and send through callback', done => {
      const instance = new JwtTokenManager();
      const saveTokenInfoSpy = jest.spyOn(instance, 'saveTokenInfo');

      // because there is no access token, calling `saveTokenInfo` will
      // throw an error to be caught and returned in the callback
      const requestTokenSpy = jest
        .spyOn(instance, 'requestToken')
        .mockImplementation(cb => cb(null, { arbitrary_data: '12345' }));

      instance.getToken((err, res) => {
        expect(err).toBeInstanceOf(Error);
        expect(res).toBeNull();

        saveTokenInfoSpy.mockRestore();
        requestTokenSpy.mockRestore();
        done();
      });
    });

    it('should use an sdk-managed token if present and not expired', done => {
      const instance = new JwtTokenManager();
      instance.tokenInfo.access_token = ACCESS_TOKEN;
      instance.expireTime = getCurrentTime() + 1000;
      instance.getToken((err, res) => {
        expect(err).toBeNull();
        expect(res).toBe(ACCESS_TOKEN);
        done();
      });
    });
  });

  it('should callback with error if requestToken is not overriden', done => {
    const instance = new JwtTokenManager();

    instance.requestToken((err, res) => {
      expect(err).toBeInstanceOf(Error);
      expect(res).toBeNull();
      done();
    });
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
