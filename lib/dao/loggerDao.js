// third party
var util = require('util');
var _ = require('underscore');

// util
var validator = require('util/validator');

// base
var BaseDao = require('./baseDao');

var LoggerDao = function() {
    this.name = 'logger';
}
util.inherits(LoggerDao, BaseDao);

LoggerDao.prototype.addLog = function(params) {
    var schema = this.schema;
    var logger = new schema(params);
    logger.save();
};

var dao = new LoggerDao();
dao.init();
module.exports = dao;