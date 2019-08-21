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
import extend = require('extend');

import {
  BasicAuthenticator,
  BearerTokenAuthenticator,
  CloudPakForDataAuthenticator,
  IamAuthenticator,
  NoauthAuthenticator,
} from '../authenticators';

import { readExternalSources } from './read-external-sources';

export function getAuthenticatorFromEnvironment(serviceName: string) {
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

  // create and return the appropriate authenticator
  let authenticator;

  switch (credentials.authType) {
    case 'noauth':
      authenticator = new NoauthAuthenticator();
      break;
    case 'basic':
      authenticator = new BasicAuthenticator(credentials);
      break;
    case 'bearerToken':
      authenticator = new BearerTokenAuthenticator(credentials);
      break;
    case 'cp4d':
      authenticator = new CloudPakForDataAuthenticator(credentials);
      break;
    default: // default the authentication type to iam
      authenticator = new IamAuthenticator(credentials);
  }

  return authenticator;
}
