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

// a function to pull the arguments out of the `sendRequest` mock
// and verify the structure looks like it is supposed to
function getRequestOptions(sendRequestMock, requestIndex = 0) {
  const sendRequestArgs = sendRequestMock.mock.calls[requestIndex][0];
  expect(sendRequestArgs).toBeDefined();
  expect(sendRequestArgs.options).toBeDefined();

  return sendRequestArgs.options;
}

module.exports = { getRequestOptions };
