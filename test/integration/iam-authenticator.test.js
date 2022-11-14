/**
 * Copyright 2022 IBM Corp. All Rights Reserved.
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

const { getAuthenticatorFromEnvironment } = require('../../dist');

// Note: Only the unit tests are run by default.
//
// In order to test with a live IAM server, create file "iamtest.env" in the project root.
// It should look like this:
//
//	IAMTEST_AUTH_URL=<url>   e.g. https://iam.cloud.ibm.com
//	IAMTEST_AUTH_TYPE=iam
//	IAMTEST_APIKEY=<apikey>
//
// Then run this command from the project root:
// jest test/integration/iam-authenticator.test.js

describe('IAM Authenticator - Integration Test', () => {
  process.env.IBM_CREDENTIALS_FILE = `${__dirname}/../../iamtest.env`;

  it('should retrieve an IAM access successfully', async () => {
    // set up environment
    const authenticator = getAuthenticatorFromEnvironment('iamtest');

    // build a mock request
    const requestOptions = {};

    // authenticate the request
    await authenticator.authenticate(requestOptions);

    // check for proper authentication
    expect(requestOptions.headers.Authorization).toBeDefined();
    expect(requestOptions.headers.Authorization.startsWith('Bearer')).toBe(true);
  });
});
