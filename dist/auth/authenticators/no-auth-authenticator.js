"use strict";
/* eslint-disable @typescript-eslint/no-unused-vars, class-methods-use-this */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
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
var authenticator_1 = require("./authenticator");
/**
 * NoAuthAuthenticator is a placeholder authenticator implementation which
 * performs no authentication of outgoing REST API requests. It might be
 * useful during development and testing.
 */
var NoAuthAuthenticator = /** @class */ (function (_super) {
    __extends(NoAuthAuthenticator, _super);
    function NoAuthAuthenticator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NoAuthAuthenticator.prototype.authenticate = function (requestOptions) {
        // immediately proceed to request. it will probably fail
        return Promise.resolve();
    };
    return NoAuthAuthenticator;
}(authenticator_1.Authenticator));
exports.NoAuthAuthenticator = NoAuthAuthenticator;
