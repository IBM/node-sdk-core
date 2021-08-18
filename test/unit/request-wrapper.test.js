const fs = require('fs');
const https = require('https');
const { Readable } = require('stream');
const zlib = require('zlib');
const logger = require('../../dist/lib/logger').default;

process.env.NODE_DEBUG = 'axios';
jest.mock('axios');
// eslint-disable-next-line import/order
const axios = require('axios');

const mockAxiosInstance = jest.fn();
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

const requestWrapperInstance = new RequestWrapper();

describe('axios', () => {
  let env;
  beforeEach(() => {
    jest.resetModules();
    env = process.env;
    process.env = {};
  });
  afterEach(() => {
    process.env = env;
  });
  it('should enable debug', () => {
    // these should have been called when requestWrapperInstance was instantiated
    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledTimes(1);
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledTimes(1);
  });
});

describe('RequestWrapper constructor', () => {
  // note: the cookie jar support is tested in cookiejar.test.js,
  // so ignoring that here.
  // also, the debug interceptors are tested elsewhere in this file

  // the axios mock needs slightly different behavior here
  beforeEach(() => {
    axios.default.create.mockClear();
  });

  it('should handle scenario that no arguments are provided', () => {
    const rw = new RequestWrapper();
    expect(rw).toBeInstanceOf(RequestWrapper);

    // without any arguments, the constructor should set its member variables accordingly
    expect(rw.compressRequestData).toBe(false);
  });

  it('should set defaults for certain axios configurations', () => {
    const unused = new RequestWrapper();

    // the constructor puts together a config object and creates the
    // axios instance with it
    const createdAxiosConfig = axios.default.create.mock.calls[0][0];
    expect(createdAxiosConfig.maxContentLength).toBe(Infinity);
    expect(createdAxiosConfig.maxBodyLength).toBe(Infinity);
    expect(createdAxiosConfig.headers).toBeDefined();
    expect(createdAxiosConfig.headers.post).toBeDefined();
    expect(createdAxiosConfig.headers.put).toBeDefined();
    expect(createdAxiosConfig.headers.patch).toBeDefined();
    expect(createdAxiosConfig.headers.post['Content-Type']).toBe('application/json');
    expect(createdAxiosConfig.headers.put['Content-Type']).toBe('application/json');
    expect(createdAxiosConfig.headers.patch['Content-Type']).toBe('application/json');
  });

  it('should override the defaults with user-provided input', () => {
    const unused = new RequestWrapper({
      maxContentLength: 100,
      maxBodyLength: 200,
    });

    const createdAxiosConfig = axios.default.create.mock.calls[0][0];
    expect(createdAxiosConfig.maxContentLength).toBe(100);
    expect(createdAxiosConfig.maxBodyLength).toBe(200);
  });

  it('creates a custom https agent when disableSslVerification is true', () => {
    const unused = new RequestWrapper({
      disableSslVerification: true,
    });

    const createdAxiosConfig = axios.default.create.mock.calls[0][0];
    expect(createdAxiosConfig.httpsAgent).toBeInstanceOf(https.Agent);
    expect(createdAxiosConfig.httpsAgent.options).toBeDefined();
    expect(createdAxiosConfig.httpsAgent.options.rejectUnauthorized).toBe(false);
  });

  it('updates the https agent if provided by the user', () => {
    const unused = new RequestWrapper({
      disableSslVerification: true,
      httpsAgent: new https.Agent({ keepAlive: true }),
    });

    const createdAxiosConfig = axios.default.create.mock.calls[0][0];
    expect(createdAxiosConfig.httpsAgent).toBeDefined();
    expect(createdAxiosConfig.httpsAgent.keepAlive).toBe(true); // this is false by default
    expect(createdAxiosConfig.httpsAgent.options).toBeDefined();
    expect(createdAxiosConfig.httpsAgent.options.rejectUnauthorized).toBe(false);
  });

  it('should set `compressRequestData` based on user options', () => {
    const rw = new RequestWrapper({ enableGzipCompression: true });
    expect(rw.compressRequestData).toBe(true);
  });
});

