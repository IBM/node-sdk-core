/**
 * Copyright 2014 IBM Corp. All Rights Reserved.
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

import extend = require('extend');
import fileType = require('file-type');
import { isReadable } from 'isstream';
import { lookup } from 'mime-types';
import { basename } from 'path';

// exported interfaces
export interface FileObject {
  value: NodeJS.ReadableStream | Buffer | string;
  options?: FileOptions;
}

// internal interfaces
export interface FileOptions {
  filename?: string;
  contentType?: string;
}

export interface FileParamAttributes {
  data: NodeJS.ReadableStream | Buffer | FileObject;
  contentType: string;
  filename: string;
}

export interface FileStream extends NodeJS.ReadableStream {
  path: string | Buffer;
}

// custom type guards
export function isFileObject(obj: any): obj is FileObject {
  return Boolean(obj && obj.value);
}

function isFileStream(obj: any): obj is FileStream {
  return obj && isReadable(obj) && obj.path;
}

export function isFileParamAttributes(obj: any): obj is FileParamAttributes {
  return obj && obj.data &&
   (
     isReadable(obj.data) ||
     Buffer.isBuffer(obj.data) ||
     isFileObject(obj.data)
   );
}

export function isFileParam(obj: any): boolean {
  return Boolean(
    obj &&
    (
      isReadable(obj) ||
      Buffer.isBuffer(obj) ||
      isFileObject(obj) ||
      isFileParamAttributes(obj)
    )
  );
}

export function isEmptyObject(obj: any): boolean {
  return Boolean(
    obj && Object.keys(obj).length === 0 && obj.constructor === Object
  );
}

/**
 * This function retrieves the content type of the input.
 * @param {NodeJS.ReadableStream|Buffer|string} inputData - The data to retrieve content type for.
 * @returns {string} the content type of the input.
 */
export function getContentType(
  inputData: NodeJS.ReadableStream | Buffer | string
): string {
  let contentType = null;
  if (isFileStream(inputData)) {
    // if the inputData is a NodeJS.ReadableStream
    const mimeType = lookup(inputData.path);
    contentType = { mime: mimeType || null };
  } else if (Buffer.isBuffer(inputData)) {
    // if the inputData is a Buffer
    contentType = fileType(inputData);
  }

  return contentType ? contentType.mime : null;
}

/**
 *
 * @param {string} url - the url string.
 * @returns {string}
 */
export function stripTrailingSlash(url: string): string {
  // Match a forward slash / at the end of the string ($)
  return url.replace(/\/$/, '');
}

/**
 * Validates that all required params are provided
 * @param params - the method parameters.
 * @param requires - the required parameter names.
 * @returns {Error|null}
 */
export function getMissingParams(
  params: { [key: string]: any },
  requires: string[]
): null | Error {
  let missing;
  if (!requires) {
    return null;
  } else if (!params) {
    missing = requires;
  } else {
    missing = [];
    requires.forEach((require) => {
      if (!params[require]) {
        missing.push(require);
      }
    });
  }
  return missing.length > 0
    ? new Error('Missing required parameters: ' + missing.join(', '))
    : null;
}

/**
 * Return true if 'text' is html
 * @param  {string} text - The 'text' to analyze
 * @returns {boolean} true if 'text' has html tags
 */
export function isHTML(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text);
}

/**
 * Returns the first match from formats that is key the params map
 * otherwise null
 * @param  {Object} params - The parameters.
 * @param  {string[]} requires - The keys we want to check
 * @returns {string|null}
 */
export function getFormat(
  params: { [key: string]: any },
  formats: string[]
): string {
  if (!formats || !params) {
    return null;
  }
  for (const item of formats) {
    if (item in params) {
      return item;
    }
  }

  return null;
}

/**
 * this function builds a `form-data` object for each file parameter
 * @param {FileParamAttributes} fileParams - the file parameter attributes
 * @param {NodeJS.ReadableStream|Buffer|FileObject} fileParams.data - the data content of the file
 * @param (string) fileParams.filename - the filename of the file
 * @param {string} fileParams.contentType - the content type of the file
 * @returns {FileObject}
 */
export function buildRequestFileObject(
  fileParams: FileParamAttributes
): FileObject {
  // build filename
  let filename: string | Buffer;
  if (fileParams.filename) {
    // prioritize user-given filenames
    filename = fileParams.filename;
  } else if (
    isFileObject(fileParams.data) &&
    fileParams.data.options &&
    fileParams.data.value
  ) {
    // if FileObject with value and options
    filename = fileParams.data.options.filename;
  } else if (isFileStream(fileParams.data)) {
    // if readable stream with path property
    filename = fileParams.data.path;
  } else if (
    isFileObject(fileParams.data) &&
    isFileStream(fileParams.data.value)
  ) {
    // if FileObject with stream value
    filename = fileParams.data.value.path;
  }
  // toString handles the case when path is a buffer
  filename = filename ? basename(filename.toString()) : '_';

  // build contentType
  let contentType: string = 'application/octet-stream';
  if (
    isFileObject(fileParams.data) &&
    fileParams.data.options &&
    fileParams.data.options.contentType
  ) {
    // if form-data object
    contentType = fileParams.data.options.contentType;
  } else if (fileParams.contentType) {
    // for multiple producers, this is either null, or the _content_type parameter
    // for single producers, this is the single content type
    contentType = fileParams.contentType;
  } else {
    // else utilize file-type package
    if (isFileObject(fileParams.data)) {
      contentType = getContentType(fileParams.data.value) || contentType;
    } else {
      contentType = getContentType(fileParams.data) || contentType;
    }
  }

  // build value
  let value: NodeJS.ReadableStream | Buffer | string = isFileObject(fileParams.data)
    ? fileParams.data.value
    : fileParams.data;
  if (typeof value === 'string') {
    value = Buffer.from(value);
  }
  return {
    value,
    options: {
      filename,
      contentType
    }
  };
}

/**
 * this function converts an object's keys to lower case
 * note: does not convert nested keys
 * @param {Object} obj - the object to convert the keys of
 * @returns {Object}
 */
export function toLowerKeys(obj: Object): Object {
  let _obj = {};
  if (obj) {
    _obj = extend(
      {},
      ...Object.keys(obj).map(key => ({
        [key.toLowerCase()]: obj[key]
      }))
    );
  }
  return _obj;
}
