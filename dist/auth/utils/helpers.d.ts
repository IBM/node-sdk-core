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
export declare function computeBasicAuthHeader(username: string, password: string): string;
/**
 * Checks credentials for common user mistakes of copying {, }, or " characters from the documentation
 *
 * @param {object} obj - The options object holding credentials
 * @param {string[]} credsToCheck - An array containing the keys of the credentials to check for problems
 * @returns {string | null} - Returns a string with the error message if there were problems, null if not
 */
export declare function checkCredentials(obj: any, credsToCheck: string[]): Error | null;
/**
 * @param {object} options - A configuration options object.
 * @param {string[]} requiredOptions - The list of properties that must be specified.
 */
export declare function validateInput(options: any, requiredOptions: string[]): void;
/**
 * Get the current time
 *
 * @returns {number} - Returns the current time in seconds.
 */
export declare function getCurrentTime(): number;
