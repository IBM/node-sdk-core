/**
 * (C) Copyright IBM Corp. 2019, 2021.
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

import { Stream } from 'stream';

/**
 * Helper method that can be bound to a stream - it sets the output to utf-8, captures all of the results, and returns a promise that resolves to the final text
 * Essentially a smaller version of concat-stream wrapped in a promise
 *
 * @param {Stream} stream Optional stream param for when not bound to an existing stream instance.
 * @return {Promise}
 */
export function streamToPromise(stream: Stream): Promise<any> {
  stream = stream || this;
  return new Promise((resolve, reject) => {
    const results = [];
    stream
      .on('data', (result) => {
        results.push(result);
      })
      .on('end', () => {
        resolve(Buffer.isBuffer(results[0]) ? Buffer.concat(results).toString() : results);
      })
      .on('error', reject);
  });
}
