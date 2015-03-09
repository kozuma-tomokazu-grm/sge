// third party
var async = require('async');
var _ = require('underscore');

// util
var validator = require('util/validator');

// dao
var postDao = require('dao/postDao');
var userDao = require('dao/userDao');
var commentDao = require('dao/commentDao');
var userRelationShipDao = require('dynamodb/dao/userRelationShipDao');

// service
var postService    = require('../service/postService');
var helper    = require('../helpers/applicationHelper');


var followUserService = function() {
    this.name = 'followUser';
}

followUserService.prototype.newarrivals = function(params, callback) {
    try {
        validator.has(params, ['userId', 'offset', 'limit']);
        validator.unsignedInteger(params.userId);
        validator.integer(params.offset);
        validator.unsignedInteger(params.limit);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }
    async.waterfall([
        // フォーローしているユーザーIdを取得
        function(callback) {
            userRelationShipDao.getListByFollowUserId(params.userId, function(error, userRelationShipList) {
                if (error) {
                    callback(error);
                    return;
                }
                // フォローしているユーザーIDを取得
                var followedUserIdList = _.map(userRelationShipList, function(userRelationShip) {
                    return userRelationShip.followedUserId;
                });

                // 自分の投稿も取得できるようにuserIdを追加
                followedUserIdList.push(params.userId);
                callback(null, followedUserIdList)
            });
        },
        // 新着を取得
        function(followedUserIdList, callback) {
            postDao.newarrivalsByFollowedUserIdList({
                offset: params.offset,
                limit: params.limit,
                followedUserIdList: followedUserIdList
            }, callback);
        },
        // 投稿にひもづく情報を取得
        function(result, callback) {
            postService.getPostsInfo({
                userId: params.userId,
                postList: result
            }, callback);
        },
        // データ整形
        function(result, callback) {
            postService.jsonView(result, callback);
        }
    ], callback);
}

followUserService.prototype.getListByUserIdAndLimitAndLessThanId = function(params, callback) {
    try {
        validator.has(params, ['userId', 'limit', 'lessThanId']);
        validator.unsignedInteger(params.userId);
        validator.unsignedInteger(params.limit);
        validator.unsignedInteger(params.lessThanId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }
    async.waterfall([
        // フォーローしているユーザーIdを取得
        function(callback) {
            userRelationShipDao.getListByFollowUserId(params.userId, function(error, userRelationShipList) {
                if (error) {
                    callback(error);
                    return;
                }
                // フォローしているユーザーIDを取得
                var followedUserIdList = _.map(userRelationShipList, function(userRelationShip) {
                    return userRelationShip.followedUserId;
                });

                // 自分の投稿も取得できるようにuserIdを追加
                followedUserIdList.push(params.userId);
                callback(null, followedUserIdList)
            });
        },
        // 新着を取得
        function(followedUserIdList, callback) {
            postDao.getListByFollowedUserIdListAndLimit({
                followedUserIdList: followedUserIdList,
                limit: params.limit,
                lessThanId: params.lessThanId
            }, callback);
        },
        // 投稿にひもづく情報を取得
        function(result, callback) {
            postService.getPostsInfo({
                userId: params.userId,
                postList: result
            }, callback);
        },
        // データ整形
        function(result, callback) {
            postService.jsonView(result, callback);
        }
    ], callback);
}

var service = new followUserService();
module.exports = service;
