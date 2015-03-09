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
var TagRelationUserDao = function() {
    this.name = 'tagRelationUser';
}
util.inherits(TagRelationUserDao, BaseDao);

/**
 *　tagNameを追加
 *
 * param {Object} params
 * param {int} params.tagName タグネーム
 * param {int} params.userId 投稿ID
 * result
 *
 **/
TagRelationUserDao.prototype.add = function(params, callback) {
    try {
        validator.has(params, ['tagName', 'userId']);
        validator.string(params.tagName);
        validator.naturalInteger(params.userId);

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
 * param {int} followUserId フォローしている側のユーザーID
 * result {Object} userRelationShip
 *
 **/
TagRelationUserDao.prototype.getListByTagName = function(tagName, callback) {
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
 * param {int} followedUserId フォローされている側のユーザーID
 * result {Object} userRelationShip
 *
 **/
TagRelationUserDao.prototype.getListByUserId = function(userId, callback) {
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
        IndexName: "userIdIndex",
        KeyConditions: [
            self.docClient.Condition("userId", "EQ", userId)
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
 * param {int} params.followUserId フォローしている側のユーザーID
 * param {int} params.followedUserId フォローされている側のユーザーID
 * param {boolean} params.deleteFlag 削除フラグ
 *
 **/
TagRelationUserDao.prototype.updateDeleteFlag = function(params, callback) {
    try {
        validator.has(params, ['tagName', 'userId'])
        validator.string(params.tagName);
        validator.unsignedInteger(params.userId);
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
            userId: params.userId
        },
        UpdateExpression: "set deleteFlag = :deleteFlag",
        ExpressionAttributeValues: {
            ":deleteFlag":  params.deleteFlag
        }
    }, callback);
};

var dao = new TagRelationUserDao();
dao.init();
module.exports = dao;
