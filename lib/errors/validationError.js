/**
 * @fileOverview ValidationError
 */

// third party
var util = require('util');

// base
var BaseError = require('errors/baseError');

/**
 * ValidationError
 *
 * バリデーションエラー
 *
 * @class ValidationError
 */
var ValidationError = function(message) {
    BaseError.call(this, message);
    this.name = 'ValidationError';
};
util.inherits(ValidationError, BaseError);

module.exports = ValidationError;