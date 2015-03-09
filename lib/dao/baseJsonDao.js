// third party
var _ = require('underscore');

// util
var Code = require('util/code');
var validator = require('util/validator');

var BaseJsonDao = function() {
    this.name = '';
    this.jsonData = {};
}

BaseJsonDao.prototype.init = function() {
    this.jsonData = require('master/' + this.name);
}

/**
 *
 * idで取得
 *
 **/
BaseJsonDao.prototype.getById = function(id, callback) {
    try {
        validator.unsignedInteger(id);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    callback(null, this.jsonData[id] || null);
}

/**
 *
 * codeで取得
 *
 **/
BaseJsonDao.prototype.getByCode = function(code, callback) {
    try {
        validator.string(code);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }
    var data = _.find(this.jsonData, function(value, key) {
        return value.code === code;
    });
    callback(null, data || null);
}

/**
 *
 * 全て取得
 *
 **/
BaseJsonDao.prototype.getAllMap = function(callback) {
    try {
        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }
    callback(null, this.jsonData || null);
}

module.exports = BaseJsonDao;
