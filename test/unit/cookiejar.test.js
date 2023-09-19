/**
 * (C) Copyright IBM Corp. 2020, 2023.
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

const tough = require('tough-cookie');
const nock = require('nock');
const { CookieInterceptor } = require('../../dist/lib/cookie-support');
const { RequestWrapper } = require('../../dist/lib/request-wrapper');
const { NoAuthAuthenticator, BaseService } = require('../../dist');

// DEBUG also uses an interceptor so if we want to debug when running the tests
// we need our expectations adjusted by 1
const noCookieInterceptorSize = process.env.NODE_DEBUG === 'axios' || process.env.DEBUG ? 1 : 0;
const cookieInterceptorSize = process.env.NODE_DEBUG === 'axios' || process.env.DEBUG ? 2 : 1;
const mockRequest = { url: 'https://cookie.example' };
const mockResponse = {
  headers: { 'set-cookie': ['foo=bar'] },
  config: { url: 'https://cookie.example' },
};

function getInterceptors(requestWrapper, type) {
  return requestWrapper.axiosInstance.interceptors[type].handlers;
}

/**
 * Helper to get the cookie interceptor from potentially multiple interceptors.
 * The ordering of interceptors is different between different axios versions
 * so identify the correct interceptor from the function name.
 */
function getCookieInterceptor(requestWrapper, type) {
  const interceptors = getInterceptors(requestWrapper, type);
  for (let i = 0; i < interceptors.length; i++) {
    const iFulfilledFn = interceptors[i].fulfilled;
    expect(iFulfilledFn).toBeInstanceOf(Function);
    if (`${type}CookieInterceptor` === iFulfilledFn.name) {
      return iFulfilledFn;
    }
  }
  throw new Error(`There should have been a cookie ${type} interceptor`);
}

