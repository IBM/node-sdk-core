"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var helper_1 = require("../../lib/helper");
/**
 * Compute and return a Basic Authorization header from a username and password.
 *
 * @param {string} username - The username or client id
 * @param {string} password - The password or client secret
 * @returns {string} - A Basic Auth header with format "Basic <encoded-credentials>"
 */
function computeBasicAuthHeader(username, password) {
    var encodedCreds = Buffer.from(username + ":" + password).toString('base64');
    return "Basic " + encodedCreds;
}
exports.computeBasicAuthHeader = computeBasicAuthHeader;
// returns true if the string has a curly bracket or quote as the first or last character
// these are common user-issues that we should handle before they get a network error
function badCharAtAnEnd(value) {
    return (value.startsWith('{') || value.startsWith('"') || value.endsWith('}') || value.endsWith('"'));
}
/**
 * Checks credentials for common user mistakes of copying {, }, or " characters from the documentation
 *
 * @param {object} obj - The options object holding credentials
 * @param {string[]} credsToCheck - An array containing the keys of the credentials to check for problems
 * @returns {string | null} - Returns a string with the error message if there were problems, null if not
 */
function checkCredentials(obj, credsToCheck) {
    var errorMessage = '';
    credsToCheck.forEach(function (cred) {
        if (obj[cred] && badCharAtAnEnd(obj[cred])) {
            errorMessage += "The " + cred + " shouldn't start or end with curly brackets or quotes. Be sure to remove any {, }, or \"";
        }
    });
    if (errorMessage.length) {
        errorMessage +=
            'Revise these credentials - they should not start or end with curly brackets or quotes.';
        return new Error(errorMessage);
    }
    return null;
}
exports.checkCredentials = checkCredentials;
/**
 * @param {object} options - A configuration options object.
 * @param {string[]} requiredOptions - The list of properties that must be specified.
 */
function validateInput(options, requiredOptions) {
    // check for required params
    var missingParamsError = helper_1.getMissingParams(options, requiredOptions);
    if (missingParamsError) {
        throw missingParamsError;
    }
    // check certain credentials for common user errors: username, password, and apikey
    // note: will only apply to certain authenticators
    var credsToCheck = ['username', 'password', 'apikey'];
    var credentialProblems = checkCredentials(options, credsToCheck);
    if (credentialProblems) {
        throw credentialProblems;
    }
}
exports.validateInput = validateInput;
/**
 * Get the current time
 *
 * @returns {number} - Returns the current time in seconds.
 */
function getCurrentTime() {
    return Math.floor(Date.now() / 1000);
}
exports.getCurrentTime = getCurrentTime;
