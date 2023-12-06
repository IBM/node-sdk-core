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

const url = {
  cloud1: 'https://region1.cloud.ibm.com',
  cloud2: 'https://region2.cloud.ibm.com',
  notCloud1: 'https://region1.notcloud.ibm.com',
  notCloud2: 'https://region2.notcloud.ibm.com',
};

const safeHeaders = {
  Authorization: 'foo',
  Cookie: 'baz',
  Cookie2: 'baz2',
  'WWW-Authenticate': 'bar',
};

const testPaths = [
  { port: '', path: '/', redirectedPort: '', redirectedPath: '/' },
  { port: ':3000', path: '/', redirectedPort: '', redirectedPath: '/' },
  { port: ':3000', path: '/', redirectedPort: ':3333', redirectedPath: '/' },
  {
    port: '',
    path: '/a/very/long/path/with?some=query&params=the_end',
    redirectedPort: '',
    redirectedPath: '/',
  },
  {
    port: ':3000',
    path: '/a/very/long/path/with?some=query&params=the_end',
    redirectedPort: '',
    redirectedPath: '/',
  },
  {
    port: ':3000',
    path: '/a/very/long/path/with?some=query&params=the_end',
    redirectedPort: '',
    redirectedPath: '/api/v1',
  },
  {
    port: ':3000',
    path: '/a/very/long/path/with?some=query&params=the_end',
    redirectedPort: ':3000',
    redirectedPath: '/api/v1',
  },
];

// These test cases are created based on the logic in the `follow-redirects` package.
// See more: https://github.com/follow-redirects/follow-redirects/blob/main/index.js#L402
const testMatrix = [
  {
    status1: 301,
    status2: 200,
    method1: 'GET',
    method2: 'GET',
    methodExpected: 'GET',
    bodyDropped: false,
  },
  {
    status1: 301,
    status2: 200,
    method1: 'POST',
    method2: 'GET',
    methodExpected: 'GET',
    bodyDropped: true,
  },
  {
    status1: 302,
    status2: 200,
    method1: 'GET',
    method2: 'GET',
    methodExpected: 'GET',
    bodyDropped: false,
  },
  {
    status1: 302,
    status2: 200,
    method1: 'POST',
    method2: 'GET',
    methodExpected: 'GET',
    bodyDropped: true,
  },
  {
    status1: 303,
    status2: 200,
    method1: 'GET',
    method2: 'GET',
    methodExpected: 'GET',
    bodyDropped: false,
  },
  {
    status1: 303,
    status2: 200,
    method1: 'POST',
    method2: 'GET',
    methodExpected: 'GET',
    bodyDropped: true,
  },
  {
    status1: 307,
    status2: 200,
    method1: 'GET',
    method2: 'GET',
    methodExpected: 'GET',
    bodyDropped: false,
  },
  {
    status1: 307,
    status2: 200,
    method1: 'POST',
    method2: 'POST',
    methodExpected: 'POST',
    bodyDropped: false,
  },
  {
    status1: 308,
    status2: 200,
    method1: 'GET',
    method2: 'GET',
    methodExpected: 'GET',
    bodyDropped: false,
  },
  {
    status1: 308,
    status2: 200,
    method1: 'POST',
    method2: 'POST',
    methodExpected: 'POST',
    bodyDropped: false,
  },
];