describe('sendRequest', () => {
  let axiosResolveValue;
  let expectedResult;

  beforeEach(() => {
    // these objects get messed with, so reset them before each test
    axiosResolveValue = {
      data: 'test',
      config: 'test',
      request: 'test',
      statusText: 'test',
      status: 200,
      headers: 'test',
    };

    expectedResult = {
      result: 'test',
      statusText: 'test',
      status: 200,
      headers: 'test',
    };
  });

  afterEach(() => {
    mockAxiosInstance.mockReset();
  });

  it('should send a request with default parameters', async (done) => {
    const parameters = {
      defaultOptions: {
        body: 'post=body',
        formData: '',
        qs: {},
        method: 'POST',
        url: 'https://example.ibm.com/v1/environments/environment-id/configurations/configuration-id',
        headers: {
          'test-header': 'test-header-value',
        },
        responseType: 'buffer',
      },
    };

    mockAxiosInstance.mockResolvedValue(axiosResolveValue);

    const res = await requestWrapperInstance.sendRequest(parameters);
    // assert results
    expect(mockAxiosInstance.mock.calls[0][0].data).toEqual('post=body');
    expect(mockAxiosInstance.mock.calls[0][0].url).toEqual(
      'https://example.ibm.com/v1/environments/environment-id/configurations/configuration-id'
    );
    expect(mockAxiosInstance.mock.calls[0][0].headers).toEqual({
      'Accept-Encoding': 'gzip',
      'test-header': 'test-header-value',
    });
    expect(mockAxiosInstance.mock.calls[0][0].method).toEqual(parameters.defaultOptions.method);
    expect(mockAxiosInstance.mock.calls[0][0].responseType).toEqual(
      parameters.defaultOptions.responseType
    );
    expect(res).toEqual(expectedResult);
    expect(mockAxiosInstance.mock.calls).toHaveLength(1);
    done();
  });

  it('sendRequest should strip trailing slashes', async (done) => {
    const parameters = {
      defaultOptions: {
        body: 'post=body',
        formData: '',
        qs: {},
        method: 'POST',
        url: '/trailing/slash/',
        serviceUrl: 'https://example.ibm.com/',
        headers: {
          'test-header': 'test-header-value',
        },
        responseType: 'buffer',
      },
    };

    mockAxiosInstance.mockResolvedValue(axiosResolveValue);

    const res = await requestWrapperInstance.sendRequest(parameters);
    // assert results
    expect(mockAxiosInstance.mock.calls[0][0].url).toEqual(
      'https://example.ibm.com/trailing/slash'
    );
    expect(res).toEqual(expectedResult);
    done();
  });

  it('should call formatError if request failed', async (done) => {
    const parameters = {
      defaultOptions: {
        body: 'post=body',
        formData: '',
        qs: {},
        method: 'POST',
        serviceUrl:
          'https://example.ibm.com/v1/environments/environment-id/configurations/configuration-id',
        headers: {
          'test-header': 'test-header-value',
        },
        responseType: 'json',
      },
    };

    mockAxiosInstance.mockRejectedValue('error');

    let res;
    let err;
    try {
      res = await requestWrapperInstance.sendRequest(parameters);
    } catch (e) {
      err = e;
    }
    // assert results
    expect(err).toBeInstanceOf(Error);
    expect(res).toBeUndefined();
    done();
  });

  it('should send a request where option parameters overrides defaults', async (done) => {
    const parameters = {
      defaultOptions: {
        formData: '',
        qs: {
          version: '2017-10-15',
        },
        method: 'POST',
        serviceUrl: 'https://example.ibm.com',
        headers: {
          'test-header': 'test-header-value',
        },
      },
      options: {
        url: '/v1/environments/{environment_id}/configurations/{configuration_id}',
        path: {
          environment_id: 'environment-id',
          configuration_id: 'configuration-id',
        },
        method: 'GET',
        qs: {
          version: '2018-10-15',
          array_style: ['a', 'b'],
        },
        headers: {
          'test-header': 'override-header-value',
          'add-header': 'add-header-value',
        },
      },
    };

    let serializedParams;
    mockAxiosInstance.mockImplementation((requestParams) => {
      // This runs the paramsSerializer code in the payload we send with axios
      serializedParams = requestParams.paramsSerializer(requestParams.params);
      return Promise.resolve(axiosResolveValue);
    });

    const res = await requestWrapperInstance.sendRequest(parameters);
    // assert results
    expect(serializedParams).toBe('version=2018-10-15&array_style=a%2Cb');
    expect(mockAxiosInstance.mock.calls[0][0].url).toEqual(
      'https://example.ibm.com/v1/environments/environment-id/configurations/configuration-id'
    );
    expect(mockAxiosInstance.mock.calls[0][0].headers).toEqual({
      'Accept-Encoding': 'gzip',
      'test-header': 'override-header-value',
      'add-header': 'add-header-value',
    });
    expect(mockAxiosInstance.mock.calls[0][0].method).toEqual(parameters.options.method);
    expect(mockAxiosInstance.mock.calls[0][0].params).toEqual({
      array_style: 'a,b',
      version: '2018-10-15',
    });
    expect(mockAxiosInstance.mock.calls[0][0].responseType).toEqual('json');
    expect(res).toEqual(expectedResult);
    expect(mockAxiosInstance.mock.calls).toHaveLength(1);
    done();
  });

  it('should send a request with Host header set in default options', async (done) => {
    const parameters = {
      defaultOptions: {
        body: 'post=body',
        formData: '',
        qs: {},
        method: 'POST',
        url: 'https://example.ibm.com/v1/environments/environment-id/configurations/configuration-id',
        headers: {
          Host: 'alternatehost.ibm.com:443',
        },
        responseType: 'buffer',
      },
    };

    mockAxiosInstance.mockResolvedValue(axiosResolveValue);

    const res = await requestWrapperInstance.sendRequest(parameters);
    // assert results
    expect(mockAxiosInstance.mock.calls[0][0].data).toEqual('post=body');
    expect(mockAxiosInstance.mock.calls[0][0].url).toEqual(
      'https://example.ibm.com/v1/environments/environment-id/configurations/configuration-id'
    );
    expect(mockAxiosInstance.mock.calls[0][0].headers).toEqual({
      'Accept-Encoding': 'gzip',
      Host: 'alternatehost.ibm.com:443',
    });
    done();
  });

  it('should send a request with Host header set in overridden options', async (done) => {
    const parameters = {
      defaultOptions: {
        body: 'post=body',
        formData: '',
        qs: {},
        method: 'POST',
        url: 'https://example.ibm.com/v1/environments/environment-id/configurations/configuration-id',
        headers: {
          Host: 'wronghost.ibm.com:443',
        },
        responseType: 'buffer',
      },
      options: {
        headers: {
          Host: 'correcthost.ibm.com:443',
        },
      },
    };

    mockAxiosInstance.mockResolvedValue(axiosResolveValue);

    const res = await requestWrapperInstance.sendRequest(parameters);
    // assert results
    expect(mockAxiosInstance.mock.calls[0][0].data).toEqual('post=body');
    expect(mockAxiosInstance.mock.calls[0][0].url).toEqual(
      'https://example.ibm.com/v1/environments/environment-id/configurations/configuration-id'
    );
    expect(mockAxiosInstance.mock.calls[0][0].headers).toEqual({
      'Accept-Encoding': 'gzip',
      Host: 'correcthost.ibm.com:443',
    });
    done();
  });

  it('should handle merging of different options objects', async (done) => {
    const parameters = {
      defaultOptions: {
        qs: {
          version: '2017-10-15',
        },
        serviceUrl: 'https://example.ibm.com',
        headers: {
          'test-header': 'test-header-value',
        },
      },
      options: {
        url: '/v1/environments',
        method: 'GET',
        qs: {
          field: 'value',
        },
        headers: {
          'add-header': 'add-header-value',
        },
      },
    };

    let serializedParams;
    mockAxiosInstance.mockImplementation((requestParams) => {
      // This runs the paramsSerializer code in the payload we send with axios
      serializedParams = requestParams.paramsSerializer(requestParams.params);
      return Promise.resolve(axiosResolveValue);
    });

    const res = await requestWrapperInstance.sendRequest(parameters);
    // assert results
    expect(serializedParams).toBe('version=2017-10-15&field=value');
    expect(mockAxiosInstance.mock.calls[0][0].url).toEqual(
      'https://example.ibm.com/v1/environments'
    );
    expect(mockAxiosInstance.mock.calls[0][0].headers).toEqual({
      'Accept-Encoding': 'gzip',
      'test-header': 'test-header-value',
      'add-header': 'add-header-value',
    });
    expect(mockAxiosInstance.mock.calls[0][0].method).toEqual(parameters.options.method);
    expect(mockAxiosInstance.mock.calls[0][0].params).toEqual({
      field: 'value',
      version: '2017-10-15',
    });
    expect(mockAxiosInstance.mock.calls[0][0].responseType).toEqual('json');
    expect(res).toEqual(expectedResult);
    expect(mockAxiosInstance.mock.calls).toHaveLength(1);
    done();
  });

  it('should send a request with multiform data', async (done) => {
    const parameters = {
      defaultOptions: {
        formData: '',
        qs: {
          version: '2017-10-15',
        },
        method: 'POST',
        serviceUrl: 'https://example.ibm.com',
        headers: {
          'test-header': 'test-header-value',
        },
      },
      options: {
        url: '/v1/environments/{environment_id}/configurations/{configuration_id}',
        path: {
          environment_id: 'environment-id',
          configuration_id: 'configuration-id',
        },
        qs: {
          version: '2018-10-15',
        },
        headers: {
          'test-header': 'override-header-value',
          'add-header': 'add-header-value',
        },
        formData: {
          file: fs.createReadStream(`${__dirname}/../resources/blank.wav`),
          null_item: null,
          custom_file: {
            filename: 'custom.wav',
            data: fs.createReadStream(`${__dirname}/../resources/blank.wav`),
          },
          array_item: ['a', 'b'],
          object_item: { a: 'a', b: 'b' },
          no_data: {
            contentType: 'some-type',
          },
        },
      },
    };

    mockAxiosInstance.mockImplementation((requestParams) => {
      requestParams.paramsSerializer(requestParams.params);
      return Promise.resolve(axiosResolveValue);
    });

    const res = await requestWrapperInstance.sendRequest(parameters);
    // assert results
    expect(mockAxiosInstance.mock.calls[0][0].url).toEqual(
      'https://example.ibm.com/v1/environments/environment-id/configurations/configuration-id'
    );
    expect(mockAxiosInstance.mock.calls[0][0].headers).toMatchObject({
      'Accept-Encoding': 'gzip',
      'test-header': 'override-header-value',
      'add-header': 'add-header-value',
    });
    expect(mockAxiosInstance.mock.calls[0][0].headers['content-type']).toMatch(
      'multipart/form-data; boundary=--------------------------'
    );
    expect(mockAxiosInstance.mock.calls[0][0].method).toEqual(parameters.defaultOptions.method);
    expect(mockAxiosInstance.mock.calls[0][0].params).toEqual(parameters.options.qs);
    expect(mockAxiosInstance.mock.calls[0][0].responseType).toEqual('json');
    expect(JSON.stringify(mockAxiosInstance.mock.calls[0][0])).toMatch(
      'Content-Disposition: form-data; name=\\"object_item\\"'
    );
    expect(JSON.stringify(mockAxiosInstance.mock.calls[0][0])).toMatch(
      'Content-Disposition: form-data; name=\\"array_item\\"'
    );
    // There should be two "array_item" parts
    expect(
      JSON.stringify(mockAxiosInstance.mock.calls[0][0].data).match(/name=\\"array_item\\"/g) || []
    ).toHaveLength(2);
    expect(JSON.stringify(mockAxiosInstance.mock.calls[0][0])).toMatch(
      'Content-Disposition: form-data; name=\\"custom_file\\"'
    );
    expect(JSON.stringify(mockAxiosInstance.mock.calls[0][0])).not.toMatch(
      'Content-Disposition: form-data; name=\\"null_item\\"'
    );
    expect(JSON.stringify(mockAxiosInstance.mock.calls[0][0])).not.toMatch(
      'Content-Disposition: form-data; name=\\"no_data\\"'
    );

    expect(res).toEqual(expectedResult);
    expect(mockAxiosInstance.mock.calls).toHaveLength(1);
    done();
  });

  it('should send a request with form data', async (done) => {
    const parameters = {
      defaultOptions: {
        form: { a: 'a', b: 'b' },
        qs: {
          version: '2017-10-15',
        },
        method: 'POST',
        serviceUrl: 'https://example.ibm.com',
        headers: {
          'test-header': 'test-header-value',
        },
      },
      options: {
        url: '/v1/environments/{environment_id}/configurations/{configuration_id}',
        path: {
          environment_id: 'environment-id',
          configuration_id: 'configuration-id',
        },
        method: 'GET',
        qs: {
          version: '2018-10-15',
        },
        headers: {
          'test-header': 'override-header-value',
          'add-header': 'add-header-value',
          'Accept-Encoding': 'compress',
        },
      },
    };

    mockAxiosInstance.mockImplementation((requestParams) => {
      requestParams.paramsSerializer(requestParams.params);
      return Promise.resolve(axiosResolveValue);
    });

    const res = await requestWrapperInstance.sendRequest(parameters);
    // assert results
    expect(mockAxiosInstance.mock.calls[0][0].data).toEqual('a=a&b=b');
    expect(mockAxiosInstance.mock.calls[0][0].url).toEqual(
      'https://example.ibm.com/v1/environments/environment-id/configurations/configuration-id'
    );
    expect(mockAxiosInstance.mock.calls[0][0].headers).toEqual({
      'Accept-Encoding': 'compress',
      'test-header': 'override-header-value',
      'add-header': 'add-header-value',
      'Content-type': 'application/x-www-form-urlencoded',
    });
    expect(mockAxiosInstance.mock.calls[0][0].method).toEqual(parameters.options.method);
    expect(mockAxiosInstance.mock.calls[0][0].params).toEqual(parameters.options.qs);
    expect(mockAxiosInstance.mock.calls[0][0].responseType).toEqual('json');
    expect(res).toEqual(expectedResult);
    expect(mockAxiosInstance.mock.calls).toHaveLength(1);
    done();
  });

  it('should call `gzipRequestBody` if configured to do so', async () => {
    const parameters = {
      defaultOptions: {
        body: 'post=body',
        formData: '',
        qs: {},
        method: 'POST',
        url: '/trailing/slash/',
        serviceUrl: 'https://example.ibm.com/',
        headers: {
          'test-header': 'test-header-value',
        },
        responseType: 'buffer',
      },
    };

    requestWrapperInstance.compressRequestData = true;

    mockAxiosInstance.mockResolvedValue(axiosResolveValue);
    const gzipSpy = jest.spyOn(requestWrapperInstance, 'gzipRequestBody');
    await requestWrapperInstance.sendRequest(parameters);
    expect(gzipSpy).toHaveBeenCalled();

    // reset the alteration of the requestWrapperInstance
    requestWrapperInstance.compressRequestData = false;
  });

  // Need to rewrite this to test instantiation with userOptions

  //   it('should keep parameters in options that are not explicitly set in requestwrapper', async done => {
  //     const parameters = {
  //       defaultOptions: {
  //         body: 'post=body',
  //         formData: '',
  //         qs: {},
  //         method: 'POST',
  //         rejectUnauthorized: true,
  //         serviceUrl:
  //           'https://example.ibm.com/v1/environments/environment-id/configurations/configuration-id',
  //         headers: {
  //           'test-header': 'test-header-value',
  //         },
  //         responseType: 'buffer',
  //       },
  //       options: {
  //         otherParam: 500,
  //       },
  //     };
  //
  //     mockAxiosInstance.mockResolvedValue('res');
  //
  //     requestWrapperInstance.sendRequest(parameters, (err, res) => {
  //       // assert results
  //       expect(mockAxiosInstance.mock.calls[0][0].otherParam).toEqual(500);
  //       expect(res).toEqual(expectedResult);
  //       expect(mockAxiosInstance.mock.calls.length).toBe(1);
  //       done();
  //     });
  //   });
});

