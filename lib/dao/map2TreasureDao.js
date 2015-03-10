// third party
var util = require('util');
var _ = require('underscore');

// util
var validator = require('util/validator');

// base
var BaseDao = require('./baseDao');

var Map2TreasureDao = function() {
    this.name = 'map';
}
util.inherits(Map2TreasureDao, BaseDao);

/**
 * userIdからuserを取得
 * param {int} userId
 * result {Object} user
 *
 **/
Map2TreasureDao.prototype.getListByMapId = function(mapId, callback) {
    try {
        validator.string(mapId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    var connection = self.connection;
    connection.query('select * from map2treasure where mapId = ' +  '"' + mapId + '"', function(error, result) {
        callback(error, result)
    });
}

var dao = new Map2TreasureDao();
dao.init();
module.exports = dao;
