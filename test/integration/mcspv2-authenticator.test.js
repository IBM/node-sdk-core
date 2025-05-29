/**
 * Copyright 2025 IBM Corp. All Rights Reserved.
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
const { McspV2Authenticator } = require('../../dist/auth');

// Note: Only the unit tests are run by default.
//
// In order to test with a live token server, create file "mcspv2test.env" in the project root.
// It should look like this:
//
// required properties:
//
//	MCSPV2TEST1_AUTH_URL=<url>   e.g. https://account-iam.platform.dev.saas.ibm.com
//	MCSPV2TEST1_AUTH_TYPE=mcspv2
//	MCSPV2TEST1_APIKEY=<apikey>
//	MCSPV2TEST1_SCOPE_COLLECTION_TYPE=accounts  (use any valid collection type value)
//	MCSPV2TEST1_SCOPE_ID=global_account         (use any valid scope id)
//
// optional properties:
//
//	MCSPV2TEST1_INCLUDE_BUILTIN_ACTIONS=true|false
//	MCSPV2TEST1_INCLUDE_CUSTOM_ACTIONS=true|false
//	MCSPV2TEST1_INCLUDE_ROLES=true|false
//	MCSPV2TEST1_PREFIX_ROLES=true|false
//	MCSPV2TEST1_CALLER_EXT_CLAIM={"productID":"prod123"}
//
//
// Then run this command from the project root:
// npm run jest test/integration/mcspv2-authenticator.test.js

describe('MCSP V2 Authenticator - Integration Test', () => {
  process.env.IBM_CREDENTIALS_FILE = `${__dirname}/../../mcspv2test.env`;

  it('should retrieve an MCSP access token successfully', async () => {
    // set up environment
    const authenticator = getAuthenticatorFromEnvironment('mcspv2test1');

    // build a mock request
    const requestOptions = {};

    // authenticate the request
    await authenticator.authenticate(requestOptions);

    // check for proper authentication
    expect(requestOptions.headers.Authorization).toBeDefined();
    expect(requestOptions.headers.Authorization.startsWith('Bearer')).toBe(true);
  });
});