describe('formatError', () => {
  const basicAxiosError = {
    response: {
      config: 'large object',
      request: 'large object',
      statusText: 'Not Found',
      status: 404,
      data: {
        errors: [
          {
            message: 'First error: no model found.',
          },
        ],
        message: 'Cant find the model.',
        error: 'Model not found.',
        errorMessage: 'There is just no finding this model.',
        code: 404,
      },
      headers: {
        'content-type': 'application/json',
        'content-length': '65',
        'x-global-transaction-id': 'fhd7s8hfudj9ksoo0wpnd78a',
      },
    },
    request: 'fake-http-request-object',
    message: 'error in building the request',
    code: 'SOME_STATUS_KEY',
  };

  it('should get the message from errors[0].message', () => {
    const error = requestWrapperInstance.formatError(basicAxiosError);
    expect(error instanceof Error).toBe(true);
    expect(error.name).toBe('Not Found');
    expect(error.code).toBe(404);
    expect(error.message).toBe('First error: no model found.');
    expect(typeof error.body).toBe('string');
    expect(error.headers).toEqual(basicAxiosError.response.headers);
  });

  it('should get the message from error', () => {
    delete basicAxiosError.response.data.errors;
    const error = requestWrapperInstance.formatError(basicAxiosError);
    expect(error instanceof Error).toBe(true);
    expect(error.name).toBe('Not Found');
    expect(error.code).toBe(404);
    expect(error.message).toBe('Model not found.');
    expect(error.headers).toEqual(basicAxiosError.response.headers);
  });

  it('should get the message from message', () => {
    delete basicAxiosError.response.data.error;
    const error = requestWrapperInstance.formatError(basicAxiosError);
    expect(error instanceof Error).toBe(true);
    expect(error.name).toBe('Not Found');
    expect(error.code).toBe(404);
    expect(error.message).toBe('Cant find the model.');
    expect(error.headers).toEqual(basicAxiosError.response.headers);
  });

  it('should get the message from errorMessage', () => {
    delete basicAxiosError.response.data.message;
    const error = requestWrapperInstance.formatError(basicAxiosError);
    expect(error instanceof Error).toBe(true);
    expect(error.name).toBe('Not Found');
    expect(error.code).toBe(404);
    expect(error.message).toBe('There is just no finding this model.');
    expect(error.body).toBe('{"errorMessage":"There is just no finding this model.","code":404}');
    expect(error.headers).toEqual(basicAxiosError.response.headers);
  });

  it('should get error from status text when not found', () => {
    delete basicAxiosError.response.data.errorMessage;
    const error = requestWrapperInstance.formatError(basicAxiosError);
    expect(error instanceof Error).toBe(true);
    expect(error.message).toBe('Not Found');
  });

  it('check the unauthenticated thing - 401', () => {
    basicAxiosError.response.status = 401;
    const error = requestWrapperInstance.formatError(basicAxiosError);
    expect(error instanceof Error).toBe(true);
    expect(error.message).toBe('Access is denied due to invalid credentials.');
  });

  it('check the unauthenticated thing - 403', () => {
    basicAxiosError.response.status = 403;
    const error = requestWrapperInstance.formatError(basicAxiosError);
    expect(error instanceof Error).toBe(true);
    expect(error.message).toBe('Access is denied due to invalid credentials.');
  });

  it('check the unauthenticated thing - iam', () => {
    basicAxiosError.response.status = 400;
    basicAxiosError.response.data.context = {
      url: 'https://iam.cloud.ibm.com/identity/token',
    };
    const error = requestWrapperInstance.formatError(basicAxiosError);
    expect(error instanceof Error).toBe(true);
    expect(error.message).toBe('Access is denied due to invalid credentials.');

    // clean up
    delete basicAxiosError.response.data.context;
  });

  it('check error with circular ref in data', () => {
    const otherObject = {
      a: {
        b: 'c',
      },
    };
    basicAxiosError.response.data = {
      error: otherObject,
    };
    // create a circular reference
    basicAxiosError.response.data.error.a.newKey = otherObject;
    const error = requestWrapperInstance.formatError(basicAxiosError);
    expect(error instanceof Error).toBe(true);
    expect(typeof error.body).toBe('object');
    expect(error.message).toBe('Not Found');
  });

  it('check the request flow', () => {
    delete basicAxiosError.response;
    const error = requestWrapperInstance.formatError(basicAxiosError);
    expect(error instanceof Error).toBe(true);
    expect(error.message).toBe('error in building the request');
    expect(error.statusText).toBe('SOME_STATUS_KEY');
    expect(error.body).toBe('Response not received - no connection was made to the service.');
  });

  it('check the SSL error handler - message condition', () => {
    // save the original message
    const originalMessage = basicAxiosError.message;

    basicAxiosError.message = 'request has self signed certificate';
    const error = requestWrapperInstance.formatError(basicAxiosError);

    // put the original message back in, before expectations in case they fail
    basicAxiosError.message = originalMessage;

    expect(error instanceof Error).toBe(true);
    expect(error.message).toMatch(/SSL certificate is not valid/);
  });

  it('check the SSL error handler - code condition', () => {
    // save the original code
    const originalCode = basicAxiosError.code;

    basicAxiosError.code = 'DEPTH_ZERO_SELF_SIGNED_CERT';
    const error = requestWrapperInstance.formatError(basicAxiosError);

    // put the original message back in, before expectations in case they fail
    basicAxiosError.code = originalCode;

    expect(error instanceof Error).toBe(true);
    expect(error.message).toMatch(/SSL certificate is not valid/);
  });

  it('check the message flow', () => {
    delete basicAxiosError.request;
    const error = requestWrapperInstance.formatError(basicAxiosError);
    expect(error instanceof Error).toBe(true);
    expect(error.message).toBe('error in building the request');
  });
});

