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
import { AuthenticateOptions, AuthenticatorInterface } from './authenticator-interface';
/**
 * Base Authenticator class for other Authenticators to extend. Not intended
 * to be used as a stand-alone authenticator.
 */
export declare class Authenticator implements AuthenticatorInterface {
    /**
     * Create a new Authenticator instance.
     *
     * @throws {Error} The `new` keyword was not used to create construct the
     *   authenticator.
     */
    constructor();
    /**
     * Augment the request with authentication information.
     *
     * @param {object} requestOptions - The request to augment with authentication information.
     * @param {object.<string, string>} requestOptions.headers - The headers the
     *   authentication information will be added too.
     * @throws {Error} - The authenticate method was not implemented by a
     *   subclass.
     */
    authenticate(requestOptions: AuthenticateOptions): Promise<void | Error>;
}
