/**
 * Copyright 2023 IBM Corp. All Rights Reserved.
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

const nock = require('nock');
const { AxiosError } = require('axios');
const { NoAuthAuthenticator, BaseService } = require('../../dist');

// Disable real network connections.
nock.disableNetConnect();

const safeHeaders = {
  Authorization: 'foo',
  Cookie: 'baz',
  Cookie2: 'baz2',
  'WWW-Authenticate': 'bar',
};

function initService(url) {
  const service = new BaseService({
    authenticator: new NoAuthAuthenticator(),
    serviceUrl: url,
  });

  const parameters = {
    options: {
      method: 'GET',
      url: '/',
      headers: safeHeaders,
    },
    defaultOptions: {
      serviceUrl: url,
    },
  };

  return { service, parameters };
}

describe('Node Core redirects', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('should include safe headers within cloud.ibm.com domain', async () => {
    const url1 = 'http://region1.cloud.ibm.com';
    const url2 = 'http://region2.cloud.ibm.com';

    const { service, parameters } = initService(url1);

    const scopes = [
      nock(url1)
        .matchHeader('Authorization', safeHeaders.Authorization)
        .matchHeader('Cookie', safeHeaders.Cookie)
        .matchHeader('Cookie2', safeHeaders.Cookie2)
        .matchHeader('WWW-Authenticate', safeHeaders['WWW-Authenticate'])
        .get('/')
        .reply(302, 'just about to redirect', { Location: url2 }),
      nock(url2)
        .matchHeader('Authorization', safeHeaders.Authorization)
        .matchHeader('Cookie', safeHeaders.Cookie)
        .matchHeader('Cookie2', safeHeaders.Cookie2)
        .matchHeader('WWW-Authenticate', safeHeaders['WWW-Authenticate'])
        .get('/')
        .reply(200, 'successfully redirected'),
    ];

    const result = await service.createRequest(parameters);
    expect(result.result).toBe('successfully redirected');
    expect(result.status).toBe(200);

    // Ensure all mocks satisfied.
    scopes.forEach((s) => s.done());
  });

  it('should exclude safe headers from cloud.ibm.com to not cloud.ibm.com domain', async () => {
    const url1 = 'http://region1.cloud.ibm.com';
    const url2 = 'http://region2.notcloud.ibm.com';

    const { service, parameters } = initService(url1);

    const scopes = [
      nock(url1)
        .matchHeader('Authorization', safeHeaders.Authorization)
        .matchHeader('Cookie', safeHeaders.Cookie)
        .matchHeader('Cookie2', safeHeaders.Cookie2)
        .matchHeader('WWW-Authenticate', safeHeaders['WWW-Authenticate'])
        .get('/')
        .reply(302, 'just about to redirect', { Location: url2 }),
      nock(url2)
        .matchHeader('Authorization', (val) => val === undefined)
        .matchHeader('Cookie', (val) => val === undefined)
        .matchHeader('Cookie2', safeHeaders.Cookie2)
        .matchHeader('WWW-Authenticate', safeHeaders['WWW-Authenticate'])
        .get('/')
        .reply(200, 'successfully redirected'),
    ];

    const result = await service.createRequest(parameters);

    expect(result.result).toBe('successfully redirected');
    expect(result.status).toBe(200);

    // Ensure all mocks satisfied.
    scopes.forEach((s) => s.done());
  });

  it('should exclude safe headers from not cloud.ibm.com to cloud.ibm.com domain', async () => {
    const url1 = 'http://region2.notcloud.ibm.com';
    const url2 = 'http://region1.cloud.ibm.com';

    const { service, parameters } = initService(url1);

    const scopes = [
      nock(url1)
        .matchHeader('Authorization', safeHeaders.Authorization)
        .matchHeader('Cookie', safeHeaders.Cookie)
        .matchHeader('Cookie2', safeHeaders.Cookie2)
        .matchHeader('WWW-Authenticate', safeHeaders['WWW-Authenticate'])
        .get('/')
        .reply(302, 'just about to redirect', { Location: url2 }),
      nock(url2)
        .matchHeader('Authorization', (val) => val === undefined)
        .matchHeader('Cookie', (val) => val === undefined)
        .matchHeader('Cookie2', safeHeaders.Cookie2)
        .matchHeader('WWW-Authenticate', safeHeaders['WWW-Authenticate'])
        .get('/')
        .reply(200, 'successfully redirected'),
    ];

    const result = await service.createRequest(parameters);

    expect(result.result).toBe('successfully redirected');
    expect(result.status).toBe(200);

    // Ensure all mocks satisfied.
    scopes.forEach((s) => s.done());
  });

  it('should exclude safe headers from not cloud.ibm.com to not cloud.ibm.com domain', async () => {
    const url1 = 'http://region1.notcloud.ibm.com';
    const url2 = 'http://region2.notcloud.ibm.com';

    const { service, parameters } = initService(url1);

    const scopes = [
      nock(url1)
        .matchHeader('Authorization', safeHeaders.Authorization)
        .matchHeader('Cookie', safeHeaders.Cookie)
        .matchHeader('Cookie2', safeHeaders.Cookie2)
        .matchHeader('WWW-Authenticate', safeHeaders['WWW-Authenticate'])
        .get('/')
        .reply(302, 'just about to redirect', { Location: url2 }),
      nock(url2)
        .matchHeader('Authorization', (val) => val === undefined)
        .matchHeader('Cookie', (val) => val === undefined)
        .matchHeader('Cookie2', safeHeaders.Cookie2)
        .matchHeader('WWW-Authenticate', safeHeaders['WWW-Authenticate'])
        .get('/')
        .reply(200, 'successfully redirected'),
    ];

    const result = await service.createRequest(parameters);

    expect(result.result).toBe('successfully redirected');
    expect(result.status).toBe(200);

    // Ensure all mocks satisfied.
    scopes.forEach((s) => s.done());
  });

  it('should fail due to exhaustion', async () => {
    const scopes = [];
    for (let i = 1; i <= 11; i++) {
      scopes.push(
        nock(`http://region${i}.cloud.ibm.com`)
          .matchHeader('Authorization', safeHeaders.Authorization)
          .matchHeader('Cookie', safeHeaders.Cookie)
          .matchHeader('Cookie2', safeHeaders.Cookie2)
          .matchHeader('WWW-Authenticate', safeHeaders['WWW-Authenticate'])
          .get('/')
          .reply(302, 'just about to redirect', { Location: `http://region${i + 1}.cloud.ibm.com` })
      );
    }

    const { service, parameters } = initService('http://region1.cloud.ibm.com');

    let result;
    let error;
    try {
      result = await service.createRequest(parameters);
    } catch (err) {
      error = err;
    }

    expect(result).toBeUndefined();
    expect(error).not.toBeUndefined();
    expect(error.statusText).toBe(AxiosError.ERR_FR_TOO_MANY_REDIRECTS);
  });
});
