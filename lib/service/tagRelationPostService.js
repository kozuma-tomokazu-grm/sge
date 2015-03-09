// third party
var async = require('async');
var _ = require('underscore');

// util
var validator = require('util/validator');

// dao
var tagRelationPostDao = require('dao/tagRelationPostDao');

var tagRelationPostService = function() {
    this.name = 'tagRelationPost';
}

tagRelationPostService.prototype.insertOrUpdateByPostIdAndTagNameList = function(params, callback) {
    try {
        validator.has(params, ['postId', 'tagNameList'])
        validator.naturalInteger(params.postId);
        validator.array(params.tagNameList);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var addTagNameList = [];
    var deleteTagNameList = [];

    async.waterfall([
        // 未登録のタグと削除するタグを取得
        function(callback) {
            tagRelationPostDao.getListByPostId(params.postId, function(error, tagRelationPostList) {
                if (error){
                    callback(error);
                    return;
                }

                // 登録済みのタグ名の配列を作成
                var addedTagNameList = _.map(tagRelationPostList, function(tagRelationPost) {
                    return tagRelationPost.tagName;
                });

                // 未登録のタグ名を取得
                addTagNameList = _.difference(params.tagNameList, addedTagNameList);

                // 削除するタグ名を取得
                deleteTagNameList = _.difference(addedTagNameList, params.tagNameList);
                callback();
            });
        },
        //　未登録のタグを登録
        function(callback) {
            async.eachSeries(addTagNameList, function(addTagName, callback) {
                // 空文字列の場合は処理を抜ける
                if (addTagName === '') {
                    callback();
                    return;
                }
                tagRelationPostDao.add({
                    postId: params.postId,
                    tagName: addTagName
                }, callback);
            }, function(error) {
                callback(error);
            });
        },
        // 削除するタグを削除
        function(callback) {
            async.eachSeries(deleteTagNameList, function(deleteTagName, callback) {
                // 空文字列の場合は処理を抜ける
                if (deleteTagName === '') {
                    callback();
                    return;
                }
                tagRelationPostDao.updateDeleteFlag({
                    postId: params.postId,
                    tagName: deleteTagName,
                    deleteFlag: true
                }, callback);
            }, function(error) {
                callback(error);
            });
        }
    ], function(error, result) {
        callback(error);
    });
}

var service = new tagRelationPostService();
module.exports = service;
