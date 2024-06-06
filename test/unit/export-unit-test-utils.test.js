/**
 * (C) Copyright IBM Corp. 2020, 2024.
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

const unitTestUtils = require('../../sdk-test-utilities');

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
