/**
 * Copyright 2021 IBM Corp. All Rights Reserved.
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
// In order to test with a live CP4D server, rename "cp4dtest.env.example" to
// "cp4dtest.env" in the test/resources folder and populate the fields.
// Then run this command:
// npm run jest -- test/integration/cp4d-authenticator.test.js

describe('CP4D Authenticator - Integration Test', () => {
  process.env.IBM_CREDENTIALS_FILE = `${__dirname}/../resources/cp4dtest.env`;

  it('should retrieve a live access token with username/password', async () => {
    // set up environment
    const authenticator = getAuthenticatorFromEnvironment('cp4d-password-test');

    // build a mock request
    const requestOptions = {};

    // authenticate the request
    await authenticator.authenticate(requestOptions);

    // check for proper authentication
    expect(requestOptions.headers.Authorization).toBeDefined();
    expect(requestOptions.headers.Authorization.startsWith('Bearer')).toBe(true);
  });

  it('should retrieve a live access token with username/apikey', async () => {
    // set up environment
    const authenticator = getAuthenticatorFromEnvironment('cp4d-apikey-test');

    // build a mock request
    const requestOptions = {};

    // authenticate the request
    await authenticator.authenticate(requestOptions);

    // check for proper authentication
    expect(requestOptions.headers.Authorization).toBeDefined();
    expect(requestOptions.headers.Authorization.startsWith('Bearer')).toBe(true);
  });
});
