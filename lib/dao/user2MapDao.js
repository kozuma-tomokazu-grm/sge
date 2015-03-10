// third party
var util = require('util');
var _ = require('underscore');

// util
var validator = require('util/validator');

// base
var BaseDao = require('./baseDao');

var User2MapDao = function() {
    this.name = 'user2map';
}
util.inherits(User2MapDao, BaseDao);

/**
 * userIdからuserを取得
 * param {int} userId
 * result {Object} user
 *
 **/
User2MapDao.prototype.getByUserId = function(userId, callback) {
    try {
        validator.string(userId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    var connection = self.connection;
    // connection.connect();
    connection.query('select * from user2map where userId = ' +  '"' + userId + '"', function(error, result) {
    // connection.end();
    if (error) {
        callback(error);
        return
    }
    callback(null, _.first(result));
   });
}

var dao = new User2MapDao();
dao.init();
module.exports = dao;
