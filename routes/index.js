/*
 * root page.
 */

// thier party
var async = require('async');
var _ = require('underscore');
var validator = require('validator');

// dao
mapDao = require('dao/mapDao');
map2MapDao = require('dao/map2MapDao');
map2TreasureDao = require('dao/map2TreasureDao');
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

    app.get('/getUserStatus/:userId', function(req, res) {
        getUserStatus(req.param('userId'), function(error, result) {
            var treasureIdList  = _.pluck(result.user2treasureList, 'treasureId');
            res.send(JSON.stringify({
                result: true,
                data: {
                    userId: result.user.userId,
                    createDate: result.user.userCreateDateTime,
                    actionPoint: result.user.userActionPoint,
                    mapId: result.user2map.mapId,
                    treasures: treasureIdList
                }
            }));
        });
    });

    app.get('/getMyMap/:userId', function(req, res) {
        async.waterfall([
            function(callback) {
                user2MapDao.getByUserId(req.param('userId'), callback);
            },
            function(user2map, callback) {
                map2MapDao.getListByMapIdFrom(user2map.mapId, callback)
            }
        ], function(error, result) {

            var maps = [];
            var map2MapList = [];
            _.each(result, function(map) {
                map2MapList = [];
                map2MapList.push(map.mapIdTo);
                map2MapList.push(map.fromToMoveCost);
                maps.push(map2MapList);
            });

            res.send(JSON.stringify({
                result: true,
                data:  maps
            }));
        });
    });

    // getMap
    app.get('/getMap/:mapId', function(req, res) {
        async.parallel({
            map: function(callback) {
                mapDao.getByMapId(req.param('mapId'), callback)
            },
            map2MapList: function(callback) {
                map2MapDao.getListByMapIdFrom(req.param('mapId'), callback)
            },
            map2TreasureList: function(callback) {
                map2TreasureDao.getListByMapId(req.param('mapId'), callback);
            },
            users2MapList: function(callback) {
                user2MapDao.getListByMapId(req.param('mapId'), callback);
            }
        }, function(error, result) {

            var userList = _.pluck(result.users2MapList, 'userId');
            var treasureList = _.pluck(result.map2TreasureList, 'treasureId');

            var maps = [];
            var map2MapList = [];
            _.each(result.map2MapList, function(map) {
                map2MapList = [];
                map2MapList.push(map.mapIdTo);
                map2MapList.push(map.fromToMoveCost);
                maps.push(map2MapList);
            })

            res.send(JSON.stringify({
                result: true,
                data: {
                    mapId: req.param('mapId'),
                    mapName: result.map.mapName,
                    mapType: result.map.mapType,
                    mapTreasureRate: result.map.mapTreasureRate,
                    users: userList,
                    maps: maps,
                    treasures: treasureList
                }
            }))
        });
    });

    // updateUserActionPoint
    // app.put('/updateUserActionPoint/:userId', function(req, res) {
    //     userDao.getByUserId(req.param('userId'), function(error, result) {
    //         console.log(result)
    //         console.log(req.param('value'))
    //         async.waterfall([
    //             function(callback) {
    //                 if (result.userActionPoint + req.param('value') < 0) {
    //                     userDao.updateUserActionPointByUserId({
    //                         userId: req.param('userId'),
    //                         value: 0
    //                     }, function(error, result) {
    //                         calblack()
    //                     })
    //                 } else {
    //                     userDao.updateUserActionPointByUserId({
    //                         userId: req.param('userId'),
    //                         value: result.userActionPoint + req.param('value')
    //                     }, function(error, result) {
    //                         console.log('000000000000000')
    //                         callback();
    //                     });
    //                 }
    //             },
    //             function(callback) {
    //                 console.log('111111111');
    //                 console.log(typeof callback)
    //                 getUserStatus(req.param('userId'), function(error, result) {
    //                     callback(error, result);
    //                 });
    //             }
    //         ], function(error, result) {
    //             console.log(result);
    //             var treasureIdList  = _.pluck(result.user2treasureList, 'treasureId');
    //             res.send(JSON.stringify({
    //                 result: true,
    //                 data: {
    //                     userId: result.user.userId,
    //                     createDate: result.user.userCreateDateTime,
    //                     actionPoint: result.user.userActionPoint,
    //                     mapId: result.user2map.mapId,
    //                     treasures: treasureIdList
    //                 }
    //             }));
    //         })
    //     });
    // });

    // app.get('/updateUserActionPoint/:userId', function(req, res) {
    //     userDao.getByUserId(req.param('userId'), function(error, result) {
    //         console.log(result)
    //         console.log(req.param('value'))
    //         async.waterfall([
    //             function(callback) {
    //                 if (result.userActionPoint - req.param('value') < 0) {
    //                     userDao.updateUserActionPointByUserId({
    //                         userId: req.param('userId'),
    //                         value: 0
    //                     }, function(error, result) {
    //                         calblack()
    //                     })
    //                 } else {
    //                     userDao.updateUserActionPointByUserId({
    //                         userId: req.param('userId'),
    //                         value: result.userActionPoint + req.param('value')
    //                     }, function(error, result) {
    //                         console.log('000000000000000')
    //                         callback();
    //                     });
    //                 }
    //             },
    //             function(callback) {
    //                 console.log('111111111');
    //                 console.log(typeof callback)
    //                 getUserStatus(req.param('userId'), function(error, result) {
    //                     callback(error, result);
    //                 });
    //             }
    //         ], function(error, result) {
    //             console.log(result);
    //             var treasureIdList  = _.pluck(result.user2treasureList, 'treasureId');
    //             res.send(JSON.stringify({
    //                 result: true,
    //                 data: {
    //                     userId: result.user.userId,
    //                     createDate: result.user.userCreateDateTime,
    //                     actionPoint: result.user.userActionPoint,
    //                     mapId: result.user2map.mapId,
    //                     treasures: treasureIdList
    //                 }
    //             }));
    //         })
    //     });
    // });
}
var getUserStatus = function(userId, callback) {
    async.parallel({
        user: function(callback) {
            userDao.getByUserId(userId, callback);
        },
        user2map: function(callback) {
            user2MapDao.getByUserId(userId, callback);
        },
        user2treasureList: function(callback) {
            user2TreasureDao.getListByUserId(userId, callback);
        }
    }, callback);
}
