/**
 * (C) Copyright IBM Corp. 2024.
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
// In order to test with a live IAM server, create file "iamassume.env" in the project root.
// It should look something like this:
//
//  ASSUMETEST_AUTH_URL=<url>   e.g. https://iam.cloud.ibm.com
//  ASSUMETEST_AUTH_TYPE=iamAssume
//  ASSUMETEST_APIKEY=<apikey>
//  ASSUMETEST_IAM_PROFILE_ID=<profile-id>
//
// Then run this command from the project root:
// npm run jest test/integration/iam-assume-authenticator.test.js

describe('IAM Assume Authenticator - Integration Test', () => {
  process.env.IBM_CREDENTIALS_FILE = `${__dirname}/../../iamassume.env`;

  it('should retrieve an IAM access token successfully', async () => {
    // Set up environment.
    const authenticator = getAuthenticatorFromEnvironment('assumetest');

    // Build a mock request.
    const requestOptions = {};

    // Authenticate the request.
    await authenticator.authenticate(requestOptions);

    // Check for proper authentication.
    expect(requestOptions.headers.Authorization).toBeDefined();
    expect(requestOptions.headers.Authorization.startsWith('Bearer')).toBe(true);
  });
});
