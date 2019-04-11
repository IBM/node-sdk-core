'use strict';
const fs = require('fs');
const formatError = require('../../lib/requestwrapper').formatError;
const sendRequest = require('../../lib/requestwrapper').sendRequest;

jest.mock('axios');
const axios = require('axios');

describe('sendRequest', () => {
  afterEach(() => {
    axios.mockClear();
  });

  it('should send a request with default parameters', done => {
    const parameters = {
      defaultOptions: {
        body: 'post=body',
        formData: '',
        qs: {},
        method: 'POST',
        rejectUnauthorized: true,
        url:
          'https://example.ibm.com/v1/environments/environment-id/configurations/configuration-id',
        headers: {
          'test-header': 'test-header-value',
        },
        responseType: 'buffer',
      },
    };

    axios.mockResolvedValue('res');

    sendRequest(parameters, (err, body, res) => {
      // assert results
      expect(axios.mock.calls[0][0].data).toEqual('post=body');
      expect(axios.mock.calls[0][0].url).toEqual(
        'https://example.ibm.com/v1/environments/environment-id/configurations/configuration-id'
      );
      expect(axios.mock.calls[0][0].headers).toEqual({
        'Accept-Encoding': 'gzip',
        'test-header': 'test-header-value',
      });
      expect(axios.mock.calls[0][0].httpsAgent.options.rejectUnauthorized).toEqual(
        parameters.defaultOptions.rejectUnauthorized
      );
      expect(axios.mock.calls[0][0].method).toEqual(parameters.defaultOptions.method);
      expect(axios.mock.calls[0][0].responseType).toEqual(parameters.defaultOptions.responseType);
      expect(res).toEqual('res');
      expect(axios.mock.calls.length).toBe(1);
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
        rejectUnauthorized: true,
        url:
          'https://example.ibm.com/v1/environments/environment-id/configurations/configuration-id',
        headers: {
          'test-header': 'test-header-value',
        },
        responseType: 'json',
      },
    };

    axios.mockRejectedValue('error');

    sendRequest(parameters, (err, body, res) => {
      // assert results
      expect(err).toEqual(expect.anything());
      expect(body).toBeUndefined();
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
        rejectUnauthorized: true,
        url: 'https://example.ibm.com',
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
        rejectUnauthorized: false,
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
    axios.mockImplementation(requestParams => {
      // This runs the paramsSerializer code in the payload we send with axios
      serializedParams = requestParams.paramsSerializer(requestParams.params);
      return Promise.resolve('res');
    });

    sendRequest(parameters, (err, body, res) => {
      // assert results
      expect(serializedParams).toBe('version=2018-10-15&array_style=a%2Cb');
      expect(axios.mock.calls[0][0].url).toEqual(
        'https://example.ibm.com/v1/environments/environment-id/configurations/configuration-id'
      );
      expect(axios.mock.calls[0][0].headers).toEqual({
        'Accept-Encoding': 'gzip',
        'test-header': 'override-header-value',
        'add-header': 'add-header-value',
      });
      expect(axios.mock.calls[0][0].httpsAgent.options.rejectUnauthorized).toEqual(
        parameters.options.rejectUnauthorized
      );
      expect(axios.mock.calls[0][0].method).toEqual(parameters.options.method);
      expect(axios.mock.calls[0][0].params).toEqual({
        array_style: 'a,b',
        version: '2018-10-15',
      });
      expect(axios.mock.calls[0][0].responseType).toEqual('json');
      expect(res).toEqual('res');
      expect(axios.mock.calls.length).toBe(1);
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
        rejectUnauthorized: true,
        url: 'https://example.ibm.com',
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
          file: fs.createReadStream('../blank.wav'),
          null_item: null,
          custom_file: {
            filename: 'custom.wav',
            data: fs.createReadStream('../blank.wav'),
          },
          array_item: ['a', 'b'],
          object_item: { a: 'a', b: 'b' },
          no_data: {
            contentType: 'some-type',
          },
        },
      },
    };

    axios.mockImplementation(requestParams => {
      requestParams.paramsSerializer(requestParams.params);
      return Promise.resolve('res');
    });

    sendRequest(parameters, (err, body, res) => {
      // assert results
      expect(axios.mock.calls[0][0].url).toEqual(
        'https://example.ibm.com/v1/environments/environment-id/configurations/configuration-id'
      );
      expect(axios.mock.calls[0][0].headers).toMatchObject({
        'Accept-Encoding': 'gzip',
        'test-header': 'override-header-value',
        'add-header': 'add-header-value',
      });
      expect(axios.mock.calls[0][0].headers['content-type']).toMatch(
        'multipart/form-data; boundary=--------------------------'
      );
      expect(axios.mock.calls[0][0].httpsAgent.options.rejectUnauthorized).toEqual(true);
      expect(axios.mock.calls[0][0].method).toEqual(parameters.defaultOptions.method);
      expect(axios.mock.calls[0][0].params).toEqual(parameters.options.qs);
      expect(axios.mock.calls[0][0].responseType).toEqual('json');
      expect(JSON.stringify(axios.mock.calls[0][0])).toMatch(
        'Content-Disposition: form-data; name=\\"object_item\\"'
      );
      expect(JSON.stringify(axios.mock.calls[0][0])).toMatch(
        'Content-Disposition: form-data; name=\\"array_item\\"'
      );
      expect(JSON.stringify(axios.mock.calls[0][0])).toMatch(
        'Content-Disposition: form-data; name=\\"custom_file\\"'
      );
      expect(JSON.stringify(axios.mock.calls[0][0])).not.toMatch(
        'Content-Disposition: form-data; name=\\"null_item\\"'
      );
      expect(JSON.stringify(axios.mock.calls[0][0])).not.toMatch(
        'Content-Disposition: form-data; name=\\"no_data\\"'
      );

      expect(res).toEqual('res');
      expect(axios.mock.calls.length).toBe(1);
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
        rejectUnauthorized: true,
        url: 'https://example.ibm.com',
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
        rejectUnauthorized: false,
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

    axios.mockImplementation(requestParams => {
      requestParams.paramsSerializer(requestParams.params);
      return Promise.resolve('res');
    });

    sendRequest(parameters, (err, body, res) => {
      // assert results
      expect(axios.mock.calls[0][0].data).toEqual('a=a&b=b');
      expect(axios.mock.calls[0][0].url).toEqual(
        'https://example.ibm.com/v1/environments/environment-id/configurations/configuration-id'
      );
      expect(axios.mock.calls[0][0].headers).toEqual({
        'Accept-Encoding': 'compress',
        'test-header': 'override-header-value',
        'add-header': 'add-header-value',
        'Content-type': 'application/x-www-form-urlencoded',
      });
      expect(axios.mock.calls[0][0].httpsAgent.options.rejectUnauthorized).toEqual(
        parameters.options.rejectUnauthorized
      );
      expect(axios.mock.calls[0][0].method).toEqual(parameters.options.method);
      expect(axios.mock.calls[0][0].params).toEqual(parameters.options.qs);
      expect(axios.mock.calls[0][0].responseType).toEqual('json');
      expect(res).toEqual('res');
      expect(axios.mock.calls.length).toBe(1);
      done();
    });
  });
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
    request: {
      message: 'request was made but no response was received',
    },
    message: 'error in building the request',
  };

  it('should get the message from errors[0].message', () => {
    const error = formatError(basicAxiosError);
    expect(error instanceof Error).toBe(true);
    expect(error.name).toBe('Not Found');
    expect(error.code).toBe(404);
    expect(error.message).toBe('First error: no model found.');
    expect(typeof error.body).toBe('string');
    expect(error.headers).toEqual(basicAxiosError.response.headers);
  });

  it('should get the message from error', () => {
    delete basicAxiosError.response.data.errors;
    const error = formatError(basicAxiosError);
    expect(error instanceof Error).toBe(true);
    expect(error.name).toBe('Not Found');
    expect(error.code).toBe(404);
    expect(error.message).toBe('Model not found.');
    expect(error.headers).toEqual(basicAxiosError.response.headers);
  });

  it('should get the message from message', () => {
    delete basicAxiosError.response.data.error;
    const error = formatError(basicAxiosError);
    expect(error instanceof Error).toBe(true);
    expect(error.name).toBe('Not Found');
    expect(error.code).toBe(404);
    expect(error.message).toBe('Cant find the model.');
    expect(error.headers).toEqual(basicAxiosError.response.headers);
  });

  it('should get the message from errorMessage', () => {
    delete basicAxiosError.response.data.message;
    const error = formatError(basicAxiosError);
    expect(error instanceof Error).toBe(true);
    expect(error.name).toBe('Not Found');
    expect(error.code).toBe(404);
    expect(error.message).toBe('There is just no finding this model.');
    expect(error.body).toBe('{"errorMessage":"There is just no finding this model.","code":404}');
    expect(error.headers).toEqual(basicAxiosError.response.headers);
  });

  it('should get error from status text when not found', () => {
    delete basicAxiosError.response.data.errorMessage;
    const error = formatError(basicAxiosError);
    expect(error instanceof Error).toBe(true);
    expect(error.message).toBe('Not Found');
  });

  it('check the unauthenticated thing - 401', () => {
    basicAxiosError.response.status = 401;
    const error = formatError(basicAxiosError);
    expect(error instanceof Error).toBe(true);
    expect(error.message).toBe('Access is denied due to invalid credentials.');
  });

  it('check the unauthenticated thing - 403', () => {
    basicAxiosError.response.status = 403;
    const error = formatError(basicAxiosError);
    expect(error instanceof Error).toBe(true);
    expect(error.message).toBe('Access is denied due to invalid credentials.');
  });

  it('check the unauthenticated thing - iam', () => {
    basicAxiosError.response.status = 400;
    basicAxiosError.response.data.context = {
      url: 'http://iam.bluemix.net',
    };
    const error = formatError(basicAxiosError);
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
    const error = formatError(basicAxiosError);
    expect(error instanceof Error).toBe(true);
    expect(typeof error.body).toBe('object');
    expect(error.message).toBe('Not Found');
  });

  it('check the request flow', () => {
    delete basicAxiosError.response;
    const error = formatError(basicAxiosError);
    expect(error instanceof Error).toBe(true);
    expect(error.message).toBe('Response not received. Body of error is HTTP ClientRequest object');
    expect(error.body).toEqual(basicAxiosError.request);
  });

  it('check the message flow', () => {
    delete basicAxiosError.request;
    const error = formatError(basicAxiosError);
    expect(error instanceof Error).toBe(true);
    expect(error.message).toBe('error in building the request');
  });
});
