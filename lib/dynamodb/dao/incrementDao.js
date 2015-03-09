// third party
var async = require('async');
var util = require('util');
var _ = require('underscore');

// util
var validator = require('util/validator');

// base
var BaseDao = require('./baseDao');

/**
 *
 * @fileOverview インクリメントDAO
 **/
var incrementDao = function() {
    this.name = 'increment';
}
util.inherits(incrementDao, BaseDao);

/**
 * incrementKeyで取得
 * param {string} incrementKey
 * return {} or { incrementKey:'...', incrementValue:'...' }
 */
incrementDao.prototype.getByIncrementKey = function(incrementKey, callback) {
    try {
        validator.string(incrementKey);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;

    self.docClient.getItem({
        TableName: self.name,
        Key: {
            'incrementKey': incrementKey
        }
    }, function(error, result) {
        if (error) {
            callback(null, null);
            return;
        }
        callback(null, result.Item);
    });
}

/**
 * incrementを生成
 * param {object} params
 * param {string} param.incrementKey
 * param {int} param.incrementValue
 * return {} or error
 */
incrementDao.prototype.putItemByIncrementKeyAndIncrementValue = function(params, callback) {
    try {
        validator.string(params.incrementKey);
        validator.unsignedInteger(params.incrementValue);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;

    // 1行にしてbaseDao.putItemを使うとinsertDatetime、updateDatetimeが入ってきてしまう    
    self.docClient.putItem({
        TableName: self.name,
        Item: {
            'incrementKey': params.incrementKey,
            'incrementValue': params.incrementValue
        }
    }, callback);
}

/**
 * incrementKeyでインクリメントを更新
 * param {string} incrementKey
 * return {} or error
 */
incrementDao.prototype.updateItemByIncrementKey = function(incrementKey, callback) {
    var self = this;

    self.docClient.updateItem({
        TableName: self.name,
        Key: {
            'incrementKey': incrementKey
        },
        AttributeUpdates: {
            'incrementValue': {
                Action: 'ADD',
                Value: 1
            }
        }
    }, callback);
}

var dao = new incrementDao();
dao.init();
module.exports = dao;
