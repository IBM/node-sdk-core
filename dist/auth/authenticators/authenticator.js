"use strict";
/* eslint-disable @typescript-eslint/no-unused-vars, class-methods-use-this */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Base Authenticator class for other Authenticators to extend. Not intended
 * to be used as a stand-alone authenticator.
 */
var Authenticator = /** @class */ (function () {
    /**
     * Create a new Authenticator instance.
     *
     * @throws {Error} The `new` keyword was not used to create construct the
     *   authenticator.
     */
    function Authenticator() {
        if (!(this instanceof Authenticator)) {
            throw new Error('the "new" keyword is required to create authenticator instances');
        }
    }
    /**
     * Augment the request with authentication information.
     *
     * @param {object} requestOptions - The request to augment with authentication information.
     * @param {object.<string, string>} requestOptions.headers - The headers the
     *   authentication information will be added too.
     * @throws {Error} - The authenticate method was not implemented by a
     *   subclass.
     */
    Authenticator.prototype.authenticate = function (requestOptions) {
        var error = new Error('Should be implemented by subclass!');
        return Promise.reject(error);
    };
    return Authenticator;
}());
exports.Authenticator = Authenticator;
