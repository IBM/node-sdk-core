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

const { redactSecrets } = require('../../dist/lib/private-helpers');

describe('redactSecrets()', () => {
  it('misc. tests', async () => {
    const inputStrings = [
      'Authorization: Bearer secret',
      'Authorization: secret\nX-Author: secret',
      'apikey=81KiI5Zm2kjOWnrSglhtnDJn3u0kfv&grant_type=apikey&response_type=cloud_iam',
      `{"apikey":"secret"}`,
      'apikey=secret&project_id=secret&api_key=secret&passcode=secret&password=secret&token=secret&response_type=not_a_secret',
      '{"aadClientId":"secret", "auth":"secret", "key":"secret", "secret":"foo", "token_uri":"secret", "client_id":"secret", "tenantId":"secret"}',
    ];
    const outputStrings = [
      'Authorization: [redacted]',
      'Authorization: [redacted]\nX-Author: [redacted]',
      'apikey=[redacted]&grant_type=apikey&response_type=cloud_iam',
      `{"apikey":"[redacted]"}`,
      'apikey=[redacted]&project_id=[redacted]&api_key=[redacted]&passcode=[redacted]&password=[redacted]&token=[redacted]&response_type=not_a_secret',
      '{"aadClientId":"[redacted]", "auth":"[redacted]", "key":"[redacted]", "secret":"[redacted]", "token_uri":"[redacted]", "client_id":"[redacted]", "tenantId":"[redacted]"}',
    ];

    for (let i = 0; i < inputStrings.length; i++) {
      expect(redactSecrets(inputStrings[i])).toBe(outputStrings[i]);
    }
  });
  it('test debug output', async () => {
    const input = `
POST https://iam.cloud.ibm.com/identity/token
Accept: application/json, text/plain, */*
Content-Type: application/x-www-form-urlencoded
Authorization: Bearer secret
User-Agent: ibm-node-sdk-core/iam-authenticator-5.0.1 os.name=linux os.version=6.10.5-100.fc39.x86_64 node.version=v20.12.2
apikey=secret&grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&response_type=cloud_iam
transaction-id: cXpoZmY-262c12615bae4b6e92d10faf37033ad4
content-type: application/json
content-language: en-US
strict-transport-security: max-age=31536000; includeSubDomains
vary: Accept-Encoding
content-length: 986
connection: keep-alive
{"access_token":"secret","refresh_token":"secret","token_type":"Bearer","expires_in":3600,"expiration":1724788046,"scope":"ibm openid"}
`;

    const output = `
POST https://iam.cloud.ibm.com/identity/token
Accept: application/json, text/plain, */*
Content-Type: application/x-www-form-urlencoded
Authorization: [redacted]
User-Agent: ibm-node-sdk-core/iam-authenticator-5.0.1 os.name=linux os.version=6.10.5-100.fc39.x86_64 node.version=v20.12.2
apikey=[redacted]&grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&response_type=cloud_iam
transaction-id: cXpoZmY-262c12615bae4b6e92d10faf37033ad4
content-type: application/json
content-language: en-US
strict-transport-security: max-age=31536000; includeSubDomains
vary: Accept-Encoding
content-length: 986
connection: keep-alive
{"access_token":"[redacted]","refresh_token":"[redacted]","token_type":"Bearer","expires_in":3600,"expiration":1724788046,"scope":"ibm openid"}
`;

    expect(redactSecrets(input)).toBe(output);
  });
});
