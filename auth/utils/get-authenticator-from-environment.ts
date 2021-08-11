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

import {
  Authenticator,
  BasicAuthenticator,
  BearerTokenAuthenticator,
  CloudPakForDataAuthenticator,
  IamAuthenticator,
  ContainerAuthenticator,
  NoAuthAuthenticator,
} from '../authenticators';

import { readExternalSources } from './read-external-sources';

/**
 * Look for external configuration of authenticator.
 *
 * Try to get authenticator from external sources, with the following priority:
 * 1. Credentials file (ibm-credentials.env)
 * 2. Environment variables
 * 3. VCAP Services (Cloud Foundry)
 *
 * @param {string} serviceName The service name prefix.
 *
 */
export function getAuthenticatorFromEnvironment(serviceName: string): Authenticator {
  if (!serviceName) {
    throw new Error('Service name is required.');
  }

  // construct the credentials object from the environment
  const credentials = readExternalSources(serviceName);

  if (credentials === null) {
    throw new Error('Unable to create an authenticator from the environment.');
  }

  // remove client-level properties
  delete credentials.url;
  delete credentials.disableSsl;

  // convert "auth" properties to their proper keys
  if (credentials.authUrl) {
    credentials.url = credentials.authUrl;
    delete credentials.authUrl;
  }

  if (credentials.authDisableSsl) {
    credentials.disableSslVerification = credentials.authDisableSsl;
    delete credentials.authDisableSsl;
  }

  // in the situation where the auth type is not provided:
  // if an apikey is provided, default to IAM
  // if not, default to container auth
  let { authType } = credentials;

  if (!authType) {
    // Support the alternate "AUTHTYPE" config property.
    authType = credentials.authtype;
  }
  if (!authType || typeof authType !== 'string') {
    authType = credentials.apikey ? 'iam' : 'container';
  }

  // create and return the appropriate authenticator
  let authenticator;

  // fold authType to lower case for case insensitivity
  switch (authType.toLowerCase()) {
    case 'noauth':
      authenticator = new NoAuthAuthenticator();
      break;
    case 'basic':
      authenticator = new BasicAuthenticator(credentials);
      break;
    case 'bearertoken':
      authenticator = new BearerTokenAuthenticator(credentials);
      break;
    case 'cp4d':
      authenticator = new CloudPakForDataAuthenticator(credentials);
      break;
    case 'iam':
      authenticator = new IamAuthenticator(credentials);
      break;
    case 'container':
      authenticator = new ContainerAuthenticator(credentials);
      break;
    default:
      throw new Error(`Invalid value for AUTH_TYPE: ${authType}`);
  }

  return authenticator;
}
