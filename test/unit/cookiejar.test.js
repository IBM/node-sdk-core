'use strict';
process.env.NODE_DEBUG = 'axios';
jest.mock('axios');
const axios = require('axios');
const mockAxiosInstance = jest.fn();
const tough = require('tough-cookie');
mockAxiosInstance.defaults = {};
mockAxiosInstance.interceptors = {
  request: {
    use: jest.fn(),
  },
  response: {
    use: jest.fn(),
  },
};
axios.default.create.mockReturnValue(mockAxiosInstance);

const { RequestWrapper } = require('../../dist/lib/request-wrapper');
const requestWrapperInstance = new RequestWrapper({ jar: new tough.CookieJar() });

describe('axios', () => {
  let env;
  beforeEach(function() {
    jest.resetModules();
    env = process.env;
    process.env = {};
  });
  afterEach(function() {
    process.env = env;
  });
  it('should enable debug', () => {
    // these should have been called when requestWrapperInstance and when the cookiejar wrapper was instantiated
    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledTimes(2);
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledTimes(2);
  });

  it('should add flags to support cookiejars', () => {
    expect(requestWrapperInstance.axiosInstance.defaults.withCredentials).toBe(true);
  });

  it('should have a tough cookie jar', () => {
    expect(requestWrapperInstance.axiosInstance.defaults.jar).toBeInstanceOf(tough.CookieJar);
  });
});
