/*
 * follow feed page.
 */

// third party
var async = require('async');
var config = require('config');
var _ = require('underscore');
var validator = require('validator');

//service
var userService = require('service/userService');

// dao
var messageGroupDao = require('dynamodb/dao/messageGroupDao');

// helper
var helper    = require('helpers/applicationHelper');

exports.init = function(app){
    app.get('/user_list_pager', function(request, response) {
        var updateDatetime = helper.time.parseISOString(request.param('updateDatetime'));

        userService.getRecentLoginUserList({
            userId: request.session.userId,
            updateDatetime: updateDatetime,
            limit: config.limit
        }, function(error, userList) {
            if (error) {
                helper.responseError(response, error, 500);
                return;
            }

            var followMap = {};
            _.each(userList, function(user) {
                followMap[user.userId] = user.isFollowing;
            });

            response.contentType('application/json');
            response.send(JSON.stringify({
                userList: userList,
                followMap: followMap
            }));
        });
    });

    app.get('/user_list', function(request, response) {
        async.waterfall([
            function(callback) {
                userService.getRecentLoginUserList({
                    userId: request.session.userId,
                    updateDatetime: new Date(),
                    limit: config.limit
                }, callback);
            }
        ], function(error, userList) {
            if (error) {
                helper.responseError(response, error, 500);
                return;
            }
    
            response.render('userList', {
                userList: userList,
            });
        });
    });
}
