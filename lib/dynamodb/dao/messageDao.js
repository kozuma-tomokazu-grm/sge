// third party
var async = require('async');
var util = require('util');
var _ = require('underscore');

// util
var validator = require('util/validator');

// base
var BaseDao = require('./baseDao');
var incrementDao = require('./incrementDao');

/**
 *
 * @fileOverview メッセージを管理するDAO
 **/
var MessageDao = function() {
    this.name = 'message';
}
util.inherits(MessageDao, BaseDao);

/**
 * メッセージをDBに追加
 * param {Object} params
 * param {int} params.messageId メッセージID
 * param {int} params.userId ユーザーID
 * param {int} params.messageGroupId メッセージグループID
 * param {string} params.message メッセージ
 * param {string} params.imagePath 画像パス
 * result 
 */
MessageDao.prototype.addMessage = function(params, callback) {
    try {
        validator.has(params, ['messageId', 'userId', 'messageGroupId', 'message', 'imagePath']);
        validator.unsignedInteger(params.messageId);
        validator.unsignedInteger(params.userId);
        validator.unsignedInteger(params.messageGroupId);
        validator.string(params.message);
        validator.string(params.imagePath);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;

    self.putItem(params, callback);    
};

/**
 * メッセージグループIDでメッセージを検索
 * param {Object} params
 * param {int} param.messageGroupId
 * param {Date} param.updateDatime 
 * result
 **/
MessageDao.prototype.getListByMessageGroupIdAndUpdateDatetime = function(params, callback) {
    try {
        validator.has(params, ['messageGroupId']);
        validator.unsignedInteger(params.messageGroupId);
        validator.unsignedInteger(params.updateDatetime);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;

    self.docClient.query({
        TableName: self.name,
        IndexName: "messageGroupId-updateDatetime-index",
        KeyConditions: [
            self.docClient.Condition("messageGroupId", "EQ", params.messageGroupId),
            self.docClient.Condition("updateDatetime", "LT", params.updateDatetime)
        ],
        QueryFilter: [self.docClient.Condition("deleteFlag", "EQ", false)],
        ScanIndexForward: false,
        Limit: 9
    }, function(error, result) {
        if (error) {
            callback(error);
            return;
        }

        if (!result) {
            callback(null, []);
            return;
        }

        callback(null, result.Items);
    });
};

/**
 * メッセージIDでメッセージを削除
 * param {int} messageId
 * result
 **/
MessageDao.prototype.deleteMessageByMessageId = function(messageId,  callback) {
    try {
        validator.unsignedInteger(messageId);
        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    var deleteFlag = true;

    self.docClient.updateItem({
        TableName: self.name,
        Key: {
            messageId: messageId
        },
        UpdateExpression: "set deleteFlag = :deleteFlag",
        ExpressionAttributeValues: {
            ":deleteFlag": deleteFlag
        }
    }, function(error, result) {
        if (error) {
            callback(error);
            return;
        }

        callback(null, result);
    });
};

var dao = new MessageDao();
dao.init();
module.exports = dao;


