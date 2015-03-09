/**
 * @fileOverview バリデーター
 */

var _ = require('underscore');

var ValidationError = require('errors/validationError');

/**
 * 論理型であることをチェックする
 *
 * @param {Object} object オブジェクト
 * @throws {ValidationError}
 * @return void
 */
exports.boolean = function(object) {
    if (!_.isBoolean(object)) {
        throw new ValidationError('object is not boolean');
    }
};

/**
 * 文字列であることをチェックする('abc', '1')
 *
 * @param {Object} object オブジェクト
 * @throws {ValidationError}
 * @return void
 */
exports.string = function(object) {
    if (!_.isString(object)) {
        var error = new ValidationError('object is not string');
        console.log(error.stack);
        throw error;
    }
};

/**
 * 数値であることをチェックする（1, 0, 0.1, -1）
 *
 * @param {Object} object オブジェクト
 * @throws {ValidationError}
 * @return void
 */
exports.number = function(object) {
    if (!_.isNumber(object)) {
        var error = new ValidationError('object is not number');
        console.log(error.stack);
        throw error;
    }
};

/**
 * 整数であることをチェックする（0, 1, -1）
 *
 * @param {Object} object オブジェクト
 * @throws {ValidationError}
 * @return void
 */
exports.integer = function(object) {
    // 数値であることをチェック
    if (!_.isNumber(object)) {
        var error = new ValidationError('object is not number');
        console.log(error.stack);
        throw error;
    }

    var string = String(object);

    if (!string.match(/^-?[0-9]+$/)) {
        var error = new ValidationError('object is not integer');
        console.log(error.stack);
        throw error;
    }
};

/**
 * 符号なし整数であることをチェックする（0, 1）
 *
 * @param {Object} object オブジェクト
 * @throws {ValidationError}
 * @return void
 */
exports.unsignedInteger = function(object) {
    // 数値であることをチェック
    if (!_.isNumber(object)) {
        var error = new ValidationError('object is not number');
        console.log(error.stack);
        throw error;
    }

    var string = String(object);

    // 整数であることをチェック
    if (!string.match(/^-?[0-9]+$/)) {
        var error = new ValidationError('object is not integer');
        console.log(error.stack);
        throw error;
    }

    // 0未満かをチェック
    if (object < 0) {
        var error = new ValidationError('object is negative integer');
        console.log(error.stack);
        throw error;
    }
};

/**
 * 自然数であることをチェックする（1, 10）
 *
 * @param {Object} object オブジェクト
 * @throws {ValidationError}
 * @return void
 */
exports.naturalInteger = function(object) {
    // 数値であることをチェック
    if (!_.isNumber(object)) {
        var error = new ValidationError('object is not number');
        console.log(error.stack);
        throw error;
    }

    var string = String(object);

    // 整数であることをチェック
    if (!string.match(/^-?[0-9]+$/)) {
        var error = new ValidationError('object is not integer');
        console.log(error.stack);
        throw error;
    }

    // 0以下かをチェック
    if (object <= 0) {
        var error = new ValidationError('object negative integer or zero');
        console.log(error.stack);
        throw error;
    }
};

/**
 * オブジェクトであることをチェックする
 *
 * @param {Object} object オブジェクト
 * @throws {ValidationError}
 * @return void
 */
exports.object = function(object) {
    if (!_.isObject(object)) {
        var error = new ValidationError('object is not object');
        console.log(error.stack);
        throw error;
    }
};

/**
 * 配列であることをチェックする
 *
 * @param {Object} object オブジェクト
 * @throws {ValidationError}
 * @return void
 */
exports.array = function(object) {
    if (!_.isArray(object)) {
        var error = new ValidationError('object is not array');
        console.log(error.stack);
        throw error;
    }
};

/**
 * 日付型であることをチェックする
 *
 * @param {Object} object オブジェクト
 * @throws {ValidationError}
 * @return void
 */
exports.date = function(object) {
    if (!_.isDate(object)) {
        var error = new ValidationError('object is not date');
        console.log(error.stack);
        throw error;
    }
};

/**
 * 関数であることをチェックする
 *
 * @param {Object} object オブジェクト
 * @throws {ValidationError}
 * @return void
 */
exports.function = function(object) {
    if (!_.isFunction(object)) {
        var error = new ValidationError('object is not function');
        console.log(error.stack);
        throw error;
    }
};

/**
 * オブジェクトにキー配列のキーの存在をチェックする
 *
 * @param {Object} object オブジェクト
 * @param {Array} keyList キー配列
 * @throws {ValidationError}
 * @return void
 */
exports.has = function(object, keyList) {
    // objectがオブジェクトかをチェック
    if (!_.isObject(object)) {
        var error = new ValidationError('object should be Object');
        console.log(error.stack);
        throw error;
    }

    // keyListが配列かをチェック
    if (!_.isArray(keyList)) {
        var error = new ValidationError('object should be array');
        console.log(error.stack);
        throw error;
    }

    // keyがobjectに存在するかをチェック
    _.each(keyList, function(key) {
        if (!_.has(object, key)) {
            var error = new ValidationError('object does not have ' + key + ' key');
            console.log(error.stack);
            throw error;
        }
    });
};