describe('getHttpClient', () => {
  it('should return the axios instance', () => {
    const client = requestWrapperInstance.getHttpClient();
    expect(client).toEqual(mockAxiosInstance);
  });
});

describe('gzipRequestBody', () => {
  const gzipSpy = jest.spyOn(zlib, 'gzipSync');
  const errorLogSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});
  const debugLogSpy = jest.spyOn(logger, 'debug').mockImplementation(() => {});

  afterEach(() => {
    gzipSpy.mockClear();
    errorLogSpy.mockClear();
    debugLogSpy.mockClear();
  });

  it('should return unaltered data if encoding header is already set to gzip', async () => {
    let data = 42;
    const headers = { 'Content-Encoding': 'gzip' };

    data = await requestWrapperInstance.gzipRequestBody(data, headers);
    expect(data).toBe(42);
  });

  it('should return unaltered data if encoding header values include gzip', async () => {
    let data = 42;
    const headers = { 'Content-Encoding': ['gzip', 'other-value'] };

    data = await requestWrapperInstance.gzipRequestBody(data, headers);
    expect(data).toBe(42);
  });

  it('should return unaltered data if data is null', async () => {
    let data = null;
    const headers = {};

    data = await requestWrapperInstance.gzipRequestBody(data, headers);
    expect(gzipSpy).not.toHaveBeenCalled();
    expect(data).toBeNull();
  });

  it('should compress json data into a buffer', async () => {
    let data = { key: 'value' };
    const headers = {};

    const jsonSpy = jest.spyOn(JSON, 'stringify');

    data = await requestWrapperInstance.gzipRequestBody(data, headers);
    expect(data).toBeInstanceOf(Buffer);
    expect(gzipSpy).toHaveBeenCalled();
    expect(jsonSpy).toHaveBeenCalled();
    expect(headers['Content-Encoding']).toBe('gzip');

    jsonSpy.mockRestore();
  });

  it('should compress array data into a buffer', async () => {
    let data = ['request', 'body'];
    const headers = {};

    const jsonSpy = jest.spyOn(JSON, 'stringify');

    data = await requestWrapperInstance.gzipRequestBody(data, headers);
    expect(data).toBeInstanceOf(Buffer);
    expect(gzipSpy).toHaveBeenCalled();
    expect(jsonSpy).toHaveBeenCalled();
    expect(headers['Content-Encoding']).toBe('gzip');

    jsonSpy.mockRestore();
  });

  it('should compress string data into a buffer', async () => {
    let data = 'body';
    const headers = {};

    data = await requestWrapperInstance.gzipRequestBody(data, headers);
    expect(data).toBeInstanceOf(Buffer);
    expect(gzipSpy).toHaveBeenCalled();
    expect(headers['Content-Encoding']).toBe('gzip');
  });

  it('should compress number data into a buffer', async () => {
    let data = 42;
    const headers = {};

    data = await requestWrapperInstance.gzipRequestBody(data, headers);
    expect(data).toBeInstanceOf(Buffer);
    expect(gzipSpy).toHaveBeenCalled();
    expect(headers['Content-Encoding']).toBe('gzip');
  });

  it('should compress stream data into a buffer', async () => {
    let data = Readable.from(['request body']);
    const headers = {};

    data = await requestWrapperInstance.gzipRequestBody(data, headers);
    expect(data).toBeInstanceOf(Buffer);
    expect(gzipSpy).toHaveBeenCalled();
    expect(headers['Content-Encoding']).toBe('gzip');
  });

  it('should log an error and return data unaltered if data cant be stringified', async () => {
    let data = { key: 'value' };
    data.circle = data;
    const headers = {};

    data = await requestWrapperInstance.gzipRequestBody(data, headers);
    expect(data.key).toBe('value');
    expect(errorLogSpy).toHaveBeenCalled();
    expect(errorLogSpy.mock.calls[0][0]).toBe(
      'Error converting request body to a buffer - data will not be compressed.'
    );
    expect(debugLogSpy).toHaveBeenCalled();
    expect(debugLogSpy.mock.calls[0][0].message).toMatch('Converting circular structure to JSON');
  });

  it('should log an error and return data unaltered if data cant be gzipped', async () => {
    let data = 42;
    const headers = {};

    gzipSpy.mockImplementationOnce(() => {
      throw new Error('bad zip');
    });

    data = await requestWrapperInstance.gzipRequestBody(data, headers);
    expect(data).toBe(42);
    expect(errorLogSpy).toHaveBeenCalled();
    expect(errorLogSpy.mock.calls[0][0]).toBe(
      'Error compressing request body - data will not be compressed.'
    );
    expect(debugLogSpy).toHaveBeenCalled();
    expect(debugLogSpy.mock.calls[0][0].message).toMatch('bad zip');
  });

  it('should not update header if data cant be gzipped', async () => {
    let data = 42;
    const headers = {};

    gzipSpy.mockImplementationOnce(() => {
      throw new Error('bad zip');
    });

    data = await requestWrapperInstance.gzipRequestBody(data, headers);
    expect(data).toBe(42);
    expect(headers['Content-Encoding']).toBeUndefined();
    expect(errorLogSpy).toHaveBeenCalled();
    expect(errorLogSpy.mock.calls[0][0]).toBe(
      'Error compressing request body - data will not be compressed.'
    );
    expect(debugLogSpy).toHaveBeenCalled();
    expect(debugLogSpy.mock.calls[0][0].message).toMatch('bad zip');
  });
});
