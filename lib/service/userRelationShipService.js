/**
 * userRelationShipService
 */
// third party
var async = require('async');

// util
var validator = require('util/validator');

//dao
var userRelationShipDao = require('dao/userRelationShipDao');
var facebookNotificationDao = require('dao/facebookNotificationDao');

// service
var facebookService = require('service/facebookService');

var userRelationShipService = function() {
    this.name = 'UserRelationShip';
}

/**
 *　フォローする
 *
 * param {Object} params
 * param {int} params.followUserId フォローしている側のユーザーID
 * param {int} params.followedUserId フォローされている側のユーザーID
 * result
 *
 **/
userRelationShipService.prototype.follow = function(params, callback) {
    try {
        validator.has(params, ['followUserId', 'followedUserId']);
        validator.unsignedInteger(params.followUserId);
        validator.unsignedInteger(params.followedUserId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }
    async.waterfall([
        // 取得
        function(callback) {
            userRelationShipDao.getByFollowUserIdAndFollowedUserId({
                followUserId: params.followUserId,
                followedUserId: params.followedUserId
            }, callback);
        },
        // 更新処理
        function(userRelationShip ,callback) {
            // 登録データがない場合は新規でデータを追加
            if (!userRelationShip) {
                userRelationShipDao.add({
                    followUserId: params.followUserId,
                    followedUserId: params.followedUserId
                }, callback);
                return;

            // 削除フラグがtureだったら更新をかける
            } else if (userRelationShip.deleteFlag) {
                userRelationShipDao.updateDeleteFlag({
                    followUserId: params.followUserId,
                    followedUserId: params.followedUserId,
                    deleteFlag: false
                }, callback);
                return;
            }

            callback();
        }
    ], callback);
}

/**
 *　フォローを解除する
 *
 * param {Object} params
 * param {int} params.followUserId フォローしている側のユーザーID
 * param {int} params.followedUserId フォローされている側のユーザーID
 * result
 *
 **/
userRelationShipService.prototype.unfollow = function(params, callback) {
    try {
        validator.has(params, ['followUserId', 'followedUserId']);
        validator.unsignedInteger(params.followUserId);
        validator.unsignedInteger(params.followedUserId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    async.waterfall([
        // 取得
        function(callback) {
            userRelationShipDao.getByFollowUserIdAndFollowedUserId({
                followUserId: params.followUserId,
                followedUserId: params.followedUserId
            }, callback);
        },
        // 更新処理
        function(userRelationShip ,callback) {
            if (userRelationShip && !userRelationShip.deleteFlag) {
                userRelationShipDao.updateDeleteFlag({
                    followUserId: params.followUserId,
                    followedUserId: params.followedUserId,
                    deleteFlag: true
                }, callback);
            } else {
                callback();
            }
        }
    ], callback);
}

/**
 * マッチングしているか判定
 *
 * param {Object} params パラメータ
 * param {Number} params.followUserId フォローユーザーID
 * param {Number} params.followedUserId フォローされている側のユーザーID
 * param {function(boolean result)} callback コールバック
 *      result: マッチングしているかどうか
 *
 **/
userRelationShipService.prototype.checkMatching = function(params, callback) {
    try {
        validator.has(params, ['followUserId', 'followedUserId']);
        validator.unsignedInteger(params.followUserId);
        validator.unsignedInteger(params.followedUserId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    async.parallel({
        // フォローしているか判定
        isFollow: function(callback) {
            userRelationShipDao.isFollow({
                followUserId: params.followUserId,
                followedUserId: params.followedUserId
            }, callback);
        },
        // フォローされているか判定
        isFollowed: function(callback) {
            userRelationShipDao.isFollow({
                followUserId: params.followedUserId,
                followedUserId: params.followUserId
            }, callback);
        },
    }, function(error, result) {
        if (error) {
            callback(error);
            return;
        }
        var matchingFlag = false
        if (result.isFollow && result.isFollowed) {
            matchingFlag = true;
        }
        callback(null, matchingFlag);
    });
}

/**
 * マッチング通知をお互いに送信
 *
 * param {Object} params パラメータ
 * param {Number} params.fromUserId fromユーザーID
 * param {Number} params.toUserId toユーザーID
 * param {function(Object result)} callback コールバック
 *      result: 通知送信結果
 *
 **/
userRelationShipService.prototype.matchingNotification = function(params, callback) {
    try {
        validator.has(params, ['fromUserId', 'toUserId']);
        validator.unsignedInteger(params.fromUserId);
        validator.unsignedInteger(params.toUserId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    async.parallel([
        // 相手にfacebook通知を送信
        function(callback) {
            facebookService.notification({
                toUserId: params.toUserId,
                fromUserId: params.fromUserId,
                code: facebookNotificationDao.code.matching
            }, function(error, result) {
                callback(error);
            });
        },
        // 自分にfacebook通知を送信
        function(callback) {
            facebookService.notification({
                toUserId: params.fromUserId,
                fromUserId: params.toUserId,
                code: facebookNotificationDao.code.matching
            }, function(error, result) {
                callback(error);
            });
        },
    ], callback);
}

var service = new userRelationShipService();
module.exports = service;
