/*
 * root page.
 */

// thier party
var async = require('async');
var _ = require('underscore');
var validator = require('validator');

// dao
userDao = require('dao/userDao');
user2MapDao = require('dao/user2MapDao');
user2TreasureDao = require('dao/user2TreasureDao');

exports.init = function(app){

    // TOPページを取得
    app.get('/', function(req, res) {
        res.send({key: 'value'});
    });

    // listUser
    app.get('/listUser', function(req, res) {

        res.send({key: 'value'});
    });

    // getUserStatus
    app.get('/getUserStatus/:userId', function(req, res) {
        async.parallel({
            user: function(callback) {
                userDao.getByUserId(req.param('userId'), callback);
            },
            user2map: function(callback) {
                user2MapDao.getByUserId(req.param('userId'), callback);
            },
            user2treasureList: function(callback) {
                user2TreasureDao.getListByUserId(req.param('userId'), callback);
            },
            // map:
        }, function(error, result) {
            var treasureIdList  = _.pluck(result.user2treasureList, 'treasureId');
            res.send(JSON.stringify({
                result: true,
                data: {
                    userId: result.user.userId,
                    createDate: result.user.userCreateDate,
                    actionPoint: result.user.userActionPoint,
                    mapId: result.user2map.mapId,
                    treasures: treasureIdList
                }
            }));
        });
    });
}
