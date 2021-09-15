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

const { BasicAuthenticator } = require('../../dist/auth');

const USERNAME = 'dave';
const PASSWORD = 'grohl';
const CONFIG = {
  username: USERNAME,
  password: PASSWORD,
};

describe('Basic Authenticator', () => {
  it('should store the username and password on the class', () => {
    const authenticator = new BasicAuthenticator(CONFIG);
    expect(authenticator.authHeader).toEqual({
      Authorization: 'Basic ZGF2ZTpncm9obA==',
    });
  });

  it('should throw an error when username is not provided', () => {
    expect(() => {
      const unused = new BasicAuthenticator({ password: PASSWORD });
    }).toThrow();
  });

  it('should throw an error when password is not provided', () => {
    expect(() => {
      const unused = new BasicAuthenticator({ username: USERNAME });
    }).toThrow();
  });

  it('should throw an error when username has a bad character', () => {
    expect(() => {
      const unused = new BasicAuthenticator({ username: '"<your-username>"', password: PASSWORD });
    }).toThrow(/Revise these credentials/);
  });

  it('should throw an error when password has a bad character', () => {
    expect(() => {
      const unused = new BasicAuthenticator({ username: USERNAME, password: '{some-password}' });
    }).toThrow(/Revise these credentials/);
  });

  it('should update the options and resolve the Promise with `null`', async (done) => {
    const authenticator = new BasicAuthenticator(CONFIG);
    const options = {};
    const result = await authenticator.authenticate(options);

    expect(result).toBeUndefined();
    expect(options.headers.Authorization).toBe('Basic ZGF2ZTpncm9obA==');
    done();
  });
});
