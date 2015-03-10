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
 * userIdからuserを取得
 * param {int} userId
 * result {Object} user
 *
 **/
UserDao.prototype.getByUserId = function(userId, callback) {
    try {
        validator.string(userId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    var connection = self.connection;
    connection.query('select * from user where userId = ' +  '"' + userId + '"', function(error, result) {
    if (error) {
        callback(error);
        return
    }
    callback(null, _.first(result));
   });
}

/**
 * userIdからuserを取得
 * param {int} userId
 * result {Object} user
 *
 **/
UserDao.prototype.updateUserActionPointByUserId = function(params, callback) {
    try {
        validator.string(params.userId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    var connection = self.connection;
    connection.query('update user set userActionPoint = :userActionPoint where userId = ' +  '"' + params.userId + '";', {
        userActionPoint: params.value
    }, function(error, result) {
        console.log(error)
        console.log(result)
        if (error) {
            callback(error);
            return
        }
        callback();
    });
}

var dao = new UserDao();
dao.init();
module.exports = dao;
