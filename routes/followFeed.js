/*
 * follow feed page.
 */

// third party
var async = require('async');
var _ = require('underscore');
var validator = require('validator');

//service
var followUserService = require('service/followUserService');

// helper
var helper    = require('helpers/applicationHelper');

exports.init = function(app){
    app.get('/follow_feed', function(req, res) {
        var newMessageCount = 0;

        async.waterfall([
            function(callback) {
                followUserService.newarrivals({
                    userId: req.session.userId,
                    offset: 1,
                    limit: 9
                }, callback);
            }
        ], function(error, rooms) {
            if(error) {
                helper.responseError(res, error, 500);
                return;
            }

            rooms.forEach(function(room) {
                if (room.date) {
                        room.date = helper.time.createDisplayTime(room.date);
                }
            });

            res.render('followFeed/index', {
                title: 'WishMatch',
                rooms: rooms
            });
        });
    });

    app.get('/follow_feed/follow_feed_pager', function(req, res){
        var lessThanId = validator.toInt(req.param('less_than_id'));

        followUserService.getListByUserIdAndLimitAndLessThanId({
            userId: req.session.userId,
            limit: 9,
            lessThanId: lessThanId
        }, function(error, rooms) {
            if(error) {
                helper.responseError(res, error, 500);
                return;
            }
            rooms.forEach(function(room) {
                if (room.date) {
                    room.date = helper.time.createDisplayTime(room.date);
                }
            });

            res.contentType('application/json');
            res.send(JSON.stringify(rooms));
        });
    });
}
