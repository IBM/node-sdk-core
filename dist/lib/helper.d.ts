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
/// <reference types="node" />
export interface FileObject {
    value: NodeJS.ReadableStream | Buffer | string;
    options?: FileOptions;
}
export interface FileOptions {
    filename?: string;
    contentType?: string;
}
export interface FileWithMetadata {
    data: NodeJS.ReadableStream | Buffer;
    filename: string;
    contentType: string;
}
export interface FileStream extends NodeJS.ReadableStream {
    path: string | Buffer;
}
export declare function isFileWithMetadata(obj: any): obj is FileWithMetadata;
export declare function isFileData(obj: any): obj is NodeJS.ReadableStream | Buffer;
export declare function isEmptyObject(obj: any): boolean;
/**
 * This function retrieves the content type of the input.
 * @param {NodeJS.ReadableStream|Buffer} inputData - The data to retrieve content type for.
 * @returns {string} the content type of the input.
 */
export declare function getContentType(inputData: NodeJS.ReadableStream | Buffer): string;
/**
 *
 * @param {string} url - the url string.
 * @returns {string}
 */
export declare function stripTrailingSlash(url: string): string;
/**
 * Return a query parameter value from a URL
 *
 * @param {string} urlStr - the url string.
 * @param {string} param - the name of the query parameter
 *                     whose value should be returned
 * @returns {string} the value of the `param` query parameter
 * @throws if urlStr is an invalid URL
 */
export declare function getQueryParam(urlStr: string, param: string): string;
/**
 * Validates that all required params are provided
 * @param params - the method parameters.
 * @param requires - the required parameter names.
 * @returns {Error|null}
 */
export declare function getMissingParams(params: {
    [key: string]: any;
}, requires: string[]): null | Error;
/**
 * Return true if 'text' is html
 * @param  {string} text - The 'text' to analyze
 * @returns {boolean} true if 'text' has html tags
 */
export declare function isHTML(text: string): boolean;
/**
 * Returns the first match from formats that is key the params map
 * otherwise null
 * @param  {Object} params - The parameters.
 * @param  {string[]} requires - The keys we want to check
 * @returns {string|null}
 */
export declare function getFormat(params: {
    [key: string]: any;
}, formats: string[]): string;
/**
 * This function builds a `form-data` object for each file parameter.
 * @param {FileWithMetadata} fileParam The file parameter.
 * @param {NodeJS.ReadableStream|Buffer} fileParam.data The data content of the file.
 * @param {string} fileParam.filename The filename of the file.
 * @param {string} fileParam.contentType The content type of the file.
 * @returns {FileObject}
 */
export declare function buildRequestFileObject(fileParam: FileWithMetadata): FileObject;
/**
 * This function converts an object's keys to lower case.
 * note: does not convert nested keys
 * @param {Object} obj The object to convert the keys of.
 * @returns {Object}
 */
export declare function toLowerKeys(obj: Object): Object;
/**
 * Constructs a service URL by formatting a parameterized URL.
 *
 * @param {string} parameterizedUrl URL that contains variable placeholders, e.g. '{scheme}://ibm.com'.
 * @param {Map<string, string>} defaultUrlVariables Map from variable names to default values.
 *  Each variable in the parameterized URL must have a default value specified in this map.
 * @param {Map<string, string>} providedUrlVariables Map from variable names to desired values.
 *  If a variable is not provided in this map,
 *  the default variable value will be used instead.
 * @returns {string} The formatted URL with all variable placeholders replaced by values.
 */
export declare function constructServiceUrl(parameterizedUrl: string, defaultUrlVariables: Map<string, string>, providedUrlVariables: Map<string, string> | null): string;
