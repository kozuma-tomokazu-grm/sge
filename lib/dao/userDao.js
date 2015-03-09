// third party
var util = require('util');
var _ = require('underscore');

// util
var validator = require('util/validator');

// base
var BaseDao = require('./baseDao');

var UserDao = function() {
    this.name = 'user';
}
util.inherits(UserDao, BaseDao);

/**
 * 新規userをDBに追加
 * param {Object} params
 * result
 *
 **/
UserDao.prototype.add = function(params, callback) {
    var schema = this.schema;
    var user = new schema({
        facebookId: params.facebookId,
        twitterId: params.twitterId,
        username: params.username,
        gender: params.gender,
        email: params.email,
        imagePath: params.imagePath,
        wishListUrl: params.wishListUrl
    });
    user.save(callback);
}

/**
 * userIdからuserを取得
 * param {int} userId
 * result {Object} user
 *
 **/
UserDao.prototype.getByUserId = function(userId, callback) {
    try {
        validator.unsignedInteger(userId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.findOne({
        userId: userId
    }, callback);
}

/**
 * facebookIdからuserを取得
 * param {int} userId
 * result {Object} user
 *
 **/
UserDao.prototype.getByFacebookId = function(facebookId, callback) {
    try {
        validator.string(facebookId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.findOne({
        facebookId: facebookId
    }, callback);
}

/**
 *
 * twitterIdからuserを取得
 * param {int} userId
 * result {Object} user
 *
 **/
UserDao.prototype.getByTwitterId = function(twitterId, callback) {
    try {
        // validator.unsignedInteger(twitterId);
        validator.string(twitterId);
        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.findOne({
        twitterId: twitterId
    }, callback);
}

UserDao.prototype.getMapByUserIdList = function(userIdList, callback) {
    try {
        validator.array(userIdList);
        _.each(userIdList, function(userId) {
            validator.unsignedInteger(userId);
        });

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.find({userId: { $in: userIdList }}, function(error, result){
        callback(error, _.indexBy(result, 'userId'));
    });
}

/**
 *
 * userIdListからuserListを取得
 * param {array} userIdList
 * result {Object} user
 *
 **/
UserDao.prototype.getListByUserIdList = function(userIdList, callback) {
    try {
        validator.array(userIdList);
        _.each(userIdList, function(userId) {
            validator.unsignedInteger(userId);
        });

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.find({
        userId: { $in: userIdList }
    }, callback);
}

/**
 * userを新着順に取得
 **/
UserDao.prototype.getRecentLoginUserList = function(params, callback) {
    try {
        validator.has(params, ['updateDatetime', 'limit']);
        validator.date(params.updateDatetime);
        validator.unsignedInteger(params.limit);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema
        .find({
            updateDatetime: {$lt: params.updateDatetime},
            deleteFlag: false
        })
        .sort({ updateDatetime: -1 })
        .limit(params.limit)
        .exec(callback);
}

/**
 * userの更新
 * param {int} userId
 **/
UserDao.prototype.updateByUserId = function(userId, userInfo, callback) {
    try {
        validator.unsignedInteger(userId);
        validator.object(userInfo);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.update(
        //where句
        {userId: userId},
        //set句
        {
            $set: userInfo
        }, callback);
}

/**
 * 最終ログイン日時の更新
 * param {object} params
 * param {number} params.userId
 * param {date} params.lastLoginDatetime
 **/
UserDao.prototype.updateUpdateDatetimeByUserId = function(params, callback) {
    try {
        validator.has(params, ['userId', 'updateDatetime']);
        validator.unsignedInteger(params.userId);
        validator.date(params.updateDatetime);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.update(
        //where句
        {userId: params.userId},
        //set句
        {
            $set: {updateDatetime: params.updateDatetime}
        }, callback);
}

/**
 * deleteFlagによる削除
 * param {int} userId
 **/
UserDao.prototype.deleteByUserId = function(userId, callback) {
    try {
        validator.unsignedInteger(userId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.update(
        //where句
        {userId: userId},
        //set句
        {
            $set: {
                deleteFlag: true,
                updateDatetime: new Date()
            }
        }, callback);
}

var dao = new UserDao();
dao.init();
module.exports = dao;
