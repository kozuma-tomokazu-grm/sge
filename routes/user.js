/*
 * user page.
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
var messageGroupDao = require('dynamodb/dao/messageGroupDao');
var tagRelationUserDao = require('dao/tagRelationUserDao');
var userRelationShipDao = require('dao/userRelationShipDao');

// service
var messageService = require('service/messageService');
var postService = require('service/postService');
var userService = require('service/userService');
var tagRelationUserService = require('service/tagRelationUserService');
// helper
var helper = require('helpers/applicationHelper');

exports.init = function(app) {
    // ユーザーページのlikeのページャー
    app.get('/user/comment_pager', function(req, res){
        var userId = validator.toInt(req.param('user_id'));
        var updateDatetime = helper.time.parseISOString(req.param('updateDatetime'));
        var loginUserId = req.session.userId;
        var commentMap = {};
        var postIdUpdateDatetimeMap = {};
        if(!userId) {
            helper.apiResponseError(res, null , 404);
            return;
        }

        async.waterfall([
            // comment情報を取得
            function(callback) {
                commentDao.getListByUserIdAndUpdateDatetimeLimit({
                    userId: userId,
                    updateDatetime: updateDatetime,
                    limit: config.limit,
                }, callback);
            },
            // 投稿情報を取得
            function(commentList, callback) {
                var postIdList = _.map(commentList, function(comment) {
                    postIdUpdateDatetimeMap[comment._id] = {};
                    postIdUpdateDatetimeMap[comment._id].commentUpdateDatetime = comment.updateDatetime[0]; 
                    return comment._id;
                });
                postIdList = _.unique(postIdList);
                postDao.getListByIdList(postIdList, callback);
            },
            // 投稿の詳細情報を取得
            function(postList, callback) {
                postService.getPostsInfo({
                    userId: userId,
                    postList: postList
                }, callback);
            },
            // データ整形
            function(postList, callback) {
                postService.jsonView(postList, callback);
            }
        ], function(error, postList) {
            if (error) {
                helper.responseError(res, error, 500);
                return;
            }
        
            _.each(postList, function(post, index) {
                postList[index].commentUpdateDatetime = postIdUpdateDatetimeMap[post.id].commentUpdateDatetime;
            });    

            res.contentType('application/json');
            res.send(JSON.stringify(postList));
        });
    });

    // ユーザーページのlikeのページャー
    app.get('/user/like_pager', function(req, res){
        var userId = validator.toInt(req.param('user_id'));
        var updateDatetime = helper.time.parseISOString(req.param('updateDatetime'));
        var loginUserId = req.session.userId;
        if(!userId) {
            helper.apiResponseError(res, null , 404);
            return;
        }

        async.waterfall([
            // like情報を取得
            function(callback) {
                likeDao.getListByUserIdAndUpdateDatetimeLimit({
                    userId: userId,
                    updateDatetime: updateDatetime,
                    limit: config.limit,
                }, callback);
            },
            // 投稿情報を取得
            function(likeList, callback) {
                var postIdList = _.map(likeList, function(like) {
                    return like.postId;
                });

                postDao.getListByIdList(postIdList, function(error, postList) {
                    if (error) {
                        callback(error);
                        return;
                    }

                    likeList = _.map(likeList, function(like) {
                        var tempPost = _.find(postList, function(post) {
                            return post.postId === like.postId;
                        });
                        if (tempPost) {
                            return {
                                likeData: like,
                                postId: tempPost.postId,
                                imagePath: tempPost.imagePath
                            };
                        }
                    });

                    callback(null, likeList);
                });
            }
        ], function(error, likeList) {
            if (error) {
                helper.responseError(res, error, 500);
                return;
            }

            likeList.sort(function(roomA, roomB) {
                if (roomA.likeData.updateDatetime < roomB.likeData.updateDatetime) {
                    return 1;
                } else if (roomB.likeData.updateDatetime > roomB.likeData.updateDatetime) {
                    return -1;
                } else {
                    return 0;
                }
            });
        
            res.contentType('application/json');
            res.send(JSON.stringify(likeList));
        });
    });

    // ユーザーページの投稿のページャー
    app.get('/user/post_pager', function(req, res){
        var userId = validator.toInt(req.param('user_id'));
        var updateDatetime = helper.time.parseISOString(req.param('updateDatetime'));
        var loginUserId = req.session.userId;
        if(!userId) {
            helper.apiResponseError(res, null , 404);
            return;
        }

        async.waterfall([
            function(callback) {
                postService.getListByUserIdAndUpdateDatetimeLimit({
                    userId: userId,
                    updateDatetime: updateDatetime,
                    limit: config.limit,
                    loginUserId: loginUserId
                }, function(error, result) {
                    if(error) {
                        helper.apiResponseError(res, error, 500);
                        return;
                    }
                    callback(null, result);
                });
            }
        ], function(error, result) {
            if (error) {
                helper.responseError(response, error, 500);
                return;
            }
            res.contentType('application/json');
            res.send(JSON.stringify(result));
        });
    });

    app.get('/user/edit', function(request, response){
        var userId = request.session.userId;
        var data = {
            title: '編集',
            back_url: '/user/' + userId,
            user: {},
            tagNames: ''
        }
        async.waterfall([
            // ユーザー情報を取得
            function(callback) {
                userDao.getByUserId(userId, function(error, user){
                    if (error) {
                        helper.responseError(res, error, 500);
                        return;
                    } else if (!user) {
                        helper.responseError(res, null, 403);
                        return;
                    }
                    data.user = user;
                    callback();
                });
            },
            // タグ名を取得
            function(callback) {
                tagRelationUserDao.getListByUserId(userId, function(error, tagRelationUserList) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    // タグ名のリストを取得
                    var tagNameList = _.map(tagRelationUserList, function(tagRelationUser) {
                        return tagRelationUser.tagName;
                    });
                    data.tagNames = tagNameList.join(',');
                    callback();
                });
            },
        ], function(error, result) {
            if (error) {
                helper.responseError(response, error, 500);
                return;
            }
            response.render('user/edit', data);
        });
    });

    app.post('/user/edit', function(request, response){
        var tagNameList = request.body.tag.split(',');
        var wishListUrl = request.body.wishListUrl;
        var data = {};
        data.wishListUrl = wishListUrl;

        async.waterfall([
            // ユーザーにひもづくタグ情報を更新
            function(callback) {
                tagRelationUserService.insertOrUpdateByUserIdAndTagNameList({
                    userId: request.session.userId,
                    tagNameList: tagNameList
                }, callback);
            },
            function(callback) {
                if (_.isEmpty(wishListUrl)) {
                    wishListUrl = '#';
                }
                userDao.updateByUserId(request.session.userId, data, callback);
            }
        ], function(error, result) {
            if (error) {
                helper.responseError(response, error, 500);
                return;
            }
            response.redirect('/user/edit');
        });
    });

    app.get('/user/:id', function(req, res){
        var loginUserId = req.session.userId;
        var userId = validator.toInt(req.param('id'));
        var messageGroupId = 0;
        var title = 'ユーザー';
        if (userId == loginUserId) {
            title = 'マイページ';
        }
        var data = {};

        async.parallel({
            user: function(callback) {
                async.waterfall([
                    // ユーザー情報を取得
                    function(callback) {
                        userService.getUserInformation({
                            loginUserId: loginUserId,
                            userId: userId
                        }, function(error, result) {
                            if(error) {
                                callback(error);
                                return;
                            }
                            data.userData = result;
                            callback();
                        });
                    },
                    // タグ情報を取得
                    function(callback) {
                        tagRelationUserDao.getListByUserId(userId, function(error, tagRelationUserList) {
                            if (error) {
                                callback(error);
                                return;
                            }
                            // タグ名のリストを取得
                            var tagNameList = _.map(tagRelationUserList, function(tagRelationUser) {
                                return tagRelationUser.tagName;
                            });
                            // 配列から文字列を生成
                            data.tagNameList = tagNameList;
                            callback();
                        });
                    },
                    // メッセージグループIDを取得
                    function(callback) {
                        messageGroupDao.getListByFromUserIdAndToUserId({
                            fromUserId: loginUserId,
                            toUserId: userId
                        }, callback);
                    },
                    function(result, callback) {
                        if (result.length > 0) {
                            // メッセージグループIDが取得できた場合
                            if (result[0].deleteFlag) {
                                data.deleteFlag = true;
                                // ブロックされている場合
                                if (result[0].blockFlag) {
                                    // ブロックした人
                                    data.blockFlag = true;
                                    data.messageGroupId = result[0].messageGroupId;
                                    callback();
                                } else {
                                    // ブロックされた人
                                    data.blockFlag = false;
                                    data.messageGroupId = result[0].messageGroupId;
                                    callback();
                                }
                            } else {
                                // fromUserIdとtoUserIdでメッセージグループIDを検索結果をそのまま返す
                                data.messageGroupId = result[0].messageGroupId;
                                callback();
                            }
                        } else {
                            // メッセージグループIDがなかったので2人のためのメッセージグループID生成
                            messageService.addMessageGroup({
                                fromUserId: loginUserId,
                                toUserId: userId
                            }, function(error, result) {
                                if (error) {
                                    callback(error);
                                    return;
                                }

                                data.messageGroupId = result;
                                callback();
                            });
                        }
                    }
                ], callback);
            },
            post: function(callback) {
                // 投稿情報を取得
                postService.getListByUserIdAndUpdateDatetimeLimit({
                    userId: userId,
                    updateDatetime: new Date(),
                    limit: config.limit,
                    loginUserId: loginUserId
                }, function(error, rooms){
                    if(error) {
                        callback(error);
                        return;
                    }
                    rooms.forEach(function(room) {
                        if (room.date) {
                            
                            room.date = helper.time.createDisplayTime(room.date);
                        }
                    });
                    data.rooms = rooms;
                    callback();
                });
            }
        }, function(error, result) {
            if (error) {
                helper.responseError(res, error, 500);
                return;
            }
            data.userActiveTabName = 'photo';
            data.title = title;
            res.render('user', data);
        });
    });

    app.get('/user/:id/like', function(req, res){
        var loginUserId = req.session.userId;
        var userId = validator.toInt(req.param('id'));

        var title = 'ユーザー';
        if (userId == loginUserId) {
            title = 'マイページ';
        }
        var data = {};

        async.parallel({
            user: function(callback) {
                async.waterfall([
                    // ユーザー情報を取得
                    function(callback) {
                        userService.getUserInformation({
                            loginUserId: loginUserId,
                            userId: userId
                        }, function(error, result) {
                            if(error) {
                                callback(error);
                                return;
                            }
                            data.userData = result;
                            callback();
                        });
                    },
                    // タグ情報を取得
                    function(callback) {
                        tagRelationUserDao.getListByUserId(userId, function(error, tagRelationUserList) {
                            if (error) {
                                callback(error);
                                return;
                            }
                            // タグ名のリストを取得
                            var tagNameList = _.map(tagRelationUserList, function(tagRelationUser) {
                                return tagRelationUser.tagName;
                            });
                            // 配列から文字列を生成
                            data.tagNameList = tagNameList;
                            callback();
                        });
                    },
                ], callback);
            },
            post: function(callback) {
                async.waterfall([
                    // ユーザーのlike情報を取得
                    function(callback) {
                        likeDao.getListByUserIdAndUpdateDatetimeLimit({
                            userId: userId,
                            updateDatetime: new Date(),
                            limit: config.limit
                        }, function(error, likeList) {
                            if (error) {
                                callback(error);
                                return;
                            }
                            var postIdList = [];
                            _.each(likeList, function(like){
                                postIdList.push(like.postId);
                            });
                            callback(null, postIdList, likeList);
                        });
                    },
                    function(postIdList, likeList, callback) {
                        if (!postIdList) {
                            data.rooms = [];
                            callback();
                            return;
                        }

                        postService.getByPostIdList({
                            postIdList: postIdList,
                            loginUserId: loginUserId
                        }, function(error, rooms){
                            if (error) {
                                callback(error);
                                return;
                            }

                            var roomMap = {};
                            _.each(rooms, function(room) {
                                roomMap[room.id] = room;
                            });

                            var roomList = [];
                            _.each(likeList, function(like) {
                                roomMap[like.postId].likeData = like;
                                roomList.push(roomMap[like.postId]);
                            });
                    
                            roomList.sort(function(roomA, roomB) {
                                if (roomA.likeData.updateDatetime < roomB.likeData.updateDatetime) {
                                    return 1;
                                } else if (roomA.likeData.updateDatetime > roomB.likeData.updateDatetime) { 
                                    return -1;
                                } else {
                                    return 0;
                                }
                            });
                            
                            data.rooms = roomList;
                            callback();
                        });
                    }
                ], callback);
            }
        }, function(error, result) {
            if (error) {
                helper.responseError(res, error, 500);
                return;
            }
            data.userActiveTabName = 'like';
            data.title = title;
            res.render('user', data);
        });
    });

    app.get('/user/:id/comment', function(req, res) {
        var loginUserId = req.session.userId;
        var userId = validator.toInt(req.param('id'));
        var title = 'ユーザー';
        var data = {};

        async.parallel({
            user: function(callback) {
                async.waterfall([
                    // ユーザー情報を取得
                    function(callback) {
                        userService.getUserInformation({
                            loginUserId: loginUserId,
                            userId: userId
                        }, function(error, result) {
                            if(error) {
                                callback(error);
                                return;
                            }
                            data.userData = result;
                            callback();
                        });
                    },
                    // タグ情報を取得
                    function(callback) {
                        tagRelationUserDao.getListByUserId(userId, function(error, tagRelationUserList) {
                            if (error) {
                                callback(error);
                                return;
                            }
                            // タグ名のリストを取得
                            var tagNameList = _.map(tagRelationUserList, function(tagRelationUser) {
                                return tagRelationUser.tagName;
                            });
                            data.tagNameList = tagNameList;
                            callback();
                        });
                    },
                ], callback);
            },
            post: function(callback) {
                async.waterfall([
                    // ユーザーがコメントした投稿を取得
                    function(callback) {
                        postService.getUserCommentList({
                            userId: userId,
                            updateDatetime: new Date(),
                            limit: 100,
                            loginUserId: loginUserId
                        }, function(error, rooms){
                            if (error) {
                                callback(error);
                                return;
                            }

                            rooms.sort(function(roomA, roomB) {
                                if (roomA["commentUpdateDatetime"] < roomB["commentUpdateDatetime"]) { 
                                    return 1;
                                } else if (roomA["commentUpdateDatetime"] > roomB["commentUpdateDatetime"]) { 
                                    return -1; 
                                } else {
                                    return 0;
                                }
                            });

                            data.rooms = rooms;
                            callback();
                        });
                    },
                    // commentIdを取得
                    function(callback) {
                        var postIdList = _.map(data.rooms, function(post) {
                            return post.id;
                        });

                        commentDao.getListByPostIdList(postIdList, function(error, commentList) {
                            if (error) {
                                callback(error);
                                return;
                            }
                            _.each(data.rooms, function(post) {
                                var tempComment = _.find(commentList, function(comment) {
                                    return post.id === comment.postId;
                                });
                                if (tempComment) {
                                    post.commentData = tempComment;
                                    return;
                                }
                            });
                            callback();
                        });
                    },
                ], callback);
            }
        }, function(error, result) {
            if (error) {
                helper.responseError(res, error, 500);
                return;
            }
            data.userActiveTabName = 'comment';
            data.title = title;

            res.render('user', data);
        });
    });

    app.get('/user/:id/following', function(request, response) {
        var data = {};
        var loginUserId = request.session.userId;
        var userId = validator.toInt(request.param('id'));
        var title = 'ユーザー';
        if (userId != loginUserId) {
            return response.redirect('/');
        }

        async.waterfall([
            function(callback) {
                userRelationShipDao.getListByFollowUserId(userId, function(error, userRelationShipList) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    // フォローしているユーザーIDを取得
                    var followedUserIdList = _.map(userRelationShipList, function(userRelationShip) {
                        return userRelationShip.followedUserId;
                    });
                    data.followedUserIdList = followedUserIdList;
                    callback();
                });
            },
            function(callback) {
                if (data.followedUserIdList.length === 0) {
                    data.userList = [];
                    callback();
                    return;
                }
                userDao.getListByUserIdList(data.followedUserIdList, function(error, userList) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    data.userList = userList;
                    callback();
                });
            }
        ], function(error, result) {
            if (error) {
                helper.responseError(response, error, 500);
                return;
            }
            response.render('user/following', data);
        });
    });

    app.get('/user/:id/followers', function(request, response) {
        var followUserId = validator.toInt(request.param('id'));
        var data = {};

        async.waterfall([
            function(callback) {
                userRelationShipDao.getListByFollowedUserId(followUserId, function(error, userRelationShipList) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    // フォローされているユーザーIDを取得
                    var followUserIdList = _.map(userRelationShipList, function(userRelationShip) {
                        return userRelationShip.followUserId;
                    });
                    data.followUserIdList = followUserIdList;
                    callback();
                });
            },
            function(callback) {
                if (data.followUserIdList.length === 0) {
                    data.userList = [];
                    callback();
                    return;
                }
                userDao.getListByUserIdList(data.followUserIdList, function(error, userList) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    data.userList = userList;
                    callback();
                });
            }
        ], function(error, result) {
            if (error) {
                helper.responseError(response, error, 500);
                return;
            }
            response.render('user/followers', data);
        });
    });

    app.get('/user/categorie/:tagName', function(request, response) {
        var tagName = validator.toString(request.param('tagName'));
        var data = {};

        async.waterfall([
            // tagNameからuseridリsとぉ取得
            function(callback) {
                tagRelationUserDao.getListByTagName(tagName, function(error, tagRelationUserList) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    var userIdList = _.map(tagRelationUserList, function(tagRelationUser) {
                        return tagRelationUser.userId;
                    });
                    callback(null, userIdList);
                });
            },
            // ユーザーを取得
            function(userIdList, callback) {
                userDao.getListByUserIdList(userIdList, function(error, userList) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    data.userList = userList;
                    callback();
                });
            }
        ], function(error, result) {
            if (error) {
                helper.responseError(response, error, 500);
                return;
            }
            response.render('user/categorie', data);
        });
    });

    app.get('/user/delete/:userId', function(request, response) {
        var userId = validator.toInt(request.param('userId'));
        if (userId != request.session.userId) {
            response.redirect('/')
            return;
        }
        userDao.deleteByUserId(request.session.userId, function(error, result) {
            if (error) {
                callback(error);
                return;
            }
            request.session.destroy();
            response.redirect('/');
        });
    });

    app.get('/login', function(req, res) {
        res.render('user/login', {
            bodyId: 'login',
            title: 'Wishlist Matching Service',
            back_root_flg: true,
        });
    });

    app.get('/logout', function(req, res) {
        req.session.destroy();
        return res.redirect('/');
    });
};
