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

  it('multiline: rePropertySetting', () => {
    // Secret keyword=value at end of line must not bleed into the next line.
    let result = redactSecrets('password=secret\nnextline');
    expect(result).not.toContain('secret');
    expect(result).toContain('nextline');

    // Two secret pairs on consecutive lines — each is independently redacted.
    result = redactSecrets('password=secret1\ntoken=secret2\nsafe=safe2');
    expect(result).not.toContain('secret1');
    expect(result).not.toContain('secret2');
    expect(result).toContain('safe=safe2');

    // Non-secret key on the line before a secret key — must not be touched.
    result = redactSecrets('username=alice\npassword=hunter2');
    expect(result).toContain('username=alice');
    expect(result).not.toContain('hunter2');

    // Secret key embedded in a query string: value stops at & and the rest is kept.
    result = redactSecrets('password=secret&other=kept');
    expect(result).not.toContain('secret');
    expect(result).toContain('other=kept');

    // Multiple secret keys in one query string on a single line.
    result = redactSecrets('apikey=k1&password=p2&token=t3');
    expect(result).not.toContain('k1');
    expect(result).not.toContain('p2');
    expect(result).not.toContain('t3');

    // Non-secret key: must be left untouched.
    result = redactSecrets('username=alice');
    expect(result).toContain('username=alice');

    // Secret keyword=value preceded by unrelated text on the same line.
    result = redactSecrets('grant_type=urn:ietf:params:oauth:grant-type:iam-authz&apikey=mysecret');
    expect(result).not.toContain('mysecret');
    expect(result).toContain('grant_type=urn');
  });

  it('multiline: reJsonField', () => {
    // Secret JSON field at end of line must not consume the next line.
    let result = redactSecrets('"project_id": "secret"\n"other": "value"');
    expect(result).not.toContain('secret');
    expect(result).toContain('"other": "value"');

    // Two secret JSON fields on consecutive lines — each redacted independently.
    result = redactSecrets(
      '{\n  "project_id": "secret1",\n  "key": "secret2",\n  "name": "alice"\n}'
    );
    expect(result).not.toContain('secret1');
    expect(result).not.toContain('secret2');
    expect(result).toContain('"name": "alice"');

    // Non-secret JSON field on the line before a secret field — must be preserved.
    result = redactSecrets('"username": "alice"\n"project_id": "abc123"');
    expect(result).toContain('"username": "alice"');
    expect(result).not.toContain('abc123');

    // Non-secret JSON field on the line after a secret field — must be preserved.
    result = redactSecrets('"project_id": "abc123"\n"username": "alice"');
    expect(result).not.toContain('abc123');
    expect(result).toContain('"username": "alice"');

    // Secret JSON field with surrounding non-secret fields on the same line.
    result = redactSecrets('{"name": "alice", "project_id": "abc123", "role": "admin"}');
    expect(result).not.toContain('abc123');
    expect(result).toContain('"name": "alice"');
    expect(result).toContain('"role": "admin"');
  });

  it('multiline: reAuthHeader', () => {
    // Authorization header at EOL must not consume the line that follows.
    let result = redactSecrets('Authorization: Bearer tok\nContent-Type: application/json');
    expect(result).not.toContain('tok');
    expect(result).toContain('Content-Type: application/json');

    // Two auth headers on consecutive lines — each redacted, body line preserved.
    result = redactSecrets('Authorization: Bearer tok1\nX-Auth-Token: tok2\nbody');
    expect(result).not.toContain('tok1');
    expect(result).not.toContain('tok2');
    expect(result).toContain('body');
  });
});
