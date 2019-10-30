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

import camelcase = require('camelcase');
import isEmpty = require('lodash.isempty');
import vcapServices = require('vcap_services');
import { readCredentialsFile } from './read-credentials-file';

/**
 * Read properties stored in external sources like Environment Variables,
 * the credentials file, VCAP services, etc. and return them as an
 * object. The keys of this object will have the service name prefix removed
 * and will be converted to lower camel case.
 *
 * Only one source will be used at a time.
 * @param {string} serviceName The service name prefix.
 */
export function readExternalSources(serviceName: string) {
  if (!serviceName) {
    throw new Error('Service name is required.');
  }

  return getProperties(serviceName);
}

function getProperties(serviceName: string): any {
  // Try to get properties from external sources, with the following priority:
  // 1. Credentials file (ibm-credentials.env)
  // 2. Environment variables
  // 3. VCAP Services (Cloud Foundry)

  // only get properties from one source, return null if none found
  let properties = null;

  properties = filterPropertiesByServiceName(readCredentialsFile(), serviceName);

  if (isEmpty(properties)) {
    properties = filterPropertiesByServiceName(process.env, serviceName);
  }

  if (isEmpty(properties)) {
    properties = getCredentialsFromCloud(serviceName);
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
function filterPropertiesByServiceName(envObj: any, serviceName: string): any {
  const credentials = {} as any;
  const name: string = serviceName.toUpperCase().replace(/-/g, '_') + '_'; // append the underscore that must follow the service name

  // filter out properties that don't begin with the service name
  Object.keys(envObj).forEach(key => {
    if (key.startsWith(name)) {
      const propName = camelcase(key.substring(name.length)); // remove the name from the front of the string and make camelcase
      credentials[propName] = envObj[key];
    }
  });

  // all env variables are parsed as strings, convert disable ssl vars to boolean
  if (typeof credentials.disableSsl === 'string') {
    credentials.disableSsl = credentials.disableSsl === 'true';
  }

  if (typeof credentials.authDisableSsl === 'string') {
    credentials.authDisableSsl = credentials.authDisableSsl === 'true';
  }

  return credentials;
}

/**
 * Pulls credentials from VCAP_SERVICES env property that IBM Cloud sets
 *
 */
function getCredentialsFromCloud(serviceName: string): any {
  const credentials = vcapServices.getCredentials(serviceName);
  // infer authentication type from credentials in a simple manner
  // iam is used as the default later
  if (credentials.username || credentials.password) {
    credentials.authType = 'basic';
  }
  return credentials;
}