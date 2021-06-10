"use strict";
/* eslint-disable no-restricted-syntax */
Object.defineProperty(exports, "__esModule", { value: true });
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
var camelcase = require("camelcase");
var isEmpty = require("lodash.isempty");
var logger_1 = require("../../lib/logger");
var read_credentials_file_1 = require("./read-credentials-file");
/**
 * Read properties stored in external sources like Environment Variables,
 * the credentials file, VCAP services, etc. and return them as an
 * object. The keys of this object will have the service name prefix removed
 * and will be converted to lower camel case.
 *
 * Only one source will be used at a time.
 * @param {string} serviceName The service name prefix.
 */
function readExternalSources(serviceName) {
    if (!serviceName) {
        throw new Error('Service name is required.');
    }
    return getProperties(serviceName);
}
exports.readExternalSources = readExternalSources;
function getProperties(serviceName) {
    // Try to get properties from external sources, with the following priority:
    // 1. Credentials file (ibm-credentials.env)
    // 2. Environment variables
    // 3. VCAP Services (Cloud Foundry)
    // only get properties from one source, return null if none found
    var properties = null;
    properties = filterPropertiesByServiceName(read_credentials_file_1.readCredentialsFile(), serviceName);
    if (isEmpty(properties)) {
        properties = filterPropertiesByServiceName(process.env, serviceName);
    }
    if (isEmpty(properties)) {
        properties = getPropertiesFromVCAP(serviceName);
    }
    return properties;
}
/**
 * Pulls credentials from env properties
 *
 * Property checked is uppercase service.name suffixed by _USERNAME and _PASSWORD
 *
 * For example, if service.name is speech_to_text,
 * env properties are SPEECH_TO_TEXT_USERNAME and SPEECH_TO_TEXT_PASSWORD
 *
 * @param {object} envObj - the object containing the credentials keyed by environment variables
 * @returns {Credentials}
 */
function filterPropertiesByServiceName(envObj, serviceName) {
    var credentials = {};
    var name = serviceName.toUpperCase().replace(/-/g, '_') + "_"; // append the underscore that must follow the service name
    // filter out properties that don't begin with the service name
    Object.keys(envObj).forEach(function (key) {
        if (key.startsWith(name)) {
            var propName = camelcase(key.substring(name.length)); // remove the name from the front of the string and make camelcase
            credentials[propName] = envObj[key];
        }
    });
    // all env variables are parsed as strings, convert boolean vars as needed
    if (typeof credentials.disableSsl === 'string') {
        credentials.disableSsl = credentials.disableSsl === 'true';
    }
    if (typeof credentials.authDisableSsl === 'string') {
        credentials.authDisableSsl = credentials.authDisableSsl === 'true';
    }
    if (typeof credentials.enableGzip === 'string') {
        credentials.enableGzip = credentials.enableGzip === 'true';
    }
    return credentials;
}
/**
 * Pulls credentials from VCAP_SERVICES env property that IBM Cloud sets
 *
 * The function will first look for a service entry whose "name" field matches
 * the serviceKey value. If found, return its credentials.
 *
 * If no match against the service entry's "name" field is found, then find the
 * service list with a key matching the serviceKey value. If found, return the
 * credentials of the first service in the service list.
 */
function getVCAPCredentialsForService(name) {
    if (process.env.VCAP_SERVICES) {
        var services = JSON.parse(process.env.VCAP_SERVICES);
        for (var _i = 0, _a = Object.keys(services); _i < _a.length; _i++) {
            var serviceName = _a[_i];
            for (var _b = 0, _c = services[serviceName]; _b < _c.length; _b++) {
                var instance = _c[_b];
                if (instance.name === name) {
                    if (Object.prototype.hasOwnProperty.call(instance, 'credentials')) {
                        return instance.credentials;
                    }
                    logger_1.default.debug('no data read from VCAP_SERVICES');
                    return {};
                }
            }
        }
        for (var _d = 0, _e = Object.keys(services); _d < _e.length; _d++) {
            var serviceName = _e[_d];
            if (serviceName === name) {
                if (services[serviceName].length > 0) {
                    if (Object.prototype.hasOwnProperty.call(services[serviceName][0], 'credentials')) {
                        return services[serviceName][0].credentials;
                    }
                    logger_1.default.debug('no data read from VCAP_SERVICES');
                    return {};
                }
                logger_1.default.debug('no data read from VCAP_SERVICES');
                return {};
            }
        }
    }
    logger_1.default.debug('no data read from VCAP_SERVICES');
    return {};
}
function getPropertiesFromVCAP(serviceName) {
    var credentials = getVCAPCredentialsForService(serviceName);
    // infer authentication type from credentials in a simple manner
    // iam is used as the default later
    if (credentials.username || credentials.password) {
        credentials.authType = 'basic';
    }
    return credentials;
}
