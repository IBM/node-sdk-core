/**
 * Copyright 2019 IBM Corp. All Rights Reserved.
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

/**
 * Compute and return a Basic Authorization header from a username and password.
 *
 * @param {string} username - The username or client id
 * @param {string} password - The password or client secret
 * @returns {string} - A Basic Auth header with format "Basic <encoded-credentials>"
 */
export function computeBasicAuthHeader(username: string, password: string): string {
  const encodedCreds = Buffer.from(`${username}:${password}`).toString('base64');
  return `Basic ${encodedCreds}`;
}
