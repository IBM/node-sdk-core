/**
 * Copyright 2019 IBM Corp. All Rights Reserved.
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

/* istanbul ignore file */

/** Configuration options for the testing utilities. */
export interface Options {
  /** The Jest expect function to use */
  expect: Function;
}

/**
 * This class provides a set of helper methods used to reduce code duplication in the generated unit tests
 * for the SDKs that depend on this core package. Note that these methods are not used by the tests for this
 * package - they are meant to be exported and made available to dependent libraries.
 */
export class SdkUnitTestUtilities {
  private expect: Function;

  /**
   * Create a new BasicAuthenticator instance. !!!!!!!
   *
   * @param {object} options Configuration options for basic authentication. !!!!!!!!!!
   * @param {string} options.username The username portion of basic authentication. !!!!!!!!!!
   * @param {string} options.password The password portion of basic authentication. !!!!!!!!!!
   * @throws {Error} The configuration options are not valid. !!!!!!!!!!
   */
  constructor(options: Options) {
    // injecting the dependency on the "expect" method from `jest` so that
    // this module does not rely on "devDependencies"
    this.expect = options.expect;
  }

  /**
   * Takes the request options constructed by the SDK and checks that the `url` and `method` properties
   * were set to their correct values.
   *
   * @param {Object} options - the options object put together by the SDK, retrieved from the createRequest mock
   * @param {String} url - The URL path of the service endpoint, from the paths section of the API definition
   * @param {String} string - The HTTP method for the request, from the API definition
   * @returns {void}
   */
  public checkUrlAndMethod(options, url: string, method: any) {
    this.expect(options.url).toEqual(url);
    this.expect(options.method).toEqual(method);
  };

  /**
   * Takes the mock object for the `createRequest` method, extracts the headers that were sent with the call,
   * and checks for the expected values for `Accept` and `Content-Type`. This to verify that the SDK sets
   * the correct values in the code.
   *
   * @param {Object} createRequestMock - the jest mock object for the `createRequest` method in the `RequestWrapper` class
   * @param {String} accept - the expected value for the `Accept` header
   * @param {String} contentType - the expected value for the `Content-Type` header
   * @returns {void}
   */
  public checkMediaHeaders(createRequestMock, accept: string, contentType: string) {
    const headers = createRequestMock.mock.calls[0][0].defaultOptions.headers;
    this.expect(headers.Accept).toEqual(accept);
    this.expect(headers['Content-Type']).toEqual(contentType);
  };

  /**
   * Takes the mock object for the `createRequest` method, extracts the headers that were sent with the call,
   * and checks for the expected value for a user-defined header. This is verify that the SDK accepts header
   * parameters and sends them as headers in the request.
   *
   * @param {Object} createRequestMock - the jest mock object for the `createRequest` method in the `RequestWrapper` class
   * @param {String} userHeaderName - the name of the header passed by the user, e.g. `Contained-Content-Type`
   * @param {String} userHeaderValue - the expected value for the header passed by the user
   * @returns {void}
   */
  public checkUserHeader(createRequestMock, userHeaderName: string, userHeaderValue: string) {
    const headers = createRequestMock.mock.calls[0][0].defaultOptions.headers;
    this.expect(headers[userHeaderName]).toEqual(userHeaderValue);
  };

  /**
   * This method simply ensures that the method executed without any issues by extracting
   * the argument from the mock object for the `createRequest` method and verifying that it is an object.
   *
   * @param {Object} createRequestMock - the jest mock object for the `createRequest` method in the `RequestWrapper` class
   * @returns {void}
   */
  public checkForSuccessfulExecution(createRequestMock) {
    const sdkParams = createRequestMock.mock.calls[0][0];
    this.expect(typeof sdkParams).toEqual('object');
  };

  /**
   * This method extracts the `options` property from the object passed into `createRequest`. This property is
   * an object containing all of the SDK method-specific information (like `path` and `body`) used to build a request.
   * This method is just a convenience method for the unit tests to be able to make assertions on the items in the request.
   *
   * @param {Object} createRequestMock - the jest mock object for the `createRequest` method in the `RequestWrapper` class
   * @returns {Object}
   */
  public getOptions(createRequestMock) {
    return createRequestMock.mock.calls[0][0].options;
  };

  /**
   * This method simply ensures that the SDK methods return Promises by checking for
   * the `then` function - common way to assess whether or not an object is a Promise.
   *
   * @param {Promise<any>} sdkPromise - the Promise returned by an SDK method
   * @returns {void}
   */
  public expectToBePromise(sdkPromise) {
    this.expect(typeof sdkPromise.then).toBe('function');
  };
}
