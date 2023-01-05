/* eslint-disable no-alert, no-console */

/**
 * Copyright 2021, 2023 IBM Corp. All Rights Reserved.
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

const path = require('path');
const { VpcInstanceTokenManager } = require('../../dist/auth');
const { RequestWrapper } = require('../../dist/lib/request-wrapper');
const logger = require('../../dist/lib/logger').default;

// make sure no actual requests are sent
jest.mock('../../dist/lib/request-wrapper');
const TOKEN = 'abc123';
const sendRequestMock = jest.fn().mockImplementation(() => ({ result: { access_token: TOKEN } }));
RequestWrapper.mockImplementation(() => ({
  sendRequest: sendRequestMock,
}));

const debugLogSpy = jest.spyOn(logger, 'debug').mockImplementation(() => {});

const IAM_PROFILE_CRN = 'some-crn';
const IAM_PROFILE_ID = 'some-id';

describe('VPC Instance Token Manager', () => {
  afterAll(() => {
    sendRequestMock.mockRestore();
  });

  afterEach(() => {
    debugLogSpy.mockClear();
    sendRequestMock.mockClear();
  });

  describe('constructor', () => {
    it('should throw an error when both `iamProfileId` and `iamProfileCrn` are provided', () => {
      expect(
        () =>
          new VpcInstanceTokenManager({
            iamProfileCrn: IAM_PROFILE_CRN,
            iamProfileId: IAM_PROFILE_ID,
          })
      ).toThrow('At most one of `iamProfileId` or `iamProfileCrn` may be specified.');
    });

    it('should use default url if none is given', () => {
      const instance = new VpcInstanceTokenManager();
      expect(instance.url).toBe('http://169.254.169.254');
    });

    it('should set given profile crn', () => {
      const instance = new VpcInstanceTokenManager({
        iamProfileCrn: IAM_PROFILE_CRN,
      });

      expect(instance.iamProfileCrn).toBe(IAM_PROFILE_CRN);
    });

    it('should set given profile id', () => {
      const instance = new VpcInstanceTokenManager({
        iamProfileId: IAM_PROFILE_ID,
      });

      expect(instance.iamProfileId).toBe(IAM_PROFILE_ID);
    });
  });

  describe('setters', () => {
    it('should set iamProfileCrn with the setter', () => {
      const instance = new VpcInstanceTokenManager({ iamProfileCrn: 'test' });
      expect(instance.iamProfileCrn).toBe('test');
      expect(instance.iamProfileCrn).not.toBe(IAM_PROFILE_CRN);

      instance.setIamProfileCrn(IAM_PROFILE_CRN);
      expect(instance.iamProfileCrn).toBe(IAM_PROFILE_CRN);
    });

    it('should set iamProfileId with the setter', () => {
      const instance = new VpcInstanceTokenManager();
      expect(instance.iamProfileId).toBeUndefined();

      instance.setIamProfileId(IAM_PROFILE_ID);
      expect(instance.iamProfileId).toBe(IAM_PROFILE_ID);
    });
  });

  describe('getInstanceIdentityToken', () => {
    it('should correctly construct headers and request parameters', async () => {
      const instance = new VpcInstanceTokenManager({ url: '123.345.567' });
      await instance.getInstanceIdentityToken();

      const parameters = sendRequestMock.mock.calls[0][0];
      expect(parameters).toBeDefined();
      expect(parameters.options).toBeDefined();
      expect(parameters.options.url).toBe('123.345.567/instance_identity/v1/token');
      expect(parameters.options.method).toBe('PUT');

      expect(parameters.options.qs).toBeDefined();
      expect(parameters.options.qs.version).toBe('2022-03-01');

      expect(parameters.options.body).toBeDefined();
      expect(parameters.options.body.expires_in).toBe(300);

      expect(parameters.options.headers).toBeDefined();
      expect(parameters.options.headers['Content-Type']).toBe('application/json');
      expect(parameters.options.headers.Accept).toBe('application/json');
      expect(parameters.options.headers['Metadata-Flavor']).toBe('ibm');
    });

    it('should make the request then extract and return the token', async () => {
      const instance = new VpcInstanceTokenManager({ url: '123.345.567' });
      const token = await instance.getInstanceIdentityToken();
      expect(token).toBe(TOKEN);
      expect(sendRequestMock).toHaveBeenCalled();

      // verify logs
      expect(debugLogSpy.mock.calls[0][0]).toBe(
        "Invoking VPC 'create_access_token' operation: 123.345.567/instance_identity/v1/token"
      );
      expect(debugLogSpy.mock.calls[1][0]).toBe(
        "Returned from VPC 'create_access_token' operation."
      );
    });

    it('should throw an error and log when the request fails', async () => {
      const instance = new VpcInstanceTokenManager({ url: '123.345.567' });

      sendRequestMock.mockImplementationOnce(() => Promise.reject(new Error('This is an error.')));

      await expect(instance.getInstanceIdentityToken()).rejects.toThrow('This is an error.');

      expect(debugLogSpy.mock.calls[1][0]).toBe(
        "Caught exception from VPC 'create_access_token' operation: This is an error."
      );
    });
  });

  describe('requestToken', () => {
    it('should correctly construct headers and request parameters', async () => {
      const instance = new VpcInstanceTokenManager({ url: '123.345.567' });
      await instance.requestToken();

      const parameters = sendRequestMock.mock.calls[1][0];
      expect(parameters).toBeDefined();
      expect(parameters.options).toBeDefined();
      expect(parameters.options.url).toBe('123.345.567/instance_identity/v1/iam_token');
      expect(parameters.options.method).toBe('POST');

      expect(parameters.options.qs).toBeDefined();
      expect(parameters.options.qs.version).toBe('2022-03-01');

      // if neither the profile id or crn is set, then the body should be undefined
      expect(parameters.options.body).toBeUndefined();

      expect(parameters.options.headers).toBeDefined();
      expect(parameters.options.headers['Content-Type']).toBe('application/json');
      expect(parameters.options.headers.Accept).toBe('application/json');
      expect(parameters.options.headers.Authorization).toBe(`Bearer ${TOKEN}`);

      // check logs
      expect(debugLogSpy.mock.calls[2][0]).toBe(
        "Invoking VPC 'create_iam_token' operation: 123.345.567/instance_identity/v1/iam_token"
      );
    });

    it('should set trusted profile to iam profile crn, if set', async () => {
      const instance = new VpcInstanceTokenManager({ iamProfileCrn: 'some-crn' });
      await instance.requestToken();

      const parameters = sendRequestMock.mock.calls[1][0];
      expect(parameters).toBeDefined();
      expect(parameters.options).toBeDefined();
      expect(parameters.options.body).toBeDefined();
      expect(parameters.options.body.trusted_profile).toBeDefined();
      expect(parameters.options.body.trusted_profile.crn).toBe('some-crn');
    });

    it('should set trusted profile to iam profile id, if set', async () => {
      const instance = new VpcInstanceTokenManager({ iamProfileId: 'some-id' });
      await instance.requestToken();

      const parameters = sendRequestMock.mock.calls[1][0];
      expect(parameters).toBeDefined();
      expect(parameters.options).toBeDefined();
      expect(parameters.options.body).toBeDefined();
      expect(parameters.options.body.trusted_profile).toBeDefined();
      expect(parameters.options.body.trusted_profile.id).toBe('some-id');
    });
  });
});
