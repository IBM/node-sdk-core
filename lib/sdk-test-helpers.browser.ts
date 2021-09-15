/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Copyright 2021 IBM Corp. All Rights Reserved.
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

// Dummy for browser
export function checkUrlAndMethod(options, url: string, method: any) {}

export function checkMediaHeaders(createRequestMock, accept: string, contentType: string) {}

export function checkUserHeader(
  createRequestMock,
  userHeaderName: string,
  userHeaderValue: string
) {}

export function checkForSuccessfulExecution(createRequestMock) {}

export function getOptions(createRequestMock) {}

export function expectToBePromise(sdkPromise) {}
