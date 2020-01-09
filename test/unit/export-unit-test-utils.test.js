'use strict';

const { unitTestUtils } = require('../../dist');

describe('Unit Test Utils', () => {
  it('should be defined', () => {
    expect(unitTestUtils).toBeDefined();
  });

  it('should have function checkUrlAndMethod', () => {
		expect(unitTestUtils.checkUrlAndMethod).toBeDefined();
  });

	it('should have function checkMediaHeaders', () => {
		expect(unitTestUtils.checkMediaHeaders).toBeDefined();
  });

	it('should have function checkUserHeader', () => {
		expect(unitTestUtils.checkUserHeader).toBeDefined();
	});

	it('should have function checkForSuccessfulExecution', () => {
		expect(unitTestUtils.checkForSuccessfulExecution).toBeDefined();
	});

	it('should have function getOptions', () => {
		expect(unitTestUtils.getOptions).toBeDefined();
	});

	it('should have function expectToBePromise', () => {
		expect(unitTestUtils.expectToBePromise).toBeDefined();
	});
});
