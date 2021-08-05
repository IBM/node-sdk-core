/* eslint-disable no-alert, no-console */

const path = require('path');
const { ContainerTokenManager } = require('../../dist/auth');
const { RequestWrapper } = require('../../dist/lib/request-wrapper');
const logger = require('../../dist/lib/logger').default;

// make sure no actual requests are sent
jest.mock('../../dist/lib/request-wrapper');
const sendRequestMock = jest.fn();
RequestWrapper.mockImplementation(() => ({
  sendRequest: sendRequestMock,
}));

const CR_TOKEN_FILENAME = '/path/to/file';
const IAM_PROFILE_NAME = 'some-name';
const IAM_PROFILE_ID = 'some-id';

describe('Container Token Manager', () => {
  afterAll(() => {
    sendRequestMock.mockRestore();
  });

  describe('constructor', () => {
    it('should throw an error neither `iamProfileId` nor `iamProfileName` are not provided', () => {
      expect(() => new ContainerTokenManager()).toThrow(
        'At least one of `iamProfileName` or `iamProfileId` must be specified.'
      );
    });

    // use default filename
    it('should use default filename if none is given', () => {
      const instance = new ContainerTokenManager({ iamProfileName: IAM_PROFILE_NAME });
      expect(instance.crTokenFilename).toBe('/var/run/secrets/tokens/vault-token');
    });

    it('should set given values', () => {
      const instance = new ContainerTokenManager({
        crTokenFilename: CR_TOKEN_FILENAME,
        iamProfileName: IAM_PROFILE_NAME,
        iamProfileId: IAM_PROFILE_ID,
      });

      expect(instance.crTokenFilename).toBe(CR_TOKEN_FILENAME);
      expect(instance.iamProfileName).toBe(IAM_PROFILE_NAME);
      expect(instance.iamProfileId).toBe(IAM_PROFILE_ID);
    });

    it('should initialize form data', () => {
      const instance = new ContainerTokenManager({ iamProfileName: IAM_PROFILE_NAME });

      const { formData } = instance;
      expect(formData).toBeDefined();
      expect(formData.grant_type).toBe('urn:ibm:params:oauth:grant-type:cr-token');
    });
  });

  describe('setters', () => {
    it('should set crTokenFilename with the setter', () => {
      const instance = new ContainerTokenManager({ iamProfileName: IAM_PROFILE_NAME });
      expect(instance.crTokenFilename).toBe('/var/run/secrets/tokens/vault-token');

      instance.setCrTokenFilename(CR_TOKEN_FILENAME);
      expect(instance.crTokenFilename).toBe(CR_TOKEN_FILENAME);
    });

    it('should set iamProfileName with the setter', () => {
      const instance = new ContainerTokenManager({ iamProfileName: 'test' });
      expect(instance.iamProfileName).toBe('test');
      expect(instance.iamProfileName).not.toBe(IAM_PROFILE_NAME);

      instance.setIamProfileName(IAM_PROFILE_NAME);
      expect(instance.iamProfileName).toBe(IAM_PROFILE_NAME);
    });

    it('should set iamProfileId with the setter', () => {
      const instance = new ContainerTokenManager({ iamProfileName: IAM_PROFILE_NAME });
      expect(instance.iamProfileId).toBeUndefined();

      instance.setIamProfileId(IAM_PROFILE_ID);
      expect(instance.iamProfileId).toBe(IAM_PROFILE_ID);
    });
  });

  describe('requestToken', () => {
    const pathToTestToken = path.join(__dirname, '/../resources/vault-token');

    it('should add all form data, including the cr token read from a file', async () => {
      jest.spyOn(logger, 'debug').mockImplementation(() => {});

      const instance = new ContainerTokenManager({
        crTokenFilename: pathToTestToken,
        iamProfileName: IAM_PROFILE_NAME,
      });

      await instance.requestToken();

      expect(instance.formData.profile_name).toBe(IAM_PROFILE_NAME);
      expect(instance.formData.profile_id).toBeUndefined(); // should not be set if not present
      expect(instance.formData.cr_token).toBe('my-cr-token-123');

      // expect file reading utils and logger to both be called
      expect(logger.debug).toHaveBeenCalledWith(
        `Attempting to read CR token from file: ${pathToTestToken}`
      );
    });

    it('should not add iamProfileName to form data if not set', async () => {
      // the inverse of this test is tested above
      const firstValue = 'test';

      const instance = new ContainerTokenManager({
        crTokenFilename: pathToTestToken,
        iamProfileId: firstValue,
      });

      // verify that form data is set from constructor or setters
      instance.setIamProfileId(IAM_PROFILE_ID);

      await instance.requestToken();

      expect(instance.formData.profile_name).toBeUndefined();
      expect(instance.formData.profile_id).toBe(IAM_PROFILE_ID);
      expect(instance.formData.profile_id).not.toBe(firstValue);
    });
  });
});
