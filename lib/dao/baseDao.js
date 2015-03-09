// third party
var _ = require('underscore');
var validator = require('util/validator');

var BaseDao = function() {
    this.name = null;
    this.schema = null;
};

BaseDao.prototype.init = function() {
    // schema
    var schema = require('schema/mongodb/' + this.name);
    this.schema = schema;
}

module.exports = BaseDao;