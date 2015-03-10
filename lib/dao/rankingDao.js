// third party
var util = require('util');
var _ = require('underscore');

// util
var validator = require('util/validator');

// base
var BaseDao = require('./baseDao');

var RankingDao = function() {
    this.name = 'map';
}
util.inherits(RankingDao, BaseDao);

/**
 * userIdからuserを取得
 * param {int} userId
 * result {Object} user
 *
 **/
RankingDao.prototype.getByRankingId = function(rankingId, callback) {
    try {
        validator.string(rankingId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    var connection = self.connection;
    connection.query('select * from ranking where rankingId = ' +  '"' + rankingId + '"', function(error, result) {
        callback(error, _.first(result));
    });
}

var dao = new RankingDao();
dao.init();
module.exports = dao;
