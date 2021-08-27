const nock = require('nock');
const rax = require('retry-axios');

const url = 'http://example.test-url.com';
nock.disableNetConnect();

const { NoAuthAuthenticator, BaseService } = require('../../dist');

const AUTHENTICATOR = new NoAuthAuthenticator();

const service = new BaseService({
  authenticator: AUTHENTICATOR,
  serviceUrl: url,
});

const parameters = {
  options: {
    method: 'GET',
    url: '/',
    headers: {},
  },
  defaultOptions: {
    serviceUrl: url,
  },
};

describe('Node Core retries', () => {
  beforeEach(() => {
    service.enableRetries();
  });

  afterEach(() => {
    nock.cleanAll();
    service.disableRetries();
  });

  it('should retry after we call enableRetries', async () => {
    const scopes = [
      nock(url).get('/').reply(429, undefined),
      nock(url).get('/').reply(200, 'retry success!'),
    ];

    const result = await service.createRequest(parameters);
    expect(result.result).toBe('retry success!');
    // ensure all mocks satisfied
    scopes.forEach((s) => s.done());
  });

  it('should not retry more than `maxRetries`', async () => {
    const scopes = [
      nock(url).get('/').reply(500, undefined),
      nock(url).get('/').reply(500, undefined), // should stop after this response
      nock(url).get('/').reply(200, 'should not get this!'),
    ];

    service.enableRetries({ maxRetries: 1 });

    // ensure 1 assertion executed in this test (i.e. promise not resolved.)
    expect.assertions(1);
    // eslint-disable-next-line jest/no-conditional-expect
    await service.createRequest(parameters).catch((err) => expect(err).toBeDefined());
  });

  it('should not retry after we call disableRetries', async () => {
    const scopes = [
      nock(url).get('/').reply(500, undefined),
      nock(url).get('/').reply(200, 'should not get this!'),
    ];

    // disable retries
    service.disableRetries();

    // ensure 1 assertion executed in this test (i.e. promise not resolved.)
    expect.assertions(1);
    // eslint-disable-next-line jest/no-conditional-expect
    await service.createRequest(parameters).catch((err) => expect(err).toBeDefined());
  });
});
