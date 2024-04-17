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

const os = require('os');
const { version } = require('../package.json');

/**
 * Returns a string suitable as a value for the User-Agent header
 * @param componentName optional name of a component to be included in the returned string
 * @returns the user agent header value
 */
export function buildUserAgent(componentName: string = null): string {
  const subComponent = componentName ? `/${componentName}` : '';
  const userAgent = `ibm-node-sdk-core${subComponent}-${version} os.name=${os.platform()} os.version=${os.release()} node.version=${
    process.version
  }`;
  return userAgent;
}
