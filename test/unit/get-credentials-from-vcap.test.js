/**
 * (C) Copyright IBM Corp. 2019, 2021.
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

const fs = require('fs');
const { readExternalSources } = require('../../dist/auth');

describe('getCredentialsFromVcap', () => {
  beforeAll(() => {
    process.env.VCAP_SERVICES = fs.readFileSync(`${__dirname}/../resources/vcap.json`);
  });

  it('should return empty credential object when service key is empty_service', () => {
    const credentials = readExternalSources('empty_service');
    expect(credentials).toBeDefined();
    expect(Object.keys(credentials)).toHaveLength(0);
  });

  it('should return credential object matching service name field is not first list element', () => {
    const credentials = readExternalSources('discovery2');
    expect(credentials.url).toEqual(
      'https://gateway.watsonplatform2.net/discovery-experimental/api'
    );
    expect(credentials.username).toEqual('not-a-username');
    expect(credentials.password).toEqual('not-a-password');
  });

  it('should return credential object when matching service name field on first list element', () => {
    const credentials = readExternalSources('discovery1');
    expect(credentials.url).toEqual(
      'https://gateway.watsonplatform1.net/discovery-experimental/api'
    );
    expect(credentials.username).toEqual('not-a-username');
    expect(credentials.password).toEqual('not-a-password');
  });

  it('should return first service in the list matching on primary service key', () => {
    const credentials = readExternalSources('discovery');
    expect(credentials.url).toEqual(
      'https://gateway.watsonplatform1.net/discovery-experimental/api'
    );
    expect(credentials.username).toEqual('not-a-username');
    expect(credentials.password).toEqual('not-a-password');
  });

  it('should return empty credential object when matching on service name with no credentials field', () => {
    const credentials = readExternalSources('no-creds-service-two');
    expect(credentials).toBeDefined();
    expect(Object.keys(credentials)).toHaveLength(0);
  });
});