describe('cookie interceptor', () => {
  it('should create a tough-cookie jar provided jar: true', () => {
    const cookieInterceptor = new CookieInterceptor(true);
    expect(cookieInterceptor.cookieJar).toBeInstanceOf(tough.CookieJar);
  });

  it('should error provided jar: false', () => {
    expect(() => {
      const interceptor = new CookieInterceptor(false);
    }).toThrow();
  });

  it('should use proivded CookieJar', () => {
    const cookieJar = new tough.CookieJar();
    const cookieInterceptor = new CookieInterceptor(cookieJar);
    expect(cookieInterceptor.cookieJar).toEqual(cookieJar);
  });

  it('should use arbitrarly provided jar', () => {
    const mockCookieJar = {
      getCookieString: () => 'mock-string',
    };
    const cookieInterceptor = new CookieInterceptor(mockCookieJar);
    expect(cookieInterceptor.cookieJar).toEqual(mockCookieJar);
  });

  it('request interceptor should get cookies', async () => {
    const jar = new tough.CookieJar();
    const spiedGetCookie = jest.spyOn(jar, 'getCookieString');
    const cookieInterceptor = new CookieInterceptor(jar);
    await cookieInterceptor.requestInterceptor(mockRequest);
    expect(spiedGetCookie).toHaveBeenCalled();
  });

  it('response interceptor should store cookies', async () => {
    const jar = new tough.CookieJar();
    const spiedSetCookie = jest.spyOn(jar, 'setCookie');
    const cookieInterceptor = new CookieInterceptor(jar);
    await cookieInterceptor.responseInterceptor(mockResponse);
    expect(spiedSetCookie).toHaveBeenCalled();
  });

  it('should store a cookie and then use the cookie', async () => {
    const jar = new tough.CookieJar();
    const cookieInterceptor = new CookieInterceptor(jar);
    const spiedGetCookie = jest.spyOn(jar, 'getCookieString');
    await cookieInterceptor.responseInterceptor(mockResponse);
    await cookieInterceptor.requestInterceptor(mockRequest);
    return expect(spiedGetCookie.mock.results[0].value).resolves.toEqual('foo=bar');
  });

  it('should store and retrieve multiple cookies', async () => {
    const jar = new tough.CookieJar();
    const cookieInterceptor = new CookieInterceptor(jar);
    const spiedGetCookie = jest.spyOn(jar, 'getCookieString');
    const mockResponseMulti = {
      headers: { 'set-cookie': ['foo=bar', 'baz=boo'] },
      config: { url: 'https://cookie.example' },
    };
    await cookieInterceptor.responseInterceptor(mockResponseMulti);
    await cookieInterceptor.requestInterceptor(mockRequest);
    return expect(spiedGetCookie.mock.results[0].value).resolves.toEqual('foo=bar; baz=boo');
  });

  it('should return coookies for paths', async () => {
    const jar = new tough.CookieJar();
    const cookieInterceptor = new CookieInterceptor(jar);
    const spiedGetCookie = jest.spyOn(jar, 'getCookieString');
    const mockOperationRequest = { url: 'https://cookie.example/api/v3/operation/path' };
    const mockLoginResponse = {
      headers: {
        'set-cookie': ['foo=bar; Max-Age=86400; Path=/; HttpOnly; Secure; SameSite=Strict'],
      },
      config: { url: 'https://cookie.example/session/login' },
    };
    await cookieInterceptor.responseInterceptor(mockLoginResponse);
    await cookieInterceptor.requestInterceptor(mockOperationRequest);
    return expect(spiedGetCookie.mock.results[0].value).resolves.toEqual('foo=bar');
  });

  it('should not return coookies for other domains', async () => {
    const jar = new tough.CookieJar();
    const cookieInterceptor = new CookieInterceptor(jar);
    const spiedGetCookie = jest.spyOn(jar, 'getCookieString');
    const mockOperationRequest = { url: 'https://more-cookies.example/api' };
    const mockLoginResponse = {
      headers: {
        'set-cookie': ['foo=bar; Max-Age=86400; Path=/; HttpOnly; Secure; SameSite=Strict'],
      },
      config: { url: 'https://cookie.example/api' },
    };
    await cookieInterceptor.responseInterceptor(mockLoginResponse);
    await cookieInterceptor.requestInterceptor(mockOperationRequest);
    return expect(spiedGetCookie.mock.results[0].value).resolves.toBeFalsy();
  });
});

