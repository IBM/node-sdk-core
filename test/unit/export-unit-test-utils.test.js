'use strict';

const { SdkUnitTestUtilities } = require('../../dist');

describe('Unit Test Utils', () => {
  const utils = new SdkUnitTestUtilities({ expect });

  it('should have function checkUrlAndMethod', () => {
    expect(utils.checkUrlAndMethod).toBeDefined();
  });

  it('should have function checkMediaHeaders', () => {
    expect(utils.checkMediaHeaders).toBeDefined();
  });

  it('should have function checkUserHeader', () => {
    expect(utils.checkUserHeader).toBeDefined();
  });

  it('should have function checkForSuccessfulExecution', () => {
    expect(utils.checkForSuccessfulExecution).toBeDefined();
  });

  it('should have function getOptions', () => {
    expect(utils.getOptions).toBeDefined();
  });

  it('should have function expectToBePromise', () => {
    expect(utils.expectToBePromise).toBeDefined();
  });
});
