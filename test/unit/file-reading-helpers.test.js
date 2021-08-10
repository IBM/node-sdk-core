const fs = require('fs');
const {
  constructFilepath,
  fileExistsAtPath,
  readCredentialsFile,
  readCrTokenFile,
} = require('../../dist/auth');

const logger = require('../../dist/lib/logger').default;

describe('browser scenario', () => {
  const existSync = fs.existsSync;
  beforeAll(() => {
    fs.existsSync = undefined;
  });

  it('should return empty object from `readCredentialsFile` when webpack override fs with empty object', () => {
    const cred = readCredentialsFile();
    expect(cred).toEqual({});
  });

  it('should return empty object from `readCrTokenFile` when webpack override fs with empty object', () => {
    const cred = readCrTokenFile('/made/up/path');
    expect(cred).toEqual('');
  });

  afterAll(() => {
    fs.existsSync = existSync;
  });
});

describe('read ibm credentials file', () => {
  const locationOfActualFile = `${__dirname}/../resources`;
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

    it('should return true for a symbolic link', () => {
      const path = `${__dirname}/../resources/symlink-creds.txt`;
      expect(fileExistsAtPath(path)).toBe(true);
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

      expect(obj.SERVICE_2_AUTH_TYPE).toBe('iam');
      expect(obj.SERVICE_2_APIKEY).toBe('V4HXmoUtMjohnsnow=KotN');
      expect(obj.SERVICE_2_AUTH_URL).toBe('https://iamhost/iam/api=');
      expect(obj.SERVICE_2_CLIENT_ID).toBe('somefake========id');
      expect(obj.SERVICE_2_CLIENT_SECRET).toBe('==my-client-secret==');
      expect(obj.SERVICE_2_SCOPE).toBe('A B C D');
    });

    it('should return credentials as an object for alternate filename', () => {
      process.env.IBM_CREDENTIALS_FILE = `${__dirname}/../resources/other-file.env`;
      const obj = readCredentialsFile();
      expect(obj.NATURAL_LANGUAGE_UNDERSTANDING_USERNAME).toBe('username');
      expect(obj.NATURAL_LANGUAGE_UNDERSTANDING_PASSWORD).toBe('password');
    });

    it('should return empty object if file is not found', () => {
      delete process.env.IBM_CREDENTIALS_FILE;
      const obj = readCredentialsFile();
      expect(obj).toEqual({});
    });
  });
});

describe('Read CR Token File', () => {
  const loggerDebugMock = jest.spyOn(logger, 'debug').mockImplementation(() => {});
  const loggerErrorMock = jest.spyOn(logger, 'error').mockImplementation(() => {});

  afterEach(() => {
    loggerDebugMock.mockClear();
    loggerErrorMock.mockClear();
  });

  afterAll(() => {
    loggerDebugMock.mockRestore();
    loggerErrorMock.mockRestore();
  });

  it('should successfully return contents of file as a string', () => {
    const filename = `${__dirname}/../resources/vault-token`;
    const token = readCrTokenFile(filename);

    expect(token).toBe('my-cr-token-123');
    expect(loggerDebugMock).toHaveBeenCalledWith(
      `Successfully read CR token from file: ${filename}`
    );
  });

  it('should throw an error if given file does not exist', () => {
    const filename = '/path/to/nowhere/';
    expect(() => {
      const token = readCrTokenFile(filename);
    }).toThrow(`Unable to retrieve the CR token value from file: ${filename}`);

    expect(loggerErrorMock).toHaveBeenCalledWith(
      `Expected to find CR token file but the file does not exist: ${filename}`
    );
  });

  it('should throw an error if given file is empty', () => {
    const filename = `${__dirname}/../resources/empty-file`;
    expect(() => {
      const token = readCrTokenFile(filename);
    }).toThrow(`Unable to retrieve the CR token value from file: ${filename}`);

    expect(loggerErrorMock).toHaveBeenCalledWith(
      `Expected to read CR token from file but the file is empty: ${filename}`
    );
  });

  it('should throw an error if file read goes wrong', () => {
    const filename = `${__dirname}/../resources/vault-token`;
    const fileReadingError = 'Bad file read!';
    const readFileMock = jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw new Error(fileReadingError);
    });

    expect(() => {
      const token = readCrTokenFile(filename);
    }).toThrow(fileReadingError);

    expect(loggerDebugMock).not.toHaveBeenCalled();
    expect(loggerErrorMock).not.toHaveBeenCalled();

    readFileMock.mockRestore();
  });
});
