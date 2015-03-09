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
 * @fileOverview メッセージグループを管理するDAO
 **/
var MessageGroupDao = function() {
    this.name = 'messageGroup';
}
util.inherits(MessageGroupDao, BaseDao);

/**
 * メッセージグループを作成
 * param {object} params
 * param {int} params.fromUserId
 * param {int} params.toUserId
 * param {int} params.messageGroupId
 * return {}
 */
MessageGroupDao.prototype.add = function(params, callback) {
    try {
        validator.has(params, ['fromUserId', 'toUserId', 'messageGroupId', 'newMessageFlag']);
        validator.unsignedInteger(params.fromUserId);
        validator.unsignedInteger(params.toUserId);
        validator.unsignedInteger(params.messageGroupId);
        validator.boolean(params.newMessageFlag);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.putItem({
        'fromUserId': params.fromUserId,
        'toUserId': params.toUserId,
        'messageGroupId': params.messageGroupId,
        'newMessageFlag': params.newMessageFlag
    }, callback);
}

/**
 * formUserIdとtoUserIdでメッセージグループを取得
 * param {object} params
 * param {int} params.fromUserId
 * param {int} params.toUserId
 * return [] or messageGroupList
 */
MessageGroupDao.prototype.getListByFromUserIdAndToUserId = function(params, callback) {
    try {
        validator.has(params, ['fromUserId', 'toUserId']);
        validator.unsignedInteger(params.fromUserId);
        validator.unsignedInteger(params.toUserId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;

    self.docClient.query({
        TableName: self.name,
        KeyConditions: [
            self.docClient.Condition("fromUserId", "EQ", params.fromUserId),
            self.docClient.Condition("toUserId", "EQ", params.toUserId)
        ]
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
}

/**
 * formUserIdでメッセージグループを取得
 * param {int} fromUserId
 * param {int} updateDatetime
 * return [] or messageGroupList
 */
MessageGroupDao.prototype.getListByFromUserIdAndUpdateDatetime = function(params, callback) {
    try {
        validator.unsignedInteger(params.fromUserId);
        validator.unsignedInteger(params.updateDatetime);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;

    self.docClient.query({
        TableName: self.name,
        IndexName: 'updateDatetime-index',
        KeyConditions: [
            self.docClient.Condition("fromUserId", "EQ", params.fromUserId),
            self.docClient.Condition("updateDatetime", "LT", params.updateDatetime)
        ],
        QueryFilter: [
            self.docClient.Condition("deleteFlag", "EQ", false)
        ],
        ScanIndexForward: false,
        Limit: 2
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
}

/**
 * formUserIdで新着メッセージグループを取得
 * param {int} userId
 * return [] or messageGroupList
 */
MessageGroupDao.prototype.getNewMessageGroupListByFromUserId = function(userId, callback) {
    try {
        validator.unsignedInteger(userId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;

    self.docClient.query({
        TableName: self.name,
        IndexName: 'updateDatetime-index',
        KeyConditions: [
            self.docClient.Condition("fromUserId", "EQ", userId),
            self.docClient.Condition("updateDatetime", "LT", Date.now())
        ],
        QueryFilter: [
            self.docClient.Condition("deleteFlag", "EQ", false),
            self.docClient.Condition("newMessageFlag", "EQ", true)
        ],
        ScanIndexForward: false
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
}

/**
 * messageGroupIdでメッセージグループリストを取得
 * param {int} messageGroupId
 * return [] or messageGroupList
 */
MessageGroupDao.prototype.getListByMessageGroupId = function(messageGroupId, callback) {
    try {
        validator.unsignedInteger(messageGroupId);

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
            self.docClient.Condition("messageGroupId", "EQ", messageGroupId)
        ],
        QueryFilter: [
            self.docClient.Condition("deleteFlag", "EQ", false)
        ]
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
}

/**
 * messageGroupIdで新着メッセージフラグを変更
 * param {int} fromUserId
 * param {int} toUserId
 * param {boolean} newMessageFlag
 * return ?
 */
MessageGroupDao.prototype.updateNewMessageFlag = function(params, callback) {
    try {
        validator.unsignedInteger(params.fromUserId);
        validator.unsignedInteger(params.toUserId);
        validator.boolean(params.newMessageFlag);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;

    self.docClient.updateItem({
        TableName: self.name,
        Key: {
            'fromUserId': params.fromUserId,
            'toUserId': params.toUserId
        },
        UpdateExpression: 'set newMessageFlag = :newMessageFlag',
        ExpressionAttributeValues: {
            ':newMessageFlag':  params.newMessageFlag
        }
    }, function(error, result) {
        if (error) {
            callback(error);
            return;
        }
    
        callback(null, result);
    });
}

/**
 * メッセージグループのデリートフラグを更新
 * param {object} params
 * param {int} params.fromUserId
 * param {int} params.toUserId
 * param {boolean} params.deleteFlag
 * return {}
 */
MessageGroupDao.prototype.updateDeleteFlag = function(params, callback) {
    try {
        validator.has(params, ['fromUserId', 'toUserId']);
        validator.unsignedInteger(params.fromUserId);
        validator.unsignedInteger(params.toUserId);
        validator.boolean(params.deleteFlag);        

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;

    self.docClient.updateItem({
        TableName: self.name,
        Key: {
            'fromUserId': params.toUserId,
            'toUserId': params.fromUserId
        },
        UpdateExpression: 'set deleteFlag = :deleteFlag',
        ExpressionAttributeValues: {
            ':deleteFlag': params.deleteFlag
        }
    }, callback);
}

/**
 * メッセージグループのブロックフラグを更新
 * param {object} params
 * param {int} params.fromUserId
 * param {int} params.toUserId
 * param {boolean} params.blockFlag
 * return {}
 */
MessageGroupDao.prototype.updateBlockFlag = function(params, callback) {
    try {
        validator.has(params, ['fromUserId', 'toUserId']);
        validator.unsignedInteger(params.fromUserId);
        validator.unsignedInteger(params.toUserId);
        validator.boolean(params.blockFlag);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;

    self.docClient.updateItem({
        TableName: self.name,
        Key: {
            'fromUserId': params.fromUserId,
            'toUserId': params.toUserId
        },
        UpdateExpression: 'set blockFlag = :blockFlag',
        ExpressionAttributeValues: {
            ':blockFlag': params.blockFlag
        }
    }, callback);
}


var dao = new MessageGroupDao();
dao.init();
module.exports = dao;