describe('cookie jar support', () => {
  it('should not add interceptors by default', () => {
    const wrapper = new RequestWrapper();
    expect(getInterceptors(wrapper, 'request')).toHaveLength(noCookieInterceptorSize);
    expect(getInterceptors(wrapper, 'response')).toHaveLength(noCookieInterceptorSize);
  });

  it('given `true` for `jar`, the request-wrapper should have interceptors', async () => {
    const wrapper = new RequestWrapper({ jar: true });

    expect(getInterceptors(wrapper, 'request')).toHaveLength(cookieInterceptorSize);
    expect(getInterceptors(wrapper, 'response')).toHaveLength(cookieInterceptorSize);

    const cookieRequestInterceptor = getCookieInterceptor(wrapper, 'request');
    const cookieResponseInterceptor = getCookieInterceptor(wrapper, 'response');

    // invoke the interceptors
    await cookieRequestInterceptor({
      ...wrapper.axiosInstance.defaults,
      ...mockRequest,
    });
    await cookieResponseInterceptor(mockResponse);
  });

  it('given a tough-cookie jar for `jar`, the jar should be used', async () => {
    const cookieJar = new tough.CookieJar();
    const wrapper = new RequestWrapper({ jar: cookieJar });

    expect(wrapper.axiosInstance.defaults.jar).toEqual(cookieJar);

    expect(getInterceptors(wrapper, 'request')).toHaveLength(cookieInterceptorSize);
    expect(getInterceptors(wrapper, 'response')).toHaveLength(cookieInterceptorSize);

    const cookieRequestInterceptor = getCookieInterceptor(wrapper, 'request');
    const cookieResponseInterceptor = getCookieInterceptor(wrapper, 'response');

    // Invoke the interceptors and assert they called the jar
    // Request
    const spiedGetCookie = jest.spyOn(cookieJar, 'getCookieString');
    await cookieRequestInterceptor({ ...wrapper.axiosInstance.defaults, ...mockRequest });
    expect(spiedGetCookie).toHaveBeenCalledTimes(1);
    // Response
    const spiedSetCookie = jest.spyOn(cookieJar, 'setCookie');
    await cookieResponseInterceptor(mockResponse);
    expect(spiedSetCookie).toHaveBeenCalledTimes(1);
  });

  it('given arbitrary value for `jar` it should be used as cookie jar', async () => {
    const mockCookieJar = {
      getCookieString: () => 'mock-string',
      setCookie: () => {},
    };
    const wrapper = new RequestWrapper({ jar: mockCookieJar });

    expect(wrapper.axiosInstance.defaults.jar).toEqual(mockCookieJar);

    expect(getInterceptors(wrapper, 'request')).toHaveLength(cookieInterceptorSize);
    expect(getInterceptors(wrapper, 'response')).toHaveLength(cookieInterceptorSize);

    const cookieRequestInterceptor = getCookieInterceptor(wrapper, 'request');
    const cookieResponseInterceptor = getCookieInterceptor(wrapper, 'response');

    // Invoke the interceptors and assert they called the jar
    // Request
    const spiedGetCookie = jest.spyOn(mockCookieJar, 'getCookieString');
    cookieRequestInterceptor({ ...wrapper.axiosInstance.defaults, ...mockRequest });
    expect(spiedGetCookie).toHaveBeenCalledTimes(1);
    // Response
    const spiedSetCookie = jest.spyOn(mockCookieJar, 'setCookie');
    await cookieResponseInterceptor(mockResponse);
    expect(spiedSetCookie).toHaveBeenCalledTimes(1);
  });
});
describe('end-to-end tests', () => {
  const cookieJar = new tough.CookieJar();
  const url = 'http://cookie-test.com';
  const path = '/cookieTest';
  nock.disableNetConnect();

  const service = new BaseService({
    authenticator: new NoAuthAuthenticator(),
    serviceUrl: url,
    jar: cookieJar,
  });

  const parameters = {
    options: {
      method: 'GET',
      url: path,
      headers: {},
    },
    defaultOptions: {
      serviceUrl: url,
    },
  };

  let setCookieSpy;
  let getCookieStringSpy;

  beforeEach(() => {
    setCookieSpy = jest.spyOn(cookieJar, 'setCookie').mockImplementation(() => {});
    getCookieStringSpy = jest.spyOn(cookieJar, 'getCookieString').mockImplementation(() => {});
  });

  afterEach(() => {
    nock.cleanAll();
    setCookieSpy.mockRestore();
    getCookieStringSpy.mockRestore();
  });

  it('success response', async () => {
    const scope = nock(url)
      .get(path)
      .reply(200, 'we have cookies!', { 'set-cookie': 'foo=bar; Secure; HttpOnly' });

    const result = await service.createRequest(parameters);

    expect(scope.isDone()).toBe(true);
    expect(getCookieStringSpy).toHaveBeenCalled();
    expect(setCookieSpy).toHaveBeenCalled();
  });
  it('error response', async () => {
    const scope = nock(url)
      .get(path)
      .reply(400, 'someone ate the cookies!', { 'set-cookie': 'foo=bar; Secure; HttpOnly' });

    try {
      await service.createRequest(parameters);
    } finally {
      expect(scope.isDone()).toBe(true);
      expect(getCookieStringSpy).toHaveBeenCalled();
      expect(setCookieSpy).toHaveBeenCalled();
    }
  });
});