async function runTest(url1, url2, safeHeadersIncluded) {
  // eslint-disable-next-line no-restricted-syntax
  for (const testPath of testPaths) {
    // eslint-disable-next-line no-restricted-syntax
    for (const testCase of testMatrix) {
      const service = new BaseService({
        authenticator: new NoAuthAuthenticator(),
        serviceUrl: url1 + testPath.port,
      });

      const parameters = {
        options: {
          method: testCase.method1,
          url: testPath.path,
          headers: safeHeaders,
          body: 'Am I redirected?',
        },
        defaultOptions: {
          serviceUrl: url1 + testPath.port,
        },
      };

      // Put together the first mock.
      let scope1 = nock(url1 + testPath.port)
        .matchHeader('Authorization', safeHeaders.Authorization)
        .matchHeader('Cookie', safeHeaders.Cookie)
        .matchHeader('Cookie2', safeHeaders.Cookie2)
        .matchHeader('WWW-Authenticate', safeHeaders['WWW-Authenticate']);

      switch (testCase.method1) {
        case 'GET':
          scope1 = scope1.get(testPath.path);
          break;
        case 'POST':
          scope1 = scope1.post(testPath.path);
          break;
        default:
          throw new Error('unsupported HTTP method');
      }

      scope1 = scope1.reply((_, requestBody) => [
        testCase.status1,
        requestBody,
        { Location: url2 + testPath.redirectedPort + testPath.redirectedPath },
      ]);

      // Now create the second, redirected mock.
      let scope2 = nock(url2 + testPath.redirectedPort)
        .matchHeader(
          'Authorization',
          (val) => val === (safeHeadersIncluded ? safeHeaders.Authorization : undefined)
        )
        .matchHeader(
          'Cookie',
          (val) => val === (safeHeadersIncluded ? safeHeaders.Cookie : undefined)
        )
        .matchHeader('Cookie2', safeHeaders.Cookie2)
        .matchHeader('WWW-Authenticate', safeHeaders['WWW-Authenticate']);

      switch (testCase.method2) {
        case 'GET':
          scope2 = scope2.get(testPath.redirectedPath);
          break;
        case 'POST':
          scope2 = scope2.post(testPath.redirectedPath);
          break;
        default:
          throw new Error('unsupported HTTP method');
      }

      scope2 = scope2.reply((_, requestBody) => [testCase.status2, requestBody]);

      // eslint-disable-next-line no-await-in-loop
      const result = await service.createRequest(parameters);
      expect(result.result).toBe(testCase.bodyDropped ? '' : 'Am I redirected?');
      expect(result.status).toBe(200);

      // Ensure all mocks satisfied.
      scope1.done();
      scope2.done();
    }
  }

  // Clean-up the mocks.
  nock.cleanAll();
}

describe('Node Core redirects', () => {
  /* eslint-disable jest/expect-expect */
  it('should include safe headers within cloud.ibm.com domain', async () => {
    await runTest(url.cloud1, url.cloud2, true);
  });

  it('should exclude safe headers from cloud.ibm.com to not cloud.ibm.com domain', async () => {
    await runTest(url.cloud1, url.notCloud2, false);
  });

  it('should exclude safe headers from not cloud.ibm.com to cloud.ibm.com domain', async () => {
    await runTest(url.notCloud2, url.cloud1, false);
  });

  it('should exclude safe headers from not cloud.ibm.com to not cloud.ibm.com domain', async () => {
    await runTest(url.notCloud1, url.notCloud2, false);
  });

  it('should include safe headers for the same host within cloud.ibm.com', async () => {
    await runTest(url.cloud1, url.cloud1, true);
  });

  it('should include safe headers for the same host outside cloud.ibm.com', async () => {
    await runTest(url.notCloud2, url.notCloud2, true);
  });
  /* eslint-enable jest/expect-expect */

  it('should fail due to exhaustion', async () => {
    const scopes = [];
    for (let i = 1; i <= 11; i++) {
      scopes.push(
        nock(`https://region${i}.cloud.ibm.com`)
          .matchHeader('Authorization', safeHeaders.Authorization)
          .matchHeader('Cookie', safeHeaders.Cookie)
          .matchHeader('Cookie2', safeHeaders.Cookie2)
          .matchHeader('WWW-Authenticate', safeHeaders['WWW-Authenticate'])
          .get('/')
          .reply(302, 'just about to redirect', {
            Location: `https://region${i + 1}.cloud.ibm.com`,
          })
      );
    }

    const service = new BaseService({
      authenticator: new NoAuthAuthenticator(),
      serviceUrl: 'https://region1.cloud.ibm.com',
    });

    const parameters = {
      options: {
        method: 'GET',
        url: '/',
        headers: safeHeaders,
      },
      defaultOptions: {
        serviceUrl: 'https://region1.cloud.ibm.com',
      },
    };

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
