/*
 * root page.
 */

// thier party
var async = require('async');
var _ = require('underscore');
var validator = require('validator');

// service
var postService = require('service/postService');

// dao
var messageGroupDao = require('dynamodb/dao/messageGroupDao');

// helper
var helper = require('helpers/applicationHelper');

exports.init = function(app){

    // facebook app リダイレクト用path
    app.post('/non_csrf', function(req, res) {
        res.redirect('/');
    });

    // TOPページを取得
    app.get('/', function(req, res) {
        var rooms;
        var newMessageCount = 0;

        async.waterfall([
            function(callback) {
                // 投稿情報を取得
                postService.getList({
                    userId: req.session.userId,
                    offset: 1,
                    limit: 9
                }, function(error, result) {
                    if (error) {
                        callback(erorr);
                        return;
                    }

                    rooms = result;
                    rooms.forEach(function(room) {
                        if (room.date) {
                            room.date = helper.time.createDisplayTime(room.date);
                        }
                    });

                    callback();
                });
            },
            function(callback) {
                // 新着メッセージを計測
                messageGroupDao.getNewMessageGroupListByFromUserId(req.session.userId, function(error, newMessageGroupList) {
                    if (error) {
                        callback(error);
                        return;
                    }

                    newMessageCount = newMessageGroupList.length;
                    callback();
                });
            }
        ], function(error) {
            if (error) {
                helper.responseError(res, error, 500);
                return;
            }
            // console.log('2222222222222222');
            // console.log(res.render());
            res.serializeSend(JSON.stringify({
                title: 'WishMatch',
                rooms: rooms,
                newMessageCount: newMessageCount
            }));
            // res.render('index', {
            //     title: 'WishMatch',
            //     rooms: rooms,
            //     newMessageCount: newMessageCount
            // });
        });
    });

    app.get('/newarrivals', function(req, res){
        var lessThanId = parseInt(req.param('less_than_id'));
        var offset = parseInt(req.param('offset'));

        if(offset != parseInt(offset)){
            helper.apiResponseError(res, null, 404);
            return;
        }
        // 投稿情報を取得
        postService.getListByLessThanId({
            lessThanId: lessThanId,
            offset: offset,
            limit: 9,
            userId: req.session.userId
        }, function(error, result){
            if(error) {
                helper.apiResponseError(res, error, 500);
                return;
            }
            res.contentType('application/json');
            res.send(JSON.stringify(result));
        });
    });
}
