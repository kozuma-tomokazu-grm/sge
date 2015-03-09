// third party
var async = require('async');
var _ = require('underscore');

// util
var validator = require('util/validator');

// dao
var userDao = require('dao/userDao');
var facebookNotificationDao = require('dao/facebookNotificationDao');

// api
var facebook = require('api/facebook');

var facebookService = function() {
    this.name = 'facebook';
}

/**
 * 通知を送る
 **/
facebookService.prototype.notification = function(params, callback) {
    try {
        validator.has(params, ['toUserId', 'fromUserId', 'code']);
        validator.unsignedInteger(params.toUserId);
        validator.unsignedInteger(params.fromUserId);
        validator.string(params.code);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }
    var self = this;
    // var appAccessToken = '';
    async.waterfall([
        function(callback) {
            async.parallel({
                // targetユーザー情報を取得
                toUser: function(callback) {
                    userDao.getByUserId(params.toUserId, callback);
                },
                // trrigerユーザー情報を取得
                fromUser: function(callback) {
                    userDao.getByUserId(params.fromUserId, callback);
                }
            }, callback);
        },
        // テキスト情報を取得
        function(userData, callback) {
            facebookNotificationDao.getByCode(params.code, function(error, facebookNotification) {
                if (error) {
                    callback(error);
                    return;
                }
                callback(null, userData, facebookNotification);
            })
        },
        // 通知を送る
        function(userData, facebookNotification, callback) {
            facebook.notification({
                toFacebookId: userData.toUser.facebookId,
                fromFacebookId: userData.fromUser.facebookId,
                text: facebookNotification.text
            }, callback);
        }
    ], callback);
}

var service = new facebookService();
module.exports = service;