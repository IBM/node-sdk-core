/* eslint-disable no-alert, no-console */

/**
 * (C) Copyright IBM Corp. 2019, 2024.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

jest.mock('jsonwebtoken/decode');
const decode = require('jsonwebtoken/decode');

decode.mockImplementation(() => ({ exp: 100, iat: 100 }));

const { JwtTokenManager } = require('../../dist/auth');
const logger = require('../../dist/lib/logger').default;

function getCurrentTime() {
  return Math.floor(Date.now() / 1000);
}

const ACCESS_TOKEN = 'abc123';
const CURRENT_ACCESS_TOKEN = 'abc123';

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
    it('should request a token if no token is stored', async () => {
      const instance = new JwtTokenManager();
      const saveTokenInfoSpy = jest.spyOn(instance, 'saveTokenInfo');

      decode.mockImplementation((token) => ({ iat: 10, exp: 100 }));

      const requestTokenSpy = jest
        .spyOn(instance, 'requestToken')
        .mockImplementation(() => Promise.resolve({ result: { access_token: ACCESS_TOKEN } }));

      const token = await instance.getToken();
      expect(requestTokenSpy).toHaveBeenCalled();
      expect(saveTokenInfoSpy).toHaveBeenCalled();
      expect(decode).toHaveBeenCalled();
      expect(token).toBe(ACCESS_TOKEN);

      saveTokenInfoSpy.mockRestore();
      decode.mockRestore();
      requestTokenSpy.mockRestore();
    });

    it('should pace token requests', async () => {
      const instance = new JwtTokenManager();

      decode.mockImplementation((token) => ({ iat: 10, exp: 100 }));

      const requestTokenSpy = jest.spyOn(instance, 'requestToken').mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 500, { result: { access_token: ACCESS_TOKEN } });
          })
      );

      const tokens = await Promise.all([
        instance.getToken(),
        instance.getToken(),
        instance.getToken(),
      ]);

      expect(tokens).toHaveLength(3);
      expect(tokens.every((token) => token === tokens[0])).toBe(true);
      expect(requestTokenSpy).toHaveBeenCalled();
      expect(requestTokenSpy.mock.calls).toHaveLength(1);

      decode.mockRestore();
      requestTokenSpy.mockRestore();
    });

    it('should reject all paced token requests on error from token service', async () => {
      const instance = new JwtTokenManager();

      const requestTokenSpy = jest.spyOn(instance, 'requestToken').mockImplementation(
        () =>
          new Promise((reject) => {
            setTimeout(reject, 500, new Error('Sumpin bad happened'));
          })
      );

      const reqs = [instance.getToken(), instance.getToken(), instance.getToken()];

      let token;
      let errCount = 0;
      for (let i = 0; i < reqs.length; i++) {
        try {
          /* eslint-disable-next-line no-await-in-loop */
          token = await reqs[i];
        } catch (e) {
          errCount++;
        }
      }

      expect(token).toBeUndefined();
      expect(errCount).toBe(3);
      expect(requestTokenSpy).toHaveBeenCalled();
      expect(requestTokenSpy.mock.calls).toHaveLength(1);

      requestTokenSpy.mockRestore();
    });

    it('should request a token if token is stored but is expired', async () => {
      const instance = new JwtTokenManager();
      instance.accessToken = CURRENT_ACCESS_TOKEN;

      const saveTokenInfoSpy = jest.spyOn(instance, 'saveTokenInfo');
      const tokenNeedsRefreshSpy = jest.spyOn(instance, 'tokenNeedsRefresh');
      decode.mockImplementation((token) => ({ iat: 10, exp: 100 }));

      const isTokenExpiredSpy = jest
        .spyOn(instance, 'isTokenExpired')
        .mockImplementation(() => true);

      const requestTokenSpy = jest
        .spyOn(instance, 'requestToken')
        .mockImplementation(() => Promise.resolve({ result: { access_token: ACCESS_TOKEN } }));

      const token = await instance.getToken();
      expect(requestTokenSpy).toHaveBeenCalled();
      expect(saveTokenInfoSpy).toHaveBeenCalled();
      expect(decode).toHaveBeenCalled();
      expect(token).toBe(ACCESS_TOKEN);
      expect(instance.accessToken).toBe(ACCESS_TOKEN);
      expect(tokenNeedsRefreshSpy).not.toHaveBeenCalled();

      saveTokenInfoSpy.mockRestore();
      decode.mockRestore();
      requestTokenSpy.mockRestore();
      tokenNeedsRefreshSpy.mockRestore();
    });

    it('should refresh token if token is stored but needs refresh (close to expired)', async () => {
      const instance = new JwtTokenManager();
      instance.accessToken = CURRENT_ACCESS_TOKEN;

      const saveTokenInfoSpy = jest.spyOn(instance, 'saveTokenInfo');
      decode.mockImplementation((token) => ({ iat: 10, exp: 100 }));

      const isTokenExpiredSpy = jest
        .spyOn(instance, 'isTokenExpired')
        .mockImplementation(() => false);

      const requestTokenSpy = jest
        .spyOn(instance, 'requestToken')
        .mockImplementation(() => Promise.resolve({ result: { access_token: ACCESS_TOKEN } }));

      const token = await instance.getToken();
      expect(requestTokenSpy).toHaveBeenCalled();
      expect(saveTokenInfoSpy).toHaveBeenCalled();
      expect(token).toBe(CURRENT_ACCESS_TOKEN);
      expect(instance.accessToken).toBe(ACCESS_TOKEN);
      expect(decode).toHaveBeenCalled();

      saveTokenInfoSpy.mockRestore();
      requestTokenSpy.mockRestore();
      isTokenExpiredSpy.mockRestore();
      decode.mockRestore();
    });

    it('should return stored token without error if token refresh fails but should not save token info', async () => {
      const instance = new JwtTokenManager();
      instance.accessToken = CURRENT_ACCESS_TOKEN;

      const saveTokenInfoSpy = jest.spyOn(instance, 'saveTokenInfo');

      const isTokenExpiredSpy = jest
        .spyOn(instance, 'isTokenExpired')
        .mockImplementation(() => false);

      const requestTokenSpy = jest
        .spyOn(instance, 'requestToken')
        .mockImplementation(() => Promise.reject(new Error('Connection Refused')));

      const errorLogSpy = jest.spyOn(logger, 'error');
      const debugLogSpy = jest.spyOn(logger, 'debug');

      const token = await instance.getToken();

      expect(requestTokenSpy).toHaveBeenCalled();
      expect(isTokenExpiredSpy).toHaveBeenCalled();
      expect(saveTokenInfoSpy).not.toHaveBeenCalled();
      expect(token).toBe(CURRENT_ACCESS_TOKEN);

      expect(errorLogSpy).toHaveBeenCalled();
      expect(errorLogSpy.mock.calls[0][0]).toMatch(
        'Attempted token refresh failed. The refresh will be retried with the next request. Connection Refused'
      );

      expect(debugLogSpy).toHaveBeenCalled();
      const debugArg = debugLogSpy.mock.calls[1][0];
      expect(debugArg).toBeInstanceOf(Error);
      expect(debugArg.stack).toMatch(/Error: Connection Refused\n.*at JwtTokenManager/);

      saveTokenInfoSpy.mockRestore();
      requestTokenSpy.mockRestore();
      isTokenExpiredSpy.mockRestore();
      errorLogSpy.mockRestore();
      debugLogSpy.mockRestore();
    });

    it('should not save token info or return token if paced token request returned an error', async () => {
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
    });

    it('should catch and reject lower level errors', async () => {
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
    });

    it('should use an sdk-managed token if present and not expired', async () => {
      const instance = new JwtTokenManager();
      instance.tokenInfo.access_token = ACCESS_TOKEN;
      instance.accessToken = ACCESS_TOKEN;
      instance.expireTime = getCurrentTime() + 1000;
      instance.refreshTime = getCurrentTime() + 800;
      const token = await instance.getToken();
      expect(token).toBe(ACCESS_TOKEN);
    });
  });

  it('should reject with error if requestToken is not overriden', async () => {
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

  describe('tokenNeedsRefresh', () => {
    it('should return true if current time is past refresh time', () => {
      const instance = new JwtTokenManager();
      instance.refreshTime = getCurrentTime() - 1000;

      expect(instance.tokenNeedsRefresh()).toBe(true);
    });

    it('should return false if current time has not reached refresh time', () => {
      const instance = new JwtTokenManager();
      instance.refreshTime = getCurrentTime() + 1000;

      expect(instance.tokenNeedsRefresh()).toBe(false);
    });

    it('should return true if refresh time has not been set', () => {
      const instance = new JwtTokenManager();
      expect(instance.tokenNeedsRefresh()).toBe(true);
    });
  });

  describe('saveTokenInfo', () => {
    it('should save information to object state', () => {
      const instance = new JwtTokenManager();
      decode.mockImplementation((token) => ({ iat: 10, exp: 100 }));

      const tokenResponse = { result: { access_token: ACCESS_TOKEN } };

      instance.saveTokenInfo(tokenResponse);
      expect(instance.expireTime).toBe(100);
      expect(instance.tokenInfo).toEqual(tokenResponse.result);
      decode.mockRestore();
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
      decode.mockImplementation((token) => ({ iat: 100, exp: 200 }));

      const tokenResponse = { result: { access_token: ACCESS_TOKEN } };

      instance.saveTokenInfo(tokenResponse);
      expect(instance.refreshTime).toBe(180);
      decode.mockRestore();
    });

    it('should throw an error if token is not a valid jwt', () => {
      const instance = new JwtTokenManager();
      expect(() => instance.calculateTimeForNewToken()).toThrow();
    });

    it('should gracefully handle a jwt without exp or iat claims', () => {
      const instance = new JwtTokenManager();
      decode.mockImplementation((token) => ({ foo: 0, bar: 100 }));

      const tokenResponse = { result: { access_token: ACCESS_TOKEN } };

      instance.saveTokenInfo(tokenResponse);
      expect(instance.expireTime).toBe(0);
      expect(instance.tokenInfo).toEqual(tokenResponse.result);
      decode.mockRestore();
    });
  });
});
