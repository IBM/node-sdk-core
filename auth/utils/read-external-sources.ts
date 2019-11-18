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
import logger from '../../lib/logger';
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
 * The function will first look for a service entry whose "name" field matches
 * the serviceKey value. If found, return its credentials.
 *
 * If no match against the service entry's "name" field is found, then find the
 * service list with a key matching the serviceKey value. If found, return the
 * credentials of the first service in the service list.
 */
function getVCAPCredentialsForService(name) {
  if (process.env.VCAP_SERVICES) {
    const services = JSON.parse(process.env.VCAP_SERVICES);
    for (const serviceName of Object.keys(services)) {
      for (const instance of services[serviceName]) {
        if (instance['name'] === name) {
          if (instance.hasOwnProperty('credentials')) {
            return instance.credentials
          } else {
            logger.debug('no data read from VCAP_SERVICES')
            return {}
          }
        }
      }
    }
    for (const serviceName of Object.keys(services)) {
      if (serviceName === name) {
        if (services[serviceName].length > 0) {
          if (services[serviceName][0].hasOwnProperty('credentials')) {
            return services[serviceName][0].credentials
          } else {
            logger.debug('no data read from VCAP_SERVICES')
            return {}
          }
          return services[serviceName][0].credentials || {};
        } else {
          logger.debug('no data read from VCAP_SERVICES')
          return {}
        }
      }
    }
  }
  logger.debug('no data read from VCAP_SERVICES')
  return {};
}

function getPropertiesFromVCAP(serviceName: string): any {
  const credentials = getVCAPCredentialsForService(serviceName);
  // infer authentication type from credentials in a simple manner
  // iam is used as the default later
  if (credentials.username || credentials.password) {
    credentials.authType = 'basic';
  }
  return credentials;
}