// third party
var _ = require('underscore');
var util = require('util');

// util
var Code = require('util/code');
var validator = require('util/validator');

// base
var BaseJsonDao = require('dao/baseJsonDao');

var FacebookNotificationDao = function() {
    this.name = 'facebookNotification';
}
util.inherits(FacebookNotificationDao, BaseJsonDao);

FacebookNotificationDao.prototype.code = new Code([
    // コメント
    'comment',
    // フォロー
    'follow',
    // マッチング
    'matching'
]);

var dao = new FacebookNotificationDao();
dao.init();
module.exports = dao;
