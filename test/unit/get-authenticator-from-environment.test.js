'use strict';

const {
  getAuthenticatorFromEnvironment,
  BasicAuthenticator,
  BearerTokenAuthenticator,
  CloudPakForDataAuthenticator,
  IamAuthenticator,
  NoauthAuthenticator,
} = require('../../auth');

// create a mock for the read-external-sources module
const readExternalSourcesModule = require('../../auth/utils/read-external-sources');
const readExternalSourcesMock = (readExternalSourcesModule.readExternalSources = jest.fn());

const SERVICE_NAME = 'dummy';
const APIKEY = '123456789';
const TOKEN_URL = 'get-token.com/api';

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

  it('should get noauth authenticator', () => {
    setUpNoauthPayload();
    const authenticator = getAuthenticatorFromEnvironment(SERVICE_NAME);
    expect(authenticator).toBeInstanceOf(NoauthAuthenticator);
    expect(readExternalSourcesMock).toHaveBeenCalled();
  });

  it('should get basic authenticator', () => {
    setUpBasicPayload();
    readExternalSourcesMock.mockImplementation(() => ({
      authType: 'basic',
      username: 'a',
      password: 'b',
    }));
    const authenticator = getAuthenticatorFromEnvironment(SERVICE_NAME);
    expect(authenticator).toBeInstanceOf(BasicAuthenticator);
  });

  it('should get bearer token authenticator', () => {
    setUpBearerTokenPayload();
    const authenticator = getAuthenticatorFromEnvironment(SERVICE_NAME);
    expect(authenticator).toBeInstanceOf(BearerTokenAuthenticator);
  });

  it('should get iam authenticator', () => {
    setUpIamPayload();
    const authenticator = getAuthenticatorFromEnvironment(SERVICE_NAME);
    expect(authenticator).toBeInstanceOf(IamAuthenticator);
  });

  it('should get cp4d authenticator', () => {
    setUpCp4dPayload();
    const authenticator = getAuthenticatorFromEnvironment(SERVICE_NAME);
    expect(authenticator).toBeInstanceOf(CloudPakForDataAuthenticator);
  });

  it('should throw away service properties and use auth properties', () => {
    setUpAuthPropsPayload();
    const authenticator = getAuthenticatorFromEnvironment(SERVICE_NAME);
    expect(authenticator).toBeInstanceOf(IamAuthenticator);
    expect(authenticator.apikey).toBe(APIKEY);
    expect(authenticator.disableSslVerification).toBe(true);
    expect(authenticator.url).toBe(TOKEN_URL);
  });

  it('should default to iam when auth type is not provided', () => {
    readExternalSourcesMock.mockImplementation(() => ({ apikey: APIKEY }));
    const authenticator = getAuthenticatorFromEnvironment(SERVICE_NAME);
    expect(authenticator).toBeInstanceOf(IamAuthenticator);
    expect(authenticator.apikey).toBe(APIKEY);
  });
});

// mock payloads for the read-external-sources module
function setUpNoauthPayload() {
  readExternalSourcesMock.mockImplementation(() => ({
    authType: 'noauth',
  }));
}

function setUpBasicPayload() {
  readExternalSourcesMock.mockImplementation(() => ({
    authType: 'basic',
    username: 'a',
    password: 'b',
  }));
}

function setUpBearerTokenPayload() {
  readExternalSourcesMock.mockImplementation(() => ({
    authType: 'bearerToken',
    bearerToken: 'a',
  }));
}

function setUpIamPayload() {
  readExternalSourcesMock.mockImplementation(() => ({
    authType: 'iam',
    apikey: APIKEY,
  }));
}

function setUpCp4dPayload() {
  readExternalSourcesMock.mockImplementation(() => ({
    authType: 'cp4d',
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
