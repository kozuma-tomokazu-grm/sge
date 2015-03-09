/**
 * @fileOverview BaseError
 */

// third party
var util = require('util');

/**
 * BaseError
 *
 * @class BaseError
 */
var BaseError = function(message) {
    Error.call(this, message);
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
};
util.inherits(BaseError, Error);

module.exports = BaseError;