// third party
var util = require('util');
var _ = require('underscore');

// util
var validator = require('util/validator');

// base
var BaseDao = require('./baseDao');

/**
 *
 * @fileOverview タグDAO
 **/
var TagRelationPostDao = function() {
    this.name = 'tagRelationPost';
}
util.inherits(TagRelationPostDao, BaseDao);

/**
 *　tagNameを追加
 *
 * param {Object} params
 * param {int} params.tagName タグネーム
 * param {int} params.postId 投稿ID
 * result
 *
 **/
TagRelationPostDao.prototype.add = function(params, callback) {
    try {
        validator.has(params, ['tagName', 'postId']);
        validator.string(params.tagName);
        validator.naturalInteger(params.postId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.putItem(params, callback);
}

/**
 * 両方のユーザーIdで取得
 * param {int} tagName タグネーム
 * result {Object} tagRelationPost
 *
 **/
TagRelationPostDao.prototype.getListByTagName = function(tagName, callback) {
    try {
        validator.string(tagName);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.docClient.query({
        TableName: self.name,
        KeyConditions: [
            self.docClient.Condition("tagName", "EQ", tagName)
        ],
        QueryFilter: [
            self.docClient.Condition("deleteFlag", "EQ", false)
        ]
    }, function(error, result) {
        if (error) {
            callback(error);
            return;
        }
        if (!result || result.Items.length === 0) {
            callback(null, []);
            return;
        }
        callback(null, result.Items);
    });
};

/**
 * フォローされている側のユーザーIDで取得
 * param {int} params.postId 投稿ID
 * result {Object} tagRelationPost
 *
 **/
TagRelationPostDao.prototype.getListByPostId = function(postId, callback) {
    try {
        validator.unsignedInteger(postId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.docClient.query({
        TableName: self.name,
        IndexName: "postIdIndex",
        KeyConditions: [
            self.docClient.Condition("postId", "EQ", postId)
        ],
        QueryFilter: [
            self.docClient.Condition("deleteFlag", "EQ", false)
        ]
    }, function(error, result) {
        if (error) {
            callback(error);
            return;
        }
        if (!result || result.Items.length === 0) {
            callback(null, []);
            return;
        }
        callback(null, result.Items);
    });
}

/**
 * 削除
 *
 * param {Object} params
 * param {int} params.tagName タグネーム
 * param {int} params.postId 投稿ID
 * param {boolean} params.deleteFlag デリートフラグ
 *
 **/
TagRelationPostDao.prototype.updateDeleteFlag = function(params, callback) {
    try {
        validator.has(params, ['tagName', 'postId', 'deleteFlag'])
        validator.string(params.tagName);
        validator.naturalInteger(params.postId);
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
            tagName: params.tagName,
            postId: params.postId
        },
        UpdateExpression: "set deleteFlag = :deleteFlag",
        ExpressionAttributeValues: {
            ":deleteFlag":  params.deleteFlag
        }
    }, callback);
};

var dao = new TagRelationPostDao();
dao.init();
module.exports = dao;
