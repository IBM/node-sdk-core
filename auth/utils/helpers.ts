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

import { getMissingParams } from '../../lib/helper';

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

// returns true if the string has a curly bracket or quote as the first or last character
// these are common user-issues that we should handle before they get a network error
function badCharAtAnEnd(value: string): boolean {
  return (
    value.startsWith('{') || value.startsWith('"') || value.endsWith('}') || value.endsWith('"')
  );
}

/**
 * Checks credentials for common user mistakes of copying {, }, or " characters from the documentation
 *
 * @param {object} obj - The options object holding credentials
 * @param {string[]} credsToCheck - An array containing the keys of the credentials to check for problems
 * @returns {string | null} - Returns a string with the error message if there were problems, null if not
 */
export function checkCredentials(obj: any, credsToCheck: string[]): Error | null {
  let errorMessage = '';
  credsToCheck.forEach((cred) => {
    if (obj[cred] && badCharAtAnEnd(obj[cred])) {
      errorMessage += `The ${cred} shouldn't start or end with curly brackets or quotes. Be sure to remove any {, }, or "`;
    }
  });

  if (errorMessage.length) {
    errorMessage +=
      'Revise these credentials - they should not start or end with curly brackets or quotes.';
    return new Error(errorMessage);
  }
  return null;
}

/**
 * @param {object} options - A configuration options object.
 * @param {string[]} requiredOptions - The list of properties that must be specified.
 */
export function validateInput(options: any, requiredOptions: string[]): void {
  // check for required params
  const missingParamsError = getMissingParams(options, requiredOptions);
  if (missingParamsError) {
    throw missingParamsError;
  }

  // check certain credentials for common user errors: username, password, and apikey
  // note: will only apply to certain authenticators
  const credsToCheck = ['username', 'password', 'apikey'];
  const credentialProblems = checkCredentials(options, credsToCheck);
  if (credentialProblems) {
    throw credentialProblems;
  }
}

/**
 * Get the current time
 *
 * @returns {number} - Returns the current time in seconds.
 */
export function getCurrentTime(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Check for only one of two elements being defined.
 * Returns true if a is defined and b is undefined,
 * or vice versa. Returns false if both are defined
 * or both are undefined.
 *
 * @param {any} a - The first object
 * @param {any} b - The second object
 * @returns {boolean}
 */
export function onlyOne(a: any, b: any): boolean {
  return Boolean((a && !b) || (b && !a));
}

/**
 * Remove a given suffix if it exists.
 *
 * @param {string} str - The base string to operate on
 * @param {string} suffix - The suffix to remove, if present
 * @returns {string}
 */
export function removeSuffix(str: string, suffix: string): string {
  if (str.endsWith(suffix)) {
    str = str.substring(0, str.lastIndexOf(suffix));
  }

  return str;
}
