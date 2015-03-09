// third party
var util = require('util');
var _ = require('underscore');

// util
var validator = require('util/validator');

// base
var BaseDao = require('./baseDao');

/**
 *
 * @fileOverview タグリレーションユーザーDAO
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

    var schema = this.schema;
    var tagRelationUser = new schema({
        tagName: params.tagName,
        userId: params.userId,
        insertDatetime: new Date(),
        updateDatetime: new Date()
    });
    tagRelationUser.save(callback);
}

/**
 * 両方のユーザーIdで取得
 * param {int} tagName タグネーム
 * result {Object} tagRelationUser
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
    self.schema.find({
        tagName: tagName
    }, callback);
};

/**
 * フォローされている側のユーザーIDで取得
 * param {int} userId ユーザーID
 * result {Object} tagRelationUser
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
    self.schema.find({
        userId: userId
    }, callback);
}

/**
 * 削除
 *
 * param {Object} params
 * param {int} params.tagName タグネーム
 * param {int} params.userId ユーザーID
 * param {boolean} params.deleteFlag 削除フラグ
 *
 **/
TagRelationUserDao.prototype.updateDeleteFlag = function(params, callback) {
    try {
        validator.has(params, ['tagName', 'userId', 'deleteFlag'])
        validator.string(params.tagName);
        validator.unsignedInteger(params.userId);
        validator.boolean(params.deleteFlag);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.update(
        //where句
        {
            tagName: params.tagName,
            userId: params.userId
        },
        //set句
        {
            $set: {
                deleteFlag: prams.deleteFlag
            }
        }, callback);
};

var dao = new TagRelationUserDao();
dao.init();
module.exports = dao;
