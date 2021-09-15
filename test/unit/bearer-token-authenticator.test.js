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

const { BearerTokenAuthenticator } = require('../../dist/auth');

describe('Bearer Token Authenticator', () => {
  const config = {
    bearerToken: 'thisisthetoken',
  };

  it('should store the bearer token on the class', () => {
    const authenticator = new BearerTokenAuthenticator(config);

    expect(authenticator.bearerToken).toBe(config.bearerToken);
  });

  it('should throw an error when bearer token is not provided', () => {
    expect(() => {
      const unused = new BearerTokenAuthenticator();
    }).toThrow();
  });

  it('should update the options and resolve with `null`', async (done) => {
    const authenticator = new BearerTokenAuthenticator(config);
    const options = {};
    const result = await authenticator.authenticate(options);

    expect(result).toBeUndefined();
    expect(options.headers.Authorization).toBe(`Bearer ${config.bearerToken}`);
    done();
  });

  it('should re-set the bearer token using the setter', () => {
    const authenticator = new BearerTokenAuthenticator(config);
    expect(authenticator.bearerToken).toBe(config.bearerToken);

    const newToken = 'updatedtoken';
    authenticator.setBearerToken(newToken);
    expect(authenticator.bearerToken).toBe(newToken);
  });
});
