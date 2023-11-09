/**
 * Copyright 2023 IBM Corp. All Rights Reserved.
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
// In order to test with a live MCSP server, create file "mcsptest.env" in the project root.
// It should look like this:
//
//	MCSPTEST_AUTH_URL=<url>   e.g. https://iam.platform.test.saas.ibm.com
//	MCSPTEST_AUTH_TYPE=mcsp
//	MCSPTEST_APIKEY=<apikey>
//
// Then run this command from the project root:
// npm run jest test/integration/mcsp-authenticator.test.js

describe('MCSP Authenticator - Integration Test', () => {
  process.env.IBM_CREDENTIALS_FILE = `${__dirname}/../../mcsptest.env`;

  it('should retrieve an MCSP access token successfully', async () => {
    // set up environment
    const authenticator = getAuthenticatorFromEnvironment('mcsptest1');

    // build a mock request
    const requestOptions = {};

    // authenticate the request
    await authenticator.authenticate(requestOptions);

    // check for proper authentication
    expect(requestOptions.headers.Authorization).toBeDefined();
    expect(requestOptions.headers.Authorization.startsWith('Bearer')).toBe(true);
  });
});
