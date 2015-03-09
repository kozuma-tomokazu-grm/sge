/*
 * userRelationShip page.
 */

// third party
var async = require('async');
var validator = require('validator');

// dao
var facebookNotificationDao = require('dao/facebookNotificationDao');
var userDao = require('dao/userDao');
var userRelationShipDao = require('dynamodb/dao/userRelationShipDao');

// service
var userRelationShipService = require('service/userRelationShipService');
var userService = require('service/userService');
var facebookService = require('service/facebookService');

// helper
var helper  = require('helpers/applicationHelper');
var mailer    = require('mailer/applicationMailer');

exports.init = function(app) {

    // フォローする
    app.post('/user_relation_ship/follow', function(request, response) {
        var userId = request.session.userId;
        var followedUserId = validator.toInt(request.body.followedUserId);
        var status = 200;

        if (!followedUserId) {
            helper.responseError(response, error, 500);
            return;
        }

        async.waterfall([
            // followする
            function(callback) {
                userRelationShipService.follow({
                    followUserId: userId,
                    followedUserId: followedUserId
                }, function(error, result) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    if (!result) {
                        status = 500;
                    }
                    callback();
                });
            },
            // マッチングしているか判定
            function(callback) {
                userRelationShipService.checkMatching({
                    followUserId: userId,
                    followedUserId: followedUserId
                }, callback);
            },
            // お互いにfacebook通知を送信
            function(matchingFlag, callback) {
                if (!matchingFlag) {
                    callback(null, matchingFlag);
                    return;
                }
                userRelationShipService.matchingNotification({
                    toUserId: userId,
                    fromUserId: followedUserId
                }, callback);
            },
            function(matchingFlag, callback) {
                if (!matchingFlag) {
                    callback();
                    return;
                }

                userDao.getMapByUserIdList([userId, followedUserId], function(error, result) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    mailer.sendWishMatch(result[userId].email, {
                        subject: result[followedUserId].username + 'さんとマッチングしました！',
                        myName: result[userId].username,
                        yourName: result[followedUserId].username
                    });

                    mailer.sendWishMatch(result[followedUserId].email, {
                        subject: result[userId].username + 'さんとマッチングしました！',
                        myName: result[followedUserId].username,
                        yourName: result[userId].username
                    });

                    callback();
                });
            }
        ], function(error, result) {
            if (error) {
                helper.responseError(response, error, 500);
                return;
            }
            response.send({
                status: status
            });
        });
    });

    // フォローを解除する
    app.post('/user_relation_ship/unfollow', function(request, response) {
        var status = 200;

        var followedUserId = validator.toInt(request.param('followedUserId'));
        if (!followedUserId) {
            helper.responseError(response, error, 500);
            return;
        }

        userRelationShipService.unfollow({
            followUserId: request.session.userId,
            followedUserId: followedUserId
        }, function(error, result) {
            if (error) {
                helper.responseError(response, error, 500);
                return;
            }

            response.send({
                status: status
            });
        });
    });
}
