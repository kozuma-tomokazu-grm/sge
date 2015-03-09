// third party
var _ = require('underscore');
var util = require('util');

// util
var validator = require('util/validator');

// base
var BaseJsonDao = require('dao/baseJsonDao');

var HourDao = function() {
    this.name = 'hour';
}
util.inherits(HourDao, BaseJsonDao);

var dao = new HourDao();
dao.init();
module.exports = dao;