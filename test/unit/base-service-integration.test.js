'use strict';

const util = require('util');
const BaseService = require('../../lib/base_service').BaseService;

function TestService(options) {
  BaseService.call(this, options);
}

util.inherits(TestService, BaseService);

TestService.prototype.name = 'test';
TestService.prototype.version = 'v1';

TestService.URL = 'https://gateway.watsonplatform.net/test/api';

/*
 * Test the way the BaseService interacts with other modules
*/
describe('Base service - token manager - integration', function() {
  it('should propagate request properties to token managers', function() {
    const hostname = 'jabba.the.hutt';
    const port = 'mos eisley';

    const instance = new TestService({
      iam_apikey: 'r2-d2',
      proxy: {
        hostname,
        port,
      },
    });

    expect(instance.tokenManager).toBeDefined();

    const axiosOptions = instance.tokenManager.requestWrapperInstance.axiosInstance.defaults;
    expect(axiosOptions.proxy.hostname).toBe(hostname);
    expect(axiosOptions.proxy.port).toBe(port);
  });
});
