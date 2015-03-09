/*
 * userService
 */
// third party
var async = require('async');
var _ = require('underscore');

// util
var validator = require('util/validator');

// helper
var helper = require('helpers/applicationHelper');

// dao
var userDao = require('dao/userDao');
var postDao = require('dao/postDao');
var likeDao = require('dao/likeDao');
var commentDao = require('dao/commentDao');
var tagRelationUserDao = require('dao/tagRelationUserDao');
var userRelationShipDao = require('dao/userRelationShipDao');

/*
 * class userService
 */
var userService = function() {
    this.name = 'user';
}

userService.prototype.getUserInformation = function(params, callback) {
    try {
        validator.has(params, ['loginUserId', 'userId']);
        validator.unsignedInteger(params.loginUserId);
        validator.unsignedInteger(params.userId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }
    var self = this;
    var serviceData = {
        back_root_flg: true,
        isFollowing: false
    }

    async.parallel({
        // ユーザー情報を取得
        userInfomation: function(callback) {
            self.getByUserId(params.userId, function(error, result) {
                if(error) {
                    callback(error);
                    return;
                }
                if(!result){
                    callback(new Error('can not find user'));
                    return;
                }
                _.extend(serviceData, result);
                callback();
            });
        },
        // フォローしているか判定
        userRelationShip: function(callback) {
            userRelationShipDao.getByFollowUserIdAndFollowedUserId({
                followUserId: params.loginUserId,
                followedUserId: params.userId
            }, function(error, result) {
                if (error) {
                    callback(error);
                    return;
                }
                if (result && !result.deleteFlag) {
                    serviceData.isFollowing = true;
                }
                callback();
            });
        }
    }, function(error, resultData) {
        callback(error, serviceData);
    });
}

userService.prototype.getByUserId = function(userId, callback) {
    try {
        validator.unsignedInteger(userId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var result = {};

    async.parallel({
        // ユーザー情報を取得
        user: function(callback){
            userDao.getByUserId(userId, callback);
        },
        // 投稿件数を取得
        photoCount: function(callback){
            postDao.getUserPostCount(userId, callback);
        },
        //　いいねした件数を取得
        likeCount: function(callback){
            likeDao.getListByUserId(userId, function(error, likeList) {
                callback(error, likeList.length);
            });
        },
        // コメントした投稿件数鵜を取得
        commentCount: function(callback){
            commentDao.getUserCommentCount(userId, callback);
        },
        // フォロー数を取得
        followCount: function(callback) {
            userRelationShipDao.getListByFollowUserId(userId, function(error, userRelationShipList) {
                callback(error, userRelationShipList.length);
            });
        },
        // フォロワー数を取得
        followedCount: function(callback) {
            userRelationShipDao.getListByFollowedUserId(userId, function(error, userRelationShipList) {
                callback(error, userRelationShipList.length);
            });
        },
    }, callback);
}

userService.prototype.getRecentLoginUserList = function(params, callback) {
    try {
        validator.has(params, ['userId', 'updateDatetime', 'limit']);
        validator.unsignedInteger(params.userId);
        validator.date(params.updateDatetime);
        validator.unsignedInteger(params.limit);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    async.waterfall([
        // 直近ログインしたユーザーを取得
        function(callback) {
            userDao.getRecentLoginUserList({
                updateDatetime: params.updateDatetime,
                limit: params.limit
            }, function(error, result) {
                if (error) {
                    callback(error);
                    return;
                }

                // 自分自身を省く
                var userList = _.filter(result, function(user) {
                    return user.userId !== params.userId;
                });
                callback(null, userList);
            });
        },
        // ユーザーのタグ情報を取得
        function(userList, callback) {
            async.eachSeries(userList, function(user, callback) {
                tagRelationUserDao.getListByUserId(user.userId, function(error, tagRelationUserList) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    // タグ名のリストを取得
                    user.tagNameList = _.map(tagRelationUserList, function(tagRelationUser) {
                        return tagRelationUser.tagName;
                    });
                    callback();
                });
            }, function(error) {
                callback(error, userList);
            });
        },
        // フォロー状況を取得
        function(userList, callback) {
            async.eachSeries(userList, function(user, callback) {
                userRelationShipDao.getByFollowUserIdAndFollowedUserId({
                    followUserId: params.userId,
                    followedUserId: user.userId
                }, function(error, result) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    user.isFollowing = false;
                    if (result && !result.deleteFlag) {
                        user.isFollowing = true;
                    }
                    callback();
                });
            }, function(error) {
                callback(error, userList);
            });
        }
    ], callback);
}

var service = new userService();
module.exports = service;
