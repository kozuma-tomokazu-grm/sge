/*
 * room page.
 */

// third party
var async = require('async');
var config = require('config');
var _ = require('underscore');
var validator = require('validator');

// dao
var postDao = require('dao/postDao');
var likeDao = require('dao/likeDao');
var userDao = require('dao/userDao');
var commentDao = require('dao/commentDao');
var facebookNotificationDao = require('dao/facebookNotificationDao');
var messageGroupDao = require('dynamodb/dao/messageGroupDao');

// service
var userService = require('service/userService');
var postService = require('service/postService');
var followUserService = require('service/followUserService');
var likeService = require('service/likeService');

// helper
var helper = require('helpers/applicationHelper');
var mailer = require('mailer/applicationMailer');
var facebookService = require('service/facebookService');

exports.init = function(app) {

    app.post('/room/send_comment', function(request, response) {
        var userId = request.session.userId;
        var postId = validator.toInt(request.body.post_id);
        var content = validator.toString(request.body.content);

        if(!content || !postId || !userId){
            return res.redirect('/room/' + postId + '?error');
        }
        async.waterfall([
            // コメントを登録
            function(callback) {
                commentDao.addComment({
                    userId: userId,
                    postId: postId,
                    content: content
                }, function(error, result) {
                    callback(error);
                });
            },
            // 投稿情報を取得
            function(callback) {
                postDao.getByPostId(postId, callback);
            },
            // facebook通知を送信
            function(post, callback) {
                // ユーザーIDが一緒の場合は通知を送らない
                if (post.userId === userId) {
                    callback();
                    return;
                }
                facebookService.notification({
                    targetUserId: post.userId,
                    triggerUserId: userId,
                    code: facebookNotificationDao.code.comment
                }, function(error, result) {
                    if (error) {
                        helper.responseError(response, error, 500);
                        return;
                    }
                    callback();
                });
            }
        ], function(error, result) {
            if(error) {
                helper.responseError(response, error, 500);
                return;
            }
            response.redirect('/room/' + postId);
        });
    });

    app.post('/room/delete_comment', function(req, res){
        var commentId = validator.toInt(req.param('comment_id'));
        var userId = req.session.userId;

        commentDao.deleteComment(commentId, userId, function(err){
            if(err){
                helper.responseError(res, err, 500);
                return;
            }
            var backURL = req.header('Referer') || '/';
            res.redirect(backURL);
        });
    });

    app.get('/room/comment', function(req, res) {
        var postId = validator.toInt(req.param('room_id'));
        var updateDatetime = helper.time.parseISOString(req.param('updateDatetime'));
        if(!postId) {
            helper.apiResponseError(res, null, 404);
            return;
        }

        var result = {};
        result.comments = [];
        result.users = [];
        result.userIds = [];

        async.waterfall([
            // コメントを取得
            function(callback){
                commentDao.getListByPostIdAndUpdateDatetimeLimit({
                        postId: postId,
                        updateDatetime: updateDatetime,
                        limit: config.limit 
                    }, function(error, comments) {
                    if (error) {
                        callback(error);
                        return;
                    }

                    result.comments = comments;
                    var userIdList = [];
                    _.each(comments, function(comment){
                        userIdList.push(comment.userId);
                    });
                    result.userIdList = _.uniq(userIdList);

                    callback();
                });
            },
            // ユーザー情報を取得
            function(callback){
                userDao.getMapByUserIdList(result.userIdList, function(error, userMap){
                    if(error) {
                        callback(error);
                        return;
                    }
                    result.userMap = userMap;
                    callback();
                });
            }
        ], function(error) {
            if (error) {
                helper.apiResponseError(res, error, 500);
                return;
            }

            var data = [];
            _.each(result.comments, function(comment){
                var user = result.userMap[comment.userId];
                var isMine;
                isMine = user.userId === req.session.userId;

                data.push({
                    commentId: comment.commentId,
                    content: comment.content,
                    user: {
                        id: user.userId,
                        username: user.username,
                        imagePath: user.imagePath,
                    },
                    isMine: isMine,
                    updateDatetime: comment.updateDatetime, 
                    displayTime: helper.time.createDisplayTime(comment.updateDatetime),
                });
            });
            res.contentType('application/json');
            res.send(JSON.stringify(data));
        });
    });

    app.post('/room/like', function(req, res){
        var postId = validator.toInt(req.param('room_id'));
        var userId = req.session.userId;

        if (!postId) {
            helper.apiResponseError(res, null, 404);
            return;
        }
        // ログインしていなくてもlikeできる
        // if (!userId) {
        //     likeDao.visitorLike(roomId, function(err, data){
        //         if(err) {
        //             helper.apiResponseError(res, err, 500);
        //             return;
        //         }
        //         var rooms = data;
        //         var roomsJSON = JSON.stringify(rooms);
        //         res.contentType('application/json');
        //         res.send(roomsJSON);
        //     });
        //     return;
        // }
        likeService.like({
            userId: userId,
            postId: postId
        }, function(err, data){
            if(err) {
                helper.apiResponseError(res, err, 500);
                return;
            }
            var rooms = data;
            var roomsJSON = JSON.stringify(rooms);
            res.contentType('application/json');
            res.send(roomsJSON);
        });
    });

    app.post('/room/unlike', function(req, res){
        var postId = validator.toInt(req.param('room_id'));
        var userId = req.session.userId;

        if (!postId) {
            helper.apiResponseError(res, null, 404);
            return;
        }
        // ログインしていなくてもlikeできる
        // if (!userId) {
        //     likeDao.visitorLike(roomId, function(err, data){
        //         if(err) {
        //             helper.apiResponseError(res, err, 500);
        //             return;
        //         }
        //         var rooms = data;
        //         var roomsJSON = JSON.stringify(rooms);
        //         res.contentType('application/json');
        //         res.send(roomsJSON);
        //     });
        //     return;
        // }
        likeDao.updateDeleteFlag({
            postId: postId,
            userId: userId,
            deleteFlag: true
        }, function(error, data){
            if (error) {
                helper.apiResponseError(res, error, 500);
                return;
            }
            var rooms = data;
            var roomsJSON = JSON.stringify(rooms);
            res.contentType('application/json');
            res.send(roomsJSON);
        });
    });

    app.get('/room/:id', function(req, res) {
        var id = validator.toInt(req.param('id'));
        var postId;
        var result = {};
        var newMessageCount = 0;
        var userIdList = [];

        async.series({
            // 投稿情報を取得
            room: function(callback) {
                postDao.getByPostId(id, function(error, post) {
                    if (error) {
                        callback(erorr);
                        return;
                    }
                    userIdList = [post.userId];
                    postId = post.postId;
                    callback(null, post);
                });
            },
            // コメントを取得
            commentList: function(callback) {
                commentDao.getListByPostIdAndUpdateDatetimeLimit({
                        postId: postId,
                        updateDatetime: new Date(),
                        limit: config.limit
                    }, function(error, commentList) {
                    if (error) {
                        callback(error);
                        return;
                    }

                    _.each(commentList, function(comment) {
                        userIdList.push(comment.userId);
                    });
                    callback(null, commentList);
                });
            },
            // like数を取得
            likeCount: function(callback) {
                likeDao.getPostLikeCount(postId, callback);
            },
            // likeしている人の情報を取得
            likeList: function(callback) {
                likeDao.getListByPostId(postId, function(error, likeList) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    _.each(likeList, function(like) {
                        userIdList.push(like.userId);
                    });
                    callback(null, likeList);
                });
            },
            // likeしているか取得
            likeActive: function(callback) {
                likeDao.getUserLikeActive(postId, req.session.userId, callback);
            },
            // ユーザー情報を取得
            userMap: function(callback) {
                userIdList = _.uniq(userIdList);
                userDao.getMapByUserIdList(userIdList, callback);
            },
            socialModule: function(callback) {
                if (!req.param('posted')){
                    callback();
                    return;
                }
                helper.user.loginUser(req, function(error, loginUser){
                    if (!loginUser) {
                        callback();
                        return;
                    }
                    if (loginUser.facebookId){
                        callback(null, 'facebook');
                    } else if (loginUser.twitterId){
                        callback(null, 'twitter');
                    }
                    callback();
                });
            }
        }, function(error, result) {
            if (error) {
                helper.responseError(res, error, 500);
                return;
            }

            res.render('room', result);
        });
    });

    app.post('/room/delete', function(req, res){
        var postId = validator.toInt(req.param('post_id'));
        var userId = req.session.userId;
        var likeDataList = [];

        async.series([
            // 本人の投稿か確認
            function(callback) {
                postDao.getByPostId(postId, function(error, postData) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    // userIdが違ったらTOPにリダイレクトする
                    if (postData.userId !== userId) {
                        var backURL = req.header('Referer') || '/';
                        res.redirect(backURL);
                        return;
                    }
                    callback();
                });
            },
            // 投稿のdeleteFlagをtrueに更新
            function(callback) {
                postDao.delete(postId, callback);
            },
            // コメントのdeleteFlagをtrueに更新
            function(callback) {
                commentDao.deleteAllCommentByPostId(postId, callback);
            }
        ], function(error, result) {
            if (error) {
                helper.responseError(res, error, 403);
                return;
            }
            res.redirect('/');
        });
    });

    app.post('/room/report', function(req, res) {
        var postId = validator.toInt(req.param('post_id'));
        var userId = req.body.userId;
        var suspect = '';
        var fromAddress = '';
        var sendName = '';

        async.waterfall([
            function(callback) {
                userDao.getByUserId(userId, function(error, result) {
                    if (error) {
                        callback(error);
                        return;
                    }

                    suspect = result.username;
                    fromAddress = result.email;
                    callback();
                });
            },
            function(callback) {
                userDao.getByUserId(req.session.userId, function(error, result) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    sendName = result.username;
                    callback();
                });
            }
        ], function(error, result) {
            if (error) {
                helper.responseError(res, null, '500');
                return;
            }

            var subject = sendName + '(' + req.session.userId + ')' + 'さんから、' + suspect + '(' + userId + ')さんのPOST ID' + postId + '投稿に通報がありました';

            mailer.sendReport(fromAddress, sendName, subject);
            res.redirect('/');
        });
    });
};
