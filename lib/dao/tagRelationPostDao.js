// third party
var util = require('util');
var _ = require('underscore');

// util
var validator = require('util/validator');

// base
var BaseDao = require('./baseDao');

/**
 *
 * @fileOverview タグリレーションポストDAO
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

    var schema = this.schema;
    var tagRelationPost = new schema({
        tagName: params.tagName,
        postId: params.postId,
        insertDatetime: new Date(),
        updateDatetime: new Date()
    });
    tagRelationPost.save(callback);
}

/**
 * 両方のポストIDで取得
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
    self.schema.find({
        tagName: tagName
    }, callback);
};

/**
 * フォローされている側のポストIDで取得
 * param {int} postId ポストID
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
    self.schema.find({
        postId: postId
    }, callback);
}

/**
 * 削除
 *
 * param {Object} params
 * param {int} params.tagName タグネーム
 * param {int} params.postId ポストID
 * param {boolean} params.deleteFlag 削除フラグ
 *
 **/
TagRelationPostDao.prototype.updateDeleteFlag = function(params, callback) {
    try {
        validator.has(params, ['tagName', 'postId', 'deleteFlag'])
        validator.string(params.tagName);
        validator.unsignedInteger(params.postId);
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
            postId: params.postId
        },
        //set句
        {
            $set: {
                deleteFlag: prams.deleteFlag
            }
        }, callback);
};

var dao = new TagRelationPostDao();
dao.init();
module.exports = dao;
