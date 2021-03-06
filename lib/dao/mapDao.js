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
util.inherits(MapDao, BaseDao);

/**
 * userIdからuserを取得
 * param {int} userId
 * result {Object} user
 *
 **/
MapDao.prototype.getByMapId = function(mapId, callback) {
    try {
        validator.string(mapId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    var connection = self.connection;
    connection.query('select * from map where mapId = ' +  '"' + mapId + '"', function(error, result) {
    if (error) {
        callback(error);
        return
    }
    console.log(error);
    console.log(result);
    callback(null, _.first(result));
   });
}

var dao = new MapDao();
dao.init();
module.exports = dao;
