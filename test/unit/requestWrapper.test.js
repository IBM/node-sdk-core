'use strict';
const fs = require('fs');
process.env.NODE_DEBUG = 'axios';
jest.mock('axios');
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

const { RequestWrapper } = require('../../lib/requestwrapper');
const requestWrapperInstance = new RequestWrapper();

describe('axios', () => {
  it('should enable debug', () => {
    // these should have been called when requestWrapperInstance was instantiated
    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledTimes(1);
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledTimes(1);
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

  it('should send a request with default parameters', done => {
    const parameters = {
      defaultOptions: {
        body: 'post=body',
        formData: '',
        qs: {},
        method: 'POST',
        url:
          'https://example.ibm.com/v1/environments/environment-id/configurations/configuration-id',
        headers: {
          'test-header': 'test-header-value',
        },
        responseType: 'buffer',
      },
    };

    mockAxiosInstance.mockResolvedValue(axiosResolveValue);

    requestWrapperInstance.sendRequest(parameters, (err, res) => {
      // assert results
      expect(mockAxiosInstance.mock.calls[0][0].data).toEqual('post=body');
      expect(mockAxiosInstance.mock.calls[0][0].url).toEqual(
        'https://example.ibm.com/v1/environments/environment-id/configurations/configuration-id'
      );
      expect(mockAxiosInstance.mock.calls[0][0].headers).toEqual({
        // 'Accept-Encoding': 'gzip',
        'test-header': 'test-header-value',
      });
      expect(mockAxiosInstance.mock.calls[0][0].method).toEqual(parameters.defaultOptions.method);
      expect(mockAxiosInstance.mock.calls[0][0].responseType).toEqual(
        parameters.defaultOptions.responseType
      );
      expect(res).toEqual(expectedResult);
      expect(mockAxiosInstance.mock.calls.length).toBe(1);
      done();
    });
  });

  it('should call formatError if request failed', done => {
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

    requestWrapperInstance.sendRequest(parameters, (err, res) => {
      // assert results
      expect(err).toEqual(expect.anything());
      expect(res).toBeUndefined();
      done();
    });
  });

  it('should send a request where option parameters overrides defaults', done => {
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
    mockAxiosInstance.mockImplementation(requestParams => {
      // This runs the paramsSerializer code in the payload we send with axios
      serializedParams = requestParams.paramsSerializer(requestParams.params);
      return Promise.resolve(axiosResolveValue);
    });

    requestWrapperInstance.sendRequest(parameters, (err, res) => {
      // assert results
      expect(serializedParams).toBe('version=2018-10-15&array_style=a%2Cb');
      expect(mockAxiosInstance.mock.calls[0][0].url).toEqual(
        'https://example.ibm.com/v1/environments/environment-id/configurations/configuration-id'
      );
      expect(mockAxiosInstance.mock.calls[0][0].headers).toEqual({
        // 'Accept-Encoding': 'gzip',
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
      expect(mockAxiosInstance.mock.calls.length).toBe(1);
      done();
    });
  });

  it('should send a request with multiform data', done => {
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
          file: fs.createReadStream(__dirname + '/../resources/blank.wav'),
          null_item: null,
          custom_file: {
            filename: 'custom.wav',
            data: fs.createReadStream(__dirname + '/../resources/blank.wav'),
          },
          array_item: ['a', 'b'],
          object_item: { a: 'a', b: 'b' },
          no_data: {
            contentType: 'some-type',
          },
        },
      },
    };

    mockAxiosInstance.mockImplementation(requestParams => {
      requestParams.paramsSerializer(requestParams.params);
      return Promise.resolve(axiosResolveValue);
    });

    requestWrapperInstance.sendRequest(parameters, (err, res) => {
      // assert results
      expect(mockAxiosInstance.mock.calls[0][0].url).toEqual(
        'https://example.ibm.com/v1/environments/environment-id/configurations/configuration-id'
      );
      expect(mockAxiosInstance.mock.calls[0][0].headers).toMatchObject({
        // 'Accept-Encoding': 'gzip',
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
        (
          JSON.stringify(mockAxiosInstance.mock.calls[0][0].data).match(/name=\\"array_item\\"/g) ||
          []
        ).length
      ).toEqual(2);
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
      expect(mockAxiosInstance.mock.calls.length).toBe(1);
      done();
    });
  });

  it('should send a request with form data', done => {
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

    mockAxiosInstance.mockImplementation(requestParams => {
      requestParams.paramsSerializer(requestParams.params);
      return Promise.resolve(axiosResolveValue);
    });

    requestWrapperInstance.sendRequest(parameters, (err, res) => {
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
      expect(mockAxiosInstance.mock.calls.length).toBe(1);
      done();
    });
  });

  // Need to rewrite this to test instantiation with userOptions

  //   it('should keep parameters in options that are not explicitly set in requestwrapper', done => {
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
    expect(error.message).toMatch(/may not have a valid SSL certificate/);
  });

  it('check the SSL error handler - code condition', () => {
    // save the original code
    const originalCode = basicAxiosError.code;

    basicAxiosError.code = 'DEPTH_ZERO_SELF_SIGNED_CERT';
    const error = requestWrapperInstance.formatError(basicAxiosError);

    // put the original message back in, before expectations in case they fail
    basicAxiosError.code = originalCode;

    expect(error instanceof Error).toBe(true);
    expect(error.message).toMatch(/may not have a valid SSL certificate/);
  });

  it('check the message flow', () => {
    delete basicAxiosError.request;
    const error = requestWrapperInstance.formatError(basicAxiosError);
    expect(error instanceof Error).toBe(true);
    expect(error.message).toBe('error in building the request');
  });
});
