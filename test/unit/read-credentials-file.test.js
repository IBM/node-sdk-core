'use strict';

const fs = require('fs');
const { constructFilepath, fileExistsAtPath, readCredentialsFile } = require('../../dist/auth');

describe('browser scenario', () => {
  const existSync = fs.existsSync;
  beforeAll(() => {
    fs.existsSync = undefined;
  });

  it('should return empty object when webpack override fs with empty object', () => {
    const cred = readCredentialsFile();
    expect(cred).toEqual({});
  });

  afterAll(() => {
    fs.existsSync = existSync;
  });
});

describe('read ibm credentials file', () => {
  const locationOfActualFile = __dirname + '/../resources';
  process.env.IBM_CREDENTIALS_FILE = locationOfActualFile;

  describe('construct filepath', () => {
    const expectedPath = '/path/to/file/ibm-credentials.env';

    it('should build filepath from absolute path', () => {
      const path = constructFilepath('/path/to/file/');
      expect(path).toBe(expectedPath);
    });

    it('should build filepath from relative path', () => {
      const path = constructFilepath('/path/to/file');
      expect(path).toBe(expectedPath);
    });

    it('should not alter path if ends with correct filename', () => {
      const path = constructFilepath(expectedPath);
      expect(path).toBe(expectedPath);
    });
  });

  describe('file exists at path', () => {
    it('should return true if the file exists at the given path', () => {
      const path = constructFilepath(locationOfActualFile);
      expect(fileExistsAtPath(path)).toBe(true);
    });

    it('should return false if path is correct but is not a file', () => {
      const path = locationOfActualFile;
      expect(fileExistsAtPath(path)).toBe(false);
    });

    it('should return false if the file does not exist at the given path', () => {
      const path = constructFilepath(process.cwd());
      expect(fileExistsAtPath(path)).toBe(false);
    });

    it('should return false and not crash for a silly filepath', () => {
      const path = '/path/to/file/wrong-file.env';
      expect(fileExistsAtPath(path)).toBe(false);
    });
  });

  describe('read credentials file', () => {
    it('should return credentials as an object if file exists', () => {
      const obj = readCredentialsFile();
      expect(obj.TEST_SERVICE_AUTH_TYPE).toBe('iam');
      expect(obj.TEST_SERVICE_APIKEY).toBe('12345');
      expect(obj.TEST_SERVICE_AUTH_URL).toBe('iam.staging.com/api');
      expect(obj.TEST_SERVICE_CLIENT_ID).toBe('my-id');
      expect(obj.TEST_SERVICE_CLIENT_SECRET).toBe('my-secret');
      expect(obj.TEST_SERVICE_AUTH_DISABLE_SSL).toBe('true');
      expect(obj.TEST_SERVICE_URL).toBe('service.com/api');
      expect(obj.TEST_SERVICE_DISABLE_SSL).toBe('true');

      expect(obj.SERVICE_1_AUTH_TYPE).toBe('iam');
      expect(obj.SERVICE_1_APIKEY).toBe('V4HXmoUtMjohnsnow=KotN');
      expect(obj.SERVICE_1_AUTH_URL).toBe('https://iamhost/iam/api=');
      expect(obj.SERVICE_1_CLIENT_ID).toBe('somefake========id');
      expect(obj.SERVICE_1_CLIENT_SECRET).toBe('==my-client-secret==');
      expect(obj.SERVICE_1_AUTH_DISABLE_SSL).toBe('');
      expect(obj.SERVICE_1_URL).toBe('service1.com/api');
    });

    it('should return credentials as an object for alternate filename', () => {
      process.env['IBM_CREDENTIALS_FILE'] = __dirname + '/../resources/other-file.env';
      const obj = readCredentialsFile();
      expect(obj.NATURAL_LANGUAGE_UNDERSTANDING_USERNAME).toBe('username');
      expect(obj.NATURAL_LANGUAGE_UNDERSTANDING_PASSWORD).toBe('password');
    });

    it('should return empty object if file is not found', () => {
      delete process.env['IBM_CREDENTIALS_FILE'];
      const obj = readCredentialsFile();
      expect(obj).toEqual({});
    });
  });
});
