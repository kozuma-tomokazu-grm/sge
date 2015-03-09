/**
 * messageService
 */
// third party
var async = require('async');

// util
var validator = require('util/validator');

//dao
var messageDao = require('dynamodb/dao/messageDao');
var messageGroupDao = require('dynamodb/dao/messageGroupDao');
var incrementDao = require('dynamodb/dao/incrementDao');

var messageService = function() {
    this.name = 'message';
}

/**
 * 新規メッセージを追加
 */
messageService.prototype.addMessage = function(params, callback) {
    try {
        validator.has(params, ['fromUserId', 'toUserId', 'message', 'messageGroupId','imagePath']);
        validator.unsignedInteger(params.fromUserId);
        validator.unsignedInteger(params.toUserId);
        validator.string(params.message);
        validator.unsignedInteger(params.messageGroupId);
        validator.string(params.imagePath);
   
        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    var messageId = 0;
    var incrementKey = 'messageId';
    var incrementValue = 1;

    async.waterfall([
        function(callback) {
            // メッセージIDインクリメントを取得
            incrementDao.getByIncrementKey(incrementKey, callback);
        },
        function(result, callback) {
            // メッセージIDインクリメントが存在する場合
            if (result && result.incrementKey === incrementKey) {
                // メッセージIDをインクリメント
                incrementDao.updateItemByIncrementKey(incrementKey, callback);
            } else {
                // メッセージIDインクリメントが存在しない場合
                // メッセージIDをインクリメント null -> 1

                incrementDao.putItemByIncrementKeyAndIncrementValue({
                    incrementKey: incrementKey,
                    incrementValue: incrementValue
                }, callback);
            }
        },
        function(result, callback) {
            // result = {}
            incrementDao.getByIncrementKey(incrementKey, callback);
        },
        function(result, callback) {
            if (result && result.incrementKey === incrementKey) {
                messageId = result.incrementValue;
            } else {
                callback(new Error('Cannot incremnt incrementKey: ' + incrementKey));
                return;
            }

            messageDao.addMessage({
                messageId: messageId,
                userId: params.fromUserId,
                messageGroupId: params.messageGroupId,
                message: params.message,
                imagePath: params.imagePath
            }, function(error) {
                callback(error);
            });
        }     
    ], function(error, result) {
        if (error) {
            callback(error);
            return;
        }

        callback(null, {
            messageId: messageId,
            updateDatetime: Date.now()
        });
    });
}

/**
 * メッセージグループテーブルにデータを追加 
 */
messageService.prototype.addMessageGroup = function(params, callback) {
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
    var incrementKey = 'messageGroupId';
    var incrementValue = 1;
    var messageGroupId = 0;

    async.waterfall([
        function(callback) {
            // メッセージグループIDインクリメントを取得
            incrementDao.getByIncrementKey(incrementKey, callback);
        },
        function(result, callback) {
            // メッセージグループIDインクリメントが存在する場合
            if (result &&  result.incrementKey === incrementKey) {
                // メッセージグループIDをインクリメント
                incrementDao.updateItemByIncrementKey(incrementKey, callback);
            } else {
                // メッセージグループインクリメントが存在しない場合
                // メッセージグループIDをインクリメント null -> 1
                incrementDao.putItemByIncrementKeyAndIncrementValue({
                    incrementKey: incrementKey,
                    incrementValue: incrementValue
                }, callback);
            }
        },
        function(result, callback) {
            // result = {}
            incrementDao.getByIncrementKey(incrementKey, callback);
        },
        function(result, callback) {
            if (result && result.incrementKey === incrementKey) {
                messageGroupId = result.incrementValue;
            } else {
                callback(new Error('cannot increment. incrementKey = ' + incrementKey));
                return;
            }

            // メッセージグループテーブルに送信メッセージグループデータを追加
            messageGroupDao.add({
                fromUserId: params.fromUserId,
                toUserId: params.toUserId,
                messageGroupId: messageGroupId,
                newMessageFlag: false,
                blockFlag: false,
                deleteFlag: false,
            }, callback);
        },
        function(result, callback) {
            // メッセージグループテーブルに受信メッセージグループデータを追加
            messageGroupDao.add({
                fromUserId: params.toUserId,
                toUserId: params.fromUserId,
                messageGroupId: messageGroupId,
                newMessageFlag: true,
                blockFlag: false,
                deleteFlag: false
            }, callback);
        }
    ], function(error, result) {
        if (error) {
            callback(error);
            return;
        }

        callback(null, messageGroupId);
    });
}

var service = new messageService();
module.exports = service;
