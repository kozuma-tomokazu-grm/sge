// third party
var util = require('util');
var _ = require('underscore');

// util
var validator = require('util/validator');

// base
var BaseDao = require('./baseDao');

var MapDao = function() {
    this.name = 'map';
}
util.inherits(UserDao, BaseDao);

/**
 * userIdからuserを取得
 * param {int} userId
 * result {Object} user
 *
 **/
MapDao.prototype.getByMapId = function(userId, callback) {
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
    connection.query('select * from user where userId = ' +  '"' + userId + '"', function(error, result) {
    // connection.end();
    if (error) {
        callback(error);
        return
    }
    callback(null, _.first(result));
   });
}

var dao = new MapDao();
dao.init();
module.exports = dao;
