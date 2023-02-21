/**
 * (C) Copyright IBM Corp. 2023.
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

const { isJsonMimeType } = require('../../dist/lib/helper');
const logger = require('../../dist/lib/logger').default;

const debugLogSpy = jest.spyOn(logger, 'debug').mockImplementation(() => {});

describe('isJsonMimeType()', () => {
  afterEach(() => {
    debugLogSpy.mockClear();
  });

  it('should return `false` for `undefined`', async () => {
    expect(isJsonMimeType(undefined)).toBe(false);
    expect(debugLogSpy.mock.calls[0][0]).toBe(
      "Determining if the mime type 'undefined' specifies JSON content."
    );
  });

  it('should return `false` for `null`', async () => {
    expect(isJsonMimeType(null)).toBe(false);
    expect(debugLogSpy.mock.calls[0][0]).toBe(
      "Determining if the mime type 'null' specifies JSON content."
    );
  });

  it('should return `false` for empty-string', async () => {
    expect(isJsonMimeType('')).toBe(false);
    expect(debugLogSpy.mock.calls[0][0]).toBe(
      "Determining if the mime type '' specifies JSON content."
    );
  });

  it('should return `false` for non-JSON mimetype', async () => {
    expect(isJsonMimeType('application/octect-stream')).toBe(false);
    expect(isJsonMimeType('text/plain')).toBe(false);
    expect(isJsonMimeType('multipart/form-data; charset=utf-8')).toBe(false);
    expect(debugLogSpy.mock.calls[0][0]).toBe(
      "Determining if the mime type 'application/octect-stream' specifies JSON content."
    );
    expect(debugLogSpy.mock.calls[1][0]).toBe(
      "Determining if the mime type 'text/plain' specifies JSON content."
    );
    expect(debugLogSpy.mock.calls[2][0]).toBe(
      "Determining if the mime type 'multipart/form-data; charset=utf-8' specifies JSON content."
    );
  });

  it('should return `true` for a JSON mimetype', async () => {
    expect(isJsonMimeType('application/json')).toBe(true);
    expect(isJsonMimeType('application/json;charset=utf-8')).toBe(true);
    expect(debugLogSpy.mock.calls[0][0]).toBe(
      "Determining if the mime type 'application/json' specifies JSON content."
    );
    expect(debugLogSpy.mock.calls[1][0]).toBe(
      "Determining if the mime type 'application/json;charset=utf-8' specifies JSON content."
    );
  });

  it('should return `true` for a JSON mimetype including optional whitespace', async () => {
    expect(isJsonMimeType('application/json  ; charset=utf-8')).toBe(true);
    expect(debugLogSpy.mock.calls[0][0]).toBe(
      "Determining if the mime type 'application/json  ; charset=utf-8' specifies JSON content."
    );
  });
});
