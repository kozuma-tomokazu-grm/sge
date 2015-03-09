// third party
var async = require('async');
var _ = require('underscore');

// util
var validator = require('util/validator');

// dao
var tagRelationUserDao = require('dao/tagRelationUserDao');

var tagRelationUserService = function() {
    this.name = 'tagRelationUser';
}

tagRelationUserService.prototype.insertOrUpdateByUserIdAndTagNameList = function(params, callback) {
    try {
        validator.has(params, ['userId', 'tagNameList'])
        validator.naturalInteger(params.userId);
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
            tagRelationUserDao.getListByUserId(params.userId, function(error, tagRelationUserList){
                if (error){
                    callback(error);
                    return;
                }
                // 登録済みのタグ名の配列を作成
                var addedTagNameList = _.map(tagRelationUserList, function(tagRelationUser) {
                    return tagRelationUser.tagName;
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
                tagRelationUserDao.add({
                    userId: params.userId,
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
                tagRelationUserDao.updateDeleteFlag({
                    userId: params.userId,
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

var service = new tagRelationUserService();
module.exports = service;
