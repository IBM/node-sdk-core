/**
 * (C) Copyright IBM Corp. 2019, 2025.
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

const {
  getAuthenticatorFromEnvironment,
  Authenticator,
  BasicAuthenticator,
  BearerTokenAuthenticator,
  CloudPakForDataAuthenticator,
  IamAuthenticator,
  ContainerAuthenticator,
  VpcInstanceAuthenticator,
  McspAuthenticator,
  McspV2Authenticator,
  NoAuthAuthenticator,
} = require('../../dist/auth');

// create a mock for the read-external-sources module
const readExternalSourcesModule = require('../../dist/auth/utils/read-external-sources');

readExternalSourcesModule.readExternalSources = jest.fn();
const readExternalSourcesMock = readExternalSourcesModule.readExternalSources;

const SERVICE_NAME = 'dummy';
const APIKEY = '123456789';
const TOKEN_URL = 'get-token.com/api';
const IAM_PROFILE_NAME = 'some-name';

describe('Get Authenticator From Environment Module', () => {
  afterEach(() => {
    readExternalSourcesMock.mockReset();
  });

  it('should throw an error when the service name is not provided', () => {
    expect(() => getAuthenticatorFromEnvironment()).toThrow();
  });

  it('should throw an error when read-external-sources payload is null', () => {
    readExternalSourcesMock.mockImplementation(() => null);
    expect(() => getAuthenticatorFromEnvironment(SERVICE_NAME)).toThrow();
  });

  it('should get no auth authenticator - tests case insentivity of auth type', () => {
    setUpNoAuthPayload();
    const authenticator = getAuthenticatorFromEnvironment(SERVICE_NAME);
    expect(authenticator).toBeInstanceOf(NoAuthAuthenticator);
    expect(authenticator.authenticationType()).toEqual(Authenticator.AUTHTYPE_NOAUTH);
    expect(readExternalSourcesMock).toHaveBeenCalled();
  });

  it('should get basic authenticator', () => {
    setUpBasicPayload();
    const authenticator = getAuthenticatorFromEnvironment(SERVICE_NAME);
    expect(authenticator).toBeInstanceOf(BasicAuthenticator);
    expect(authenticator.authenticationType()).toEqual(Authenticator.AUTHTYPE_BASIC);
  });

  it('should get bearer token authenticator', () => {
    setUpBearerTokenPayload();
    const authenticator = getAuthenticatorFromEnvironment(SERVICE_NAME);
    expect(authenticator).toBeInstanceOf(BearerTokenAuthenticator);
    expect(authenticator.authenticationType()).toEqual(Authenticator.AUTHTYPE_BEARERTOKEN);
  });

  it('should get iam authenticator', () => {
    setUpIamPayload();
    const authenticator = getAuthenticatorFromEnvironment(SERVICE_NAME);
    expect(authenticator).toBeInstanceOf(IamAuthenticator);
    expect(authenticator.authenticationType()).toEqual(Authenticator.AUTHTYPE_IAM);
  });

  it('should get mcsp v1 authenticator', () => {
    setUpMcspPayload();
    const authenticator = getAuthenticatorFromEnvironment(SERVICE_NAME);
    expect(authenticator).toBeInstanceOf(McspAuthenticator);
    expect(authenticator.authenticationType()).toEqual(Authenticator.AUTHTYPE_MCSP);
  });

  it('should get mcsp v2 authenticator', () => {
    setUpMcspV2Payload();
    const authenticator = getAuthenticatorFromEnvironment(SERVICE_NAME);
    expect(authenticator).toBeInstanceOf(McspV2Authenticator);
    expect(authenticator.authenticationType()).toEqual(Authenticator.AUTHTYPE_MCSPV2);
    expect(authenticator.tokenManager.apikey).toEqual(APIKEY);
    expect(authenticator.tokenManager.url).toEqual(TOKEN_URL);
    expect(authenticator.tokenManager.scopeCollectionType).toEqual('accounts');
    expect(authenticator.tokenManager.scopeId).toEqual('global_account');
    expect(authenticator.tokenManager.includeBuiltinActions).toBe(true);
    expect(authenticator.tokenManager.includeCustomActions).toBe(true);
    expect(authenticator.tokenManager.includeRoles).toBe(false);
    expect(authenticator.tokenManager.prefixRoles).toEqual(true);
    expect(authenticator.tokenManager.callerExtClaim).toEqual({ productID: 'prod-123' });
  });

  it('should get cp4d authenticator', () => {
    setUpCp4dPayload();
    const authenticator = getAuthenticatorFromEnvironment(SERVICE_NAME);
    expect(authenticator).toBeInstanceOf(CloudPakForDataAuthenticator);
    expect(authenticator.authenticationType()).toEqual(Authenticator.AUTHTYPE_CP4D);
  });

  it('should get container authenticator', () => {
    setUpContainerPayload();
    const authenticator = getAuthenticatorFromEnvironment(SERVICE_NAME);
    expect(authenticator).toBeInstanceOf(ContainerAuthenticator);
    expect(authenticator.authenticationType()).toEqual(Authenticator.AUTHTYPE_CONTAINER);
  });

  it('should get vpc instance authenticator', () => {
    setUpVpcInstancePayload();
    const authenticator = getAuthenticatorFromEnvironment(SERVICE_NAME);
    expect(authenticator).toBeInstanceOf(VpcInstanceAuthenticator);
    expect(authenticator.authenticationType()).toEqual(Authenticator.AUTHTYPE_VPC);
  });

  it('should throw away service properties and use auth properties', () => {
    setUpAuthPropsPayload();
    const authenticator = getAuthenticatorFromEnvironment(SERVICE_NAME);
    expect(authenticator).toBeInstanceOf(IamAuthenticator);
    expect(authenticator.authenticationType()).toEqual(Authenticator.AUTHTYPE_IAM);
    expect(authenticator.apikey).toBe(APIKEY);
    expect(authenticator.disableSslVerification).toBe(true);
    expect(authenticator.url).toBe(TOKEN_URL);
  });

  it('should default to container auth when auth type is not provided', () => {
    readExternalSourcesMock.mockImplementation(() => ({ iamProfileName: IAM_PROFILE_NAME }));
    const authenticator = getAuthenticatorFromEnvironment(SERVICE_NAME);
    expect(authenticator).toBeInstanceOf(ContainerAuthenticator);
    expect(authenticator.authenticationType()).toEqual(Authenticator.AUTHTYPE_CONTAINER);
    expect(authenticator.iamProfileName).toBe(IAM_PROFILE_NAME);
  });

  it('should default to iam when auth type is not provided and apikey is provided', () => {
    readExternalSourcesMock.mockImplementation(() => ({ apikey: APIKEY }));
    const authenticator = getAuthenticatorFromEnvironment(SERVICE_NAME);
    expect(authenticator).toBeInstanceOf(IamAuthenticator);
    expect(authenticator.authenticationType()).toEqual(Authenticator.AUTHTYPE_IAM);
    expect(authenticator.apikey).toBe(APIKEY);
  });

  it('should throw an error when an unsupported auth type is provided', () => {
    readExternalSourcesMock.mockImplementation(() => ({ apikey: APIKEY, authType: 'unsupported' }));
    expect(() => {
      getAuthenticatorFromEnvironment(SERVICE_NAME);
    }).toThrow();
  });

  it('should get iam authenticator and set the scope', () => {
    setUpIamPayloadWithScope();
    const authenticator = getAuthenticatorFromEnvironment(SERVICE_NAME);
    expect(authenticator).toBeInstanceOf(IamAuthenticator);
    expect(authenticator.authenticationType()).toEqual(Authenticator.AUTHTYPE_IAM);
    expect(authenticator.scope).toBe('jon snow');
  });
});

// mock payloads for the read-external-sources module
function setUpNoAuthPayload() {
  readExternalSourcesMock.mockImplementation(() => ({
    authType: 'noauth',
  }));
}

function setUpBasicPayload() {
  readExternalSourcesMock.mockImplementation(() => ({
    authtype: 'bAsIC',
    username: 'a',
    password: 'b',
  }));
}

function setUpBearerTokenPayload() {
  readExternalSourcesMock.mockImplementation(() => ({
    authType: 'BeaRerToken',
    bearerToken: 'a',
  }));
}

function setUpIamPayload() {
  readExternalSourcesMock.mockImplementation(() => ({
    authType: 'iam',
    apikey: APIKEY,
  }));
}

function setUpIamPayloadWithScope() {
  readExternalSourcesMock.mockImplementation(() => ({
    authType: 'iam',
    apikey: APIKEY,
    scope: 'jon snow',
  }));
}

function setUpMcspPayload() {
  readExternalSourcesMock.mockImplementation(() => ({
    authType: 'mcsp',
    apikey: APIKEY,
    authUrl: TOKEN_URL,
  }));
}

function setUpMcspV2Payload() {
  readExternalSourcesMock.mockImplementation(() => ({
    authType: 'mcspv2',
    apikey: APIKEY,
    authUrl: TOKEN_URL,
    scopeCollectionType: 'accounts',
    scopeId: 'global_account',
    includeBuiltinActions: 'true',
    includeCustomActions: 'true',
    includeRoles: 'false',
    prefixRoles: 'true',
    callerExtClaim: '{"productID": "prod-123"}',
  }));
}

function setUpCp4dPayload() {
  readExternalSourcesMock.mockImplementation(() => ({
    authtype: 'cP4d',
    username: 'a',
    password: 'b',
    authUrl: TOKEN_URL,
  }));
}

function setUpAuthPropsPayload() {
  readExternalSourcesMock.mockImplementation(() => ({
    apikey: APIKEY,
    authUrl: TOKEN_URL,
    authDisableSsl: true,
    url: 'thisshouldbethrownaway.com',
    disableSsl: false,
  }));
}

function setUpContainerPayload() {
  readExternalSourcesMock.mockImplementation(() => ({
    authType: 'conTAINer',
    crTokenFilename: '/path/to/file',
    iamProfileName: IAM_PROFILE_NAME,
    iamProfileId: 'some-id',
  }));
}

function setUpVpcInstancePayload() {
  readExternalSourcesMock.mockImplementation(() => ({
    authType: 'vPc',
    iamProfileId: 'some-id',
  }));
}
