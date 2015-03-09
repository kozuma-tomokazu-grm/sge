// third party
var async = require('async');
var _ = require('underscore');

// util
var validator = require('util/validator');

// dao
var likeDao = require('dao/likeDao');

var LikeService = function() {
    this.name = 'like';
}

LikeService.prototype.like = function(params, callback){
    try {
        validator.unsignedInteger(params.userId);
        validator.unsignedInteger(params.postId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    async.waterfall([
        // like情報を取得
        function(callback) {
            likeDao.getByUserIdAndPostId({
                userId: params.userId,
                postId: params.postId
            }, callback);
        },
        // 追加or更新
        function(like, callback) {
            // 追加
            if (like === null) {
                likeDao.add({
                    userId: params.userId,
                    postId: params.postId
                }, callback);
            // like更新
            } else if (like.deleteFlag) {
                likeDao.updateDeleteFlag({
                    userId: params.userId,
                    postId: params.postId,
                    deleteFlag: false
                }, callback);
            // unLike更新
            } else if (!like.deleteFlag) {
                likeDao.updateDeleteFlag({
                    userId: params.userId,
                    postId: params.postId,
                    deleteFlag: true
                }, callback);
            }
        }
    ], callback);
}

var service = new LikeService();
module.exports = service;
