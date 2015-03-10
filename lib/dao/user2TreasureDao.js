// third party
var util = require('util');
var _ = require('underscore');

// util
var validator = require('util/validator');

// base
var BaseDao = require('./baseDao');

var User2TreasureDao = function() {
    this.name = 'user2map';
}
util.inherits(User2TreasureDao, BaseDao);

/**
 * userIdからuserを取得
 * param {int} userId
 * result {Object} user
 *
 **/
User2TreasureDao.prototype.getListByUserId = function(userId, callback) {
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
    connection.query('select * from user2treasure where userId = ' +  '"' + userId + '"', function(error, result) {
console.log('11111111')
        console.log(result);
        console.log('11111111')
        callback(error, result)
    });
}

var dao = new User2TreasureDao();
dao.init();
module.exports = dao;
