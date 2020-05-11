'use strict';

const { readExternalSources } = require('../../dist/auth');

// constants
const SERVICE_NAME = 'test_service';
const APIKEY = '123456789';
const USERNAME = 'michael-leaue';
const PASSWORD = 'snarkypuppy123';
const BEARER_TOKEN = 'abc123';

describe('Read External Sources Module', () => {
  // setup
  let env;

  beforeEach(() => {
    // remove all environment vars
    env = process.env;
    process.env = {};
  });

  afterEach(() => {
    // restore environment vars
    process.env = env;
  });

  // tests
  it('should throw an error if service name is not given', () => {
    expect(() => readExternalSources()).toThrow();
  });

  // creds file
  it('should return an object from the credentials file', () => {
    setupCredsFile();
    const properties = readExternalSources(SERVICE_NAME);
    expect(properties).not.toBeNull();
    // auth props
    expect(properties.authType).toBe('iam');
    expect(properties.apikey).toBe('12345');
    expect(properties.authUrl).toBe('iam.staging.com/api');
    expect(properties.clientId).toBe('my-id');
    expect(properties.clientSecret).toBe('my-secret');
    expect(properties.authDisableSsl).toBe(true);

    // service props
    expect(properties.disableSsl).toBe(true);
    expect(properties.url).toBe('service.com/api');
  });

  // env
  it('should return an object from environment variables', () => {
    setupEnvVars();
    const properties = readExternalSources(SERVICE_NAME);
    expect(properties).not.toBeNull();
    expect(properties.authType).toBe('basic');
    expect(properties.username).toBe(USERNAME);
    expect(properties.password).toBe(PASSWORD);
  });

  // vcap
  it('should return an iam object from VCAP_SERVICES', () => {
    setupIamVcap();
    const properties = readExternalSources(SERVICE_NAME);
    expect(properties).not.toBeNull();
    expect(properties.apikey).toBe(APIKEY);
    expect(properties.url).toBeDefined();
  });

  it('should parse values containing the "=" character from VCAP_SERVICES', () => {
    setupIamVcap();
    const properties = readExternalSources('equals_sign_test');
    expect(properties).not.toBeNull();
    expect(properties.apikey).toBe('V4HXmoUtMjohnsnow=KotN');
    expect(properties.iam_url).toBe('https://iamhost/iam/api=');
    expect(properties.url).toBe('https://gateway.watsonplatform.net/testService');
  });

  it('should set authentication type for basic auth object from VCAP_SERVICES', () => {
    setupBasicVcap();
    const properties = readExternalSources(SERVICE_NAME);
    expect(properties).not.toBeNull();
    expect(properties.username).toBeDefined();
    expect(properties.password).toBeDefined();
    expect(properties.url).toBeDefined();
    expect(properties.authType).toBe('basic');
  });

  it('should prefer creds file over env vars', () => {
    setupCredsFile();
    setupEnvVars();
    const properties = readExternalSources(SERVICE_NAME);
    expect(properties).not.toBeNull();
    // expect the properties in the credentials file
    expect(properties.authType).toBe('iam');
    expect(properties.apikey).toBe('12345');
  });

  it('should prefer env vars over vcap', () => {
    setupEnvVars();
    setupIamVcap();
    const properties = readExternalSources(SERVICE_NAME);
    expect(properties).not.toBeNull();
    expect(properties.authType).toBe('basic');
    expect(properties.username).toBe(USERNAME);
    expect(properties.password).toBe(PASSWORD);
    expect(properties.bearerToken).toBe(BEARER_TOKEN);
  });

  it('should convert a dash separated name to underscore separated', () => {
    setupEnvVars();
    const properties = readExternalSources('Test-Service');
    expect(properties).not.toBeNull();
    expect(properties.authType).toBe('basic');
    expect(properties.username).toBe(USERNAME);
    expect(properties.password).toBe(PASSWORD);
  });

  it('should parse values containing the "=" character', () => {
    setupEnvVars();
    const properties = readExternalSources('Service-1');
    expect(properties).not.toBeNull();
    // expect the properties in the credentials file
    expect(properties.authType).toBe('iam');
    expect(properties.apikey).toBe('V4HXmoUtMjohnsnow=KotN');
    expect(properties.clientId).toBe('somefake========id');
    expect(properties.clientSecret).toBe('==my-client-secret==');
    expect(properties.authUrl).toBe('https://iamhost/iam/api=');
    expect(properties.url).toBe('service1.com/api');
  });

  it('should convert disableSsl values from string to boolean', () => {
    process.env.TEST_SERVICE_DISABLE_SSL = 'true';
    process.env.TEST_SERVICE_AUTH_DISABLE_SSL = 'true';
    const properties = readExternalSources(SERVICE_NAME);
    expect(typeof properties.disableSsl).toBe('boolean');
    expect(typeof properties.authDisableSsl).toBe('boolean');
  });
});

// helper functions for setting up process.env

function setupCredsFile() {
  // this file contains all possible iam creds
  process.env.IBM_CREDENTIALS_FILE = __dirname + '/../resources/ibm-credentials.env';
}

function setupEnvVars() {
  // the service name matches what is in the credentials file
  // to test priority between the two
  process.env.TEST_SERVICE_AUTH_TYPE = 'basic';
  process.env.TEST_SERVICE_USERNAME = USERNAME;
  process.env.TEST_SERVICE_PASSWORD = PASSWORD;
  // just for coverage on all potential auth properties
  process.env.TEST_SERVICE_BEARER_TOKEN = BEARER_TOKEN;
  // Service1 auth properties configured with IAM and a token containing '='
  process.env.SERVICE_1_AUTH_TYPE = 'iam';
  process.env.SERVICE_1_APIKEY = 'V4HXmoUtMjohnsnow=KotN';
  process.env.SERVICE_1_CLIENT_ID = 'somefake========id';
  process.env.SERVICE_1_CLIENT_SECRET = '==my-client-secret==';
  process.env.SERVICE_1_AUTH_URL = 'https://iamhost/iam/api=';
  // Service1 service properties
  process.env.SERVICE_1_URL = 'service1.com/api';
}

function setupIamVcap() {
  process.env.VCAP_SERVICES = JSON.stringify({
    test_service: [
      {
        credentials: {
          apikey: APIKEY,
          iam_apikey_description: 'Auto generated apikey...',
          iam_apikey_name: 'auto-generated-apikey-111-222-333',
          iam_role_crn: 'crn:v1:cloud:public:iam::::serviceRole:Manager',
          iam_serviceid_crn: 'crn:v1:staging:public:iam-identity::a/::serviceid:ServiceID-1234',
          url: 'https://gateway.watsonplatform.net/test/api',
        },
      },
    ],
    equals_sign_test: [
      {
        credentials: {
          apikey: 'V4HXmoUtMjohnsnow=KotN',
          iam_apikey_description: 'Auto generated apikey...',
          iam_apikey_name: 'auto-generated-apikey-111-222-333',
          iam_role_crn: 'crn:v1:bluemix:public:iam::::serviceRole:Manager',
          iam_serviceid_crn: 'crn:v1:staging:public:iam-identity::a/::serviceid:ServiceID-1234',
          url: 'https://gateway.watsonplatform.net/testService',
          iam_url: 'https://iamhost/iam/api=',
        },
      },
    ],
  });
}

function setupBasicVcap() {
  process.env.VCAP_SERVICES = JSON.stringify({
    test_service: [
      {
        credentials: {
          password: 'vcap_pass',
          url: 'https://gateway.watsonplatform.net/test/api',
          username: 'vcap_user',
        },
      },
    ],
  });
}
