/* eslint-disable no-alert, no-console */

/**
 * (C) Copyright IBM Corp. 2024.
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

jest.mock('jsonwebtoken/decode');
const decode = require('jsonwebtoken/decode');

decode.mockImplementation(() => ({ exp: 100, iat: 100 }));

const path = require('path');
const { IamAssumeTokenManager, IamTokenManager } = require('../../dist/auth');
const { RequestWrapper } = require('../../dist/lib/request-wrapper');
const { getRequestOptions } = require('./utils');
const { getCurrentTime } = require('../../dist/auth/utils/helpers');

// make sure no actual requests are sent
jest.mock('../../dist/lib/request-wrapper');

const IAM_APIKEY = 'some-apikey';
const IAM_PROFILE_NAME = 'some-name';
const IAM_PROFILE_CRN = 'some-crn';
const IAM_PROFILE_ID = 'some-id';
const IAM_ACCOUNT_ID = 'some-account';
const ACCESS_TOKEN = 'access-token';
const OTHER_ACCESS_TOKEN = 'other-access-token';
const IAM_RESPONSE = {
  result: {
    access_token: ACCESS_TOKEN,
    token_type: 'Bearer',
    expires_in: 3600,
    expiration: getCurrentTime() + 3600,
  },
  status: 200,
};
const OTHER_IAM_RESPONSE = {
  result: {
    access_token: OTHER_ACCESS_TOKEN,
    token_type: 'Bearer',
    expires_in: 3600,
    expiration: getCurrentTime() + 3600,
  },
  status: 200,
};

describe('IAM Assume Token Manager', () => {
  const sendRequestMock = jest.fn();
  sendRequestMock.mockResolvedValue(IAM_RESPONSE);
  RequestWrapper.mockImplementation(() => ({
    sendRequest: sendRequestMock,
  }));
  afterEach(() => {
    sendRequestMock.mockClear();
  });
  afterAll(() => {
    sendRequestMock.mockRestore();
  });

  describe('constructor', () => {
    it('should throw an error is no api key is provided', () => {
      expect(() => new IamAssumeTokenManager()).toThrow('Missing required parameters: apikey');
    });

    it('should throw an error is no profile information is provided', () => {
      expect(() => new IamAssumeTokenManager({ apikey: 'some-key' })).toThrow(
        'Exactly one of `iamProfileName`, `iamProfileCrn`, or `iamProfileId` must be specified.'
      );
    });

    it('should throw an error if both profile name and id are provided', () => {
      expect(
        () =>
          new IamAssumeTokenManager({
            apikey: 'some-key',
            iamProfileName: 'some-name',
            iamProfileId: 'some-id',
          })
      ).toThrow(
        'Exactly one of `iamProfileName`, `iamProfileCrn`, or `iamProfileId` must be specified.'
      );
    });

    it('should throw an error if both profile name and crn are provided', () => {
      expect(
        () =>
          new IamAssumeTokenManager({
            apikey: 'some-key',
            iamProfileName: 'some-name',
            iamProfileCrn: 'some-crn',
          })
      ).toThrow(
        'Exactly one of `iamProfileName`, `iamProfileCrn`, or `iamProfileId` must be specified.'
      );
    });

    it('should throw an error if both profile crn and id are provided', () => {
      expect(
        () =>
          new IamAssumeTokenManager({
            apikey: 'some-key',
            iamProfileId: 'some-id',
            iamProfileCrn: 'some-crn',
          })
      ).toThrow(
        'Exactly one of `iamProfileName`, `iamProfileCrn`, or `iamProfileId` must be specified.'
      );
    });

    it('should throw an error if profile name, crn, and id are all provided', () => {
      expect(
        () =>
          new IamAssumeTokenManager({
            apikey: 'some-key',
            iamProfileName: 'some-name',
            iamProfileId: 'some-id',
            iamProfileCrn: 'some-crn',
          })
      ).toThrow(
        'Exactly one of `iamProfileName`, `iamProfileCrn`, or `iamProfileId` must be specified.'
      );
    });

    it('should throw an error if profile name is provided without an account id', () => {
      expect(
        () =>
          new IamAssumeTokenManager({
            apikey: 'some-key',
            iamProfileName: 'some-name',
          })
      ).toThrow('`iamProfileName` and `iamAccountId` must be provided together, or not at all');
    });

    it('should throw an error if account id is provided without a profile name', () => {
      expect(
        () =>
          new IamAssumeTokenManager({
            apikey: 'some-key',
            iamProfileId: 'some-id',
            iamAccountId: 'some-account',
          })
      ).toThrow('`iamProfileName` and `iamAccountId` must be provided together, or not at all');
    });

    it('should create an iam token manager delegate with the apikey', () => {
      const instance = new IamAssumeTokenManager({
        apikey: IAM_APIKEY,
        iamProfileId: IAM_PROFILE_ID,
      });

      expect(instance.iamDelegate).toBeInstanceOf(IamTokenManager);
      expect(instance.iamDelegate.apikey).toBe(IAM_APIKEY);
    });

    it('should set given profile id', () => {
      const instance = new IamAssumeTokenManager({
        apikey: IAM_APIKEY,
        iamProfileId: IAM_PROFILE_ID,
      });

      expect(instance.iamProfileId).toBe(IAM_PROFILE_ID);
    });

    it('should set given profile crn', () => {
      const instance = new IamAssumeTokenManager({
        apikey: IAM_APIKEY,
        iamProfileCrn: IAM_PROFILE_CRN,
      });

      expect(instance.iamProfileCrn).toBe(IAM_PROFILE_CRN);
    });

    it('should set given profile name and account id', () => {
      const instance = new IamAssumeTokenManager({
        apikey: IAM_APIKEY,
        iamProfileName: IAM_PROFILE_NAME,
        iamAccountId: IAM_ACCOUNT_ID,
      });

      expect(instance.iamProfileName).toBe(IAM_PROFILE_NAME);
      expect(instance.iamAccountId).toBe(IAM_ACCOUNT_ID);
    });

    it('should initialize form data', () => {
      const instance = new IamAssumeTokenManager({
        apikey: IAM_APIKEY,
        iamProfileCrn: IAM_PROFILE_CRN,
      });

      const { formData } = instance;
      expect(formData).toBeDefined();
      expect(formData.grant_type).toBe('urn:ibm:params:oauth:grant-type:assume');
    });

    it('should initialize user agent field', () => {
      const instance = new IamAssumeTokenManager({
        apikey: IAM_APIKEY,
        iamProfileCrn: IAM_PROFILE_CRN,
      });

      expect(instance.userAgent).toMatch('iam-assume-authenticator');
    });

    it('should store client id, secret, and scope in delegate but not in the class', () => {
      const instance = new IamAssumeTokenManager({
        apikey: IAM_APIKEY,
        iamProfileCrn: IAM_PROFILE_CRN,
        clientId: 'some-id',
        clientSecret: 'some-secret',
        scope: 'some-scope',
      });

      expect(instance.clientId).toBeUndefined();
      expect(instance.clientSecret).toBeUndefined();
      expect(instance.scope).toBeUndefined();
      expect(instance.iamDelegate.clientId).toBe('some-id');
      expect(instance.iamDelegate.clientSecret).toBe('some-secret');
      expect(instance.iamDelegate.scope).toBe('some-scope');
    });
  });

  describe('setters', () => {
    it('should setScope() on iam delegate', () => {
      const instance = new IamAssumeTokenManager({
        apikey: IAM_APIKEY,
        iamProfileId: IAM_PROFILE_ID,
      });

      expect(instance.scope).toBeUndefined();
      expect(instance.iamDelegate.scope).toBeUndefined();

      instance.setScope('some-scope');

      expect(instance.scope).toBeUndefined();
      expect(instance.iamDelegate.scope).toBe('some-scope');
    });

    it('should setClientIdAndSecret() on iam delegate', () => {
      const instance = new IamAssumeTokenManager({
        apikey: IAM_APIKEY,
        iamProfileId: IAM_PROFILE_ID,
      });

      expect(instance.clientId).toBeUndefined();
      expect(instance.clientSecret).toBeUndefined();
      expect(instance.iamDelegate.clientId).toBeUndefined();
      expect(instance.iamDelegate.clientSecret).toBeUndefined();

      instance.setClientIdAndSecret('some-id', 'some-secret');

      expect(instance.clientId).toBeUndefined();
      expect(instance.clientSecret).toBeUndefined();
      expect(instance.iamDelegate.clientId).toBe('some-id');
      expect(instance.iamDelegate.clientSecret).toBe('some-secret');
    });

    it('should setDisableSslVerification() on class and iam delegate', () => {
      const instance = new IamAssumeTokenManager({
        apikey: IAM_APIKEY,
        iamProfileId: IAM_PROFILE_ID,
      });

      expect(instance.disableSslVerification).toBe(false);
      expect(instance.iamDelegate.disableSslVerification).toBe(false);

      instance.setDisableSslVerification(true);

      expect(instance.disableSslVerification).toBe(true);
      expect(instance.iamDelegate.disableSslVerification).toBe(true);
    });

    it('should setHeaders() on iam delegate', () => {
      const instance = new IamAssumeTokenManager({
        apikey: IAM_APIKEY,
        iamProfileId: IAM_PROFILE_ID,
      });

      expect(instance.headers).toEqual({});
      expect(instance.iamDelegate.headers).toEqual({});

      instance.setHeaders({ 'X-Some-Header': 'some-value' });

      expect(instance.headers).toEqual({ 'X-Some-Header': 'some-value' });
      expect(instance.iamDelegate.headers).toEqual({ 'X-Some-Header': 'some-value' });
    });
  });

  describe('requestToken', () => {
    it('should add profile id to the form data', async () => {
      const instance = new IamAssumeTokenManager({
        apikey: IAM_APIKEY,
        iamProfileId: IAM_PROFILE_ID,
      });

      await instance.requestToken();

      // Also, ensure we set the access token we received from the IAM token manager.
      expect(instance.formData.access_token).toBe(ACCESS_TOKEN);
      expect(instance.formData.profile_id).toBe(IAM_PROFILE_ID);

      // Expect other profile information to not be set.
      expect(instance.formData.profile_crn).toBeUndefined();
      expect(instance.formData.profile_name).toBeUndefined();
      expect(instance.formData.account).toBeUndefined();
    });

    it('should add profile crn to the form data', async () => {
      const instance = new IamAssumeTokenManager({
        apikey: IAM_APIKEY,
        iamProfileCrn: IAM_PROFILE_CRN,
      });

      await instance.requestToken();

      expect(instance.formData.profile_crn).toBe(IAM_PROFILE_CRN);
      expect(instance.formData.access_token).toBe(ACCESS_TOKEN);

      // Expect other profile information to not be set.
      expect(instance.formData.profile_id).toBeUndefined();
      expect(instance.formData.profile_name).toBeUndefined();
      expect(instance.formData.account).toBeUndefined();
    });

    it('should add profile name and account id to the form data', async () => {
      const instance = new IamAssumeTokenManager({
        apikey: IAM_APIKEY,
        iamProfileName: IAM_PROFILE_NAME,
        iamAccountId: IAM_ACCOUNT_ID,
      });

      await instance.requestToken();

      expect(instance.formData.profile_name).toBe(IAM_PROFILE_NAME);
      expect(instance.formData.account).toBe(IAM_ACCOUNT_ID);
      expect(instance.formData.access_token).toBe(ACCESS_TOKEN);

      // Expect other profile information to not be set.
      expect(instance.formData.profile_crn).toBeUndefined();
      expect(instance.formData.profile_id).toBeUndefined();
    });

    it('should set User-Agent header', async () => {
      const instance = new IamAssumeTokenManager({
        apikey: IAM_APIKEY,
        iamProfileCrn: IAM_PROFILE_CRN,
      });

      await instance.requestToken();

      // The first request (index 0) will be the IAM token manager's request.
      // Verify it is called as well.
      const iamRequestOptions = getRequestOptions(sendRequestMock, 0);
      expect(iamRequestOptions.headers).toBeDefined();
      expect(iamRequestOptions.headers['User-Agent']).toMatch(
        /^ibm-node-sdk-core\/iam-authenticator.*$/
      );

      // Then, look at the second request (index 1) to see the
      // agent for the IAM Assume token manager.
      const assumeRequestOptions = getRequestOptions(sendRequestMock, 1);
      expect(assumeRequestOptions.headers).toBeDefined();
      expect(assumeRequestOptions.headers['User-Agent']).toMatch(
        /^ibm-node-sdk-core\/iam-assume-authenticator.*$/
      );
    });

    it('use getToken to invoke requestToken', async () => {
      // Verify we're seeing two different results - one from the IAM
      // token manager and one from the IAM Assume token manager.
      sendRequestMock.mockResolvedValueOnce(IAM_RESPONSE);
      sendRequestMock.mockResolvedValueOnce(OTHER_IAM_RESPONSE);

      const instance = new IamAssumeTokenManager({
        apikey: IAM_APIKEY,
        iamProfileName: IAM_PROFILE_NAME,
        iamAccountId: IAM_ACCOUNT_ID,
      });

      const accessToken = await instance.getToken();

      expect(accessToken).toBe(OTHER_ACCESS_TOKEN);

      // Ensure the refresh token is NOT saved after `getToken` is called.
      expect(instance.refreshToken).toBeUndefined();
    });

    it('should use client id, secret, and scope in delegate request but not the manager request', async () => {
      const instance = new IamAssumeTokenManager({
        apikey: IAM_APIKEY,
        iamProfileCrn: IAM_PROFILE_CRN,
        clientId: 'some-id',
        clientSecret: 'some-secret',
        scope: 'some-scope',
      });

      await instance.requestToken();

      // Check the IAM delegate's request first.
      const iamRequestOptions = getRequestOptions(sendRequestMock, 0);
      expect(iamRequestOptions.headers).toBeDefined();
      expect(iamRequestOptions.headers.Authorization).toBe('Basic c29tZS1pZDpzb21lLXNlY3JldA==');
      expect(iamRequestOptions.form.scope).toBe('some-scope');

      // Then, look at the second request from the IAM Assume token manager.
      const assumeRequestOptions = getRequestOptions(sendRequestMock, 1);
      expect(assumeRequestOptions.headers).toBeDefined();
      expect(assumeRequestOptions.headers.Authorization).toBeUndefined();
      expect(assumeRequestOptions.form.scope).toBeUndefined();
    });
  });
});
