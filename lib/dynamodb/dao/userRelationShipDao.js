// third party
var util = require('util');
var _ = require('underscore');

// util
var validator = require('util/validator');

// base
var BaseDao = require('./baseDao');

/**
 *
 * @fileOverview ユーザリレーションシップDAO
 **/
var UserRelationShipDao = function() {
    this.name = 'userRelationShip';
}
util.inherits(UserRelationShipDao, BaseDao);

/**
 *　フォロー関係をDBに追加
 *
 * param {Object} params
 * param {int} params.followUserId フォローしている側のユーザーID
 * param {int} params.followedUserId フォローされている側のユーザーID
 * result
 *
 **/
UserRelationShipDao.prototype.add = function(params, callback) {
    try {
        validator.has(params, ['followUserId', 'followedUserId'])
        validator.unsignedInteger(params.followUserId);
        validator.unsignedInteger(params.followedUserId);

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
UserRelationShipDao.prototype.getByFollowUserIdAndFollowedUserId = function(params, callback) {
    try {
        validator.has(params, ['followUserId', 'followedUserId'])
        validator.unsignedInteger(params.followUserId);
        validator.unsignedInteger(params.followedUserId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.docClient.query({
        TableName: self.name,
        KeyConditions: [
            self.docClient.Condition("followUserId", "EQ", params.followUserId),
            self.docClient.Condition("followedUserId", "EQ", params.followedUserId)
        ],
        QueryFilter: [self.docClient.Condition("deleteFlag", "EQ", false)]
    }, function(error, result) {
        if (error) {
            callback(error);
            return;
        }
        callback(null, _.first(result.Items) || null);
    });
};

/**
 * フォローしている側のユーザーIdで取得
 * param {int} followUserId フォローしている側のユーザーID
 * result {Object} フォローしているユーザーリスト
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
    self.docClient.query({
        TableName: self.name,
        KeyConditions: [
            self.docClient.Condition("followUserId", "EQ", followUserId)
        ],
        QueryFilter: [self.docClient.Condition("deleteFlag", "EQ", false)]
    }, function(error, result) {
        if (error) {
            callback(error);
            return;
        }
        callback(null, result.Items || []);
    });
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
    self.docClient.query({
        TableName: self.name,
        IndexName: "followedUserIdIndex",
        KeyConditions: [
            self.docClient.Condition("followedUserId", "EQ", followedUserId)
        ],
        QueryFilter: [
            self.docClient.Condition("deleteFlag", "EQ", false)
        ]
    }, function(error, result) {
        if (error) {
            callback(error);
            return;
        }
        callback(null, result.Items || [])
    });
}

/**
 * 削除
 *
 * param {Object} params
 * param {int} params.followUserId フォローしている側のユーザーID
 * param {int} params.followedUserId フォローされている側のユーザーID
 * param {boolean} params.deleteFlag デリートフラグ
 *
 **/
UserRelationShipDao.prototype.updateDeleteFlag = function(params, callback) {
    try {
        validator.has(params, ['followUserId', 'followedUserId', 'deleteFlag'])
        validator.unsignedInteger(params.followUserId);
        validator.unsignedInteger(params.followedUserId);
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
            followUserId: params.followUserId,
            followedUserId: params.followedUserId
        },
        UpdateExpression: "set deleteFlag = :deleteFlag",
        ExpressionAttributeValues: {
            ":deleteFlag":  params.deleteFlag
        }
    }, callback);
};

var dao = new UserRelationShipDao();
dao.init();
module.exports = dao;

