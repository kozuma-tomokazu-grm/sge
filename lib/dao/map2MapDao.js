// third party
var util = require('util');
var _ = require('underscore');

// util
var validator = require('util/validator');

// base
var BaseDao = require('./baseDao');

var Map2MapDao = function() {
    this.name = 'map';
}
util.inherits(Map2MapDao, BaseDao);

/**
 * userIdからuserを取得
 * param {int} userId
 * result {Object} user
 *
 **/
Map2MapDao.prototype.getListByMapIdFrom = function(mapIdFrom, callback) {
    try {
        validator.string(mapIdFrom);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    var connection = self.connection;
    connection.query('select * from map2map where mapIdFrom = ' +  '"' + mapIdFrom + '"', function(error, result) {
console.log('000000000')
        console.log(error)
        callback(error, result)
    });
}

var dao = new Map2MapDao();
dao.init();
module.exports = dao;
