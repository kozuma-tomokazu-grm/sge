// third party
var util = require('util');
var _ = require('underscore');

// util
var validator = require('util/validator');

// base
var BaseDao = require('dao/baseDao');

var UserRelationShipDao = function() {
    this.name = 'userRelationShip';
}
util.inherits(UserRelationShipDao, BaseDao);

/**
 *　フォロー関係を追加
 *
 * param {Object} params
 * param {int} params.followUserId フォローしている側のユーザーID
 * param {int} params.followedUserId フォローされている側のユーザーID
 * result
 *
 **/
UserRelationShipDao.prototype.add = function(params, callback) {
    try {
        validator.has(params, ['followUserId', 'followedUserId']);
        validator.unsignedInteger(params.followUserId);
        validator.unsignedInteger(params.followedUserId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var schema = this.schema;
    var userRelationShip = new schema({
        followUserId:     params.followUserId,
        followedUserId: params.followedUserId
    });
    userRelationShip.save(callback);
}

/**
 * 両方のユーザーIdで取得を取得
 * param {int} followUserId フォローしている側のユーザーID
 * result {Object} userRelationShip
 *
 **/
UserRelationShipDao.prototype.getByFollowUserIdAndFollowedUserId = function(params, callback) {
    try {
        validator.has(params, ['followUserId', 'followedUserId']);
        validator.unsignedInteger(params.followUserId);
        validator.unsignedInteger(params.followedUserId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.findOne({
        followUserId: params.followUserId,
        followedUserId: params.followedUserId
    }, callback);
}

/**
 * 両方のユーザーIdで取得を取得
 * param {int} followUserId フォローしている側のユーザーID
 * result {Object} userRelationShip
 *
 **/
UserRelationShipDao.prototype.isFollow = function(params, callback) {
    try {
        validator.has(params, ['followUserId', 'followedUserId']);
        validator.unsignedInteger(params.followUserId);
        validator.unsignedInteger(params.followedUserId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.findOne({
        followUserId: params.followUserId,
        followedUserId: params.followedUserId,
        deleteFlag: false
    }, function(error, result) {
        if (error) {
            callback(error);
            return;
        }
        var isFollow = false;
        if (result) {
            isFollow = true;
        }
        callback(null, isFollow);
    });
}

/**
 * フォローしている側のユーザーIdで取得
 * param {int} followUserId フォローしている側のユーザーID
 * result {Object} room
 *
 **/
UserRelationShipDao.prototype.getListByFollowUserId = function(followUserId, callback) {
    try {
        validator.unsignedInteger(followUserId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.find({
        followUserId: followUserId,
        deleteFlag: false
    }, callback);
}

/**
 * フォローされている側のユーザーIDで取得
 * param {int} followedUserId フォローされている側のユーザーID
 * result {Object} userRelationShip
 *
 **/
UserRelationShipDao.prototype.getListByFollowedUserId = function(followedUserId, callback) {
    try {
        validator.unsignedInteger(followedUserId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.find({
        followedUserId: followedUserId,
        deleteFlag: false
    }, callback);
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
UserRelationShipDao.prototype.updateDeleteFlag = function(params, callback) {
    try {
        validator.has(params, ['followUserId', 'followedUserId', 'deleteFlag']);
        validator.unsignedInteger(params.followUserId);
        validator.unsignedInteger(params.followedUserId);
        validator.boolean(params.deleteFlag);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.update({
        followUserId: params.followUserId,
        followedUserId: params.followedUserId
    },
    {
        $set: {
            deleteFlag: params.deleteFlag
        }
    }, callback);
};

var dao = new UserRelationShipDao();
dao.init();
module.exports = dao;
