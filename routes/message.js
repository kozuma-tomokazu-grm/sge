/*
 * message page
 */

// third party
var async = require('async');
var _ = require('underscore');
var validator = require('validator');

// service
var userService = require('service/userService');
var messageService = require('service/messageService');

// dao
var userDao = require('dao/userDao');
var messageDao = require('dynamodb/dao/messageDao');
var messageGroupDao = require('dynamodb/dao/messageGroupDao');

// helper
var helper = require('helpers/applicationHelper');

exports.init = function(app, io) {
    app.get('/message/search/:toUserId', function(request, response) {
        var fromUserId = request.session.userId;
        var toUserId = validator.toInt(request.param('toUserId'));
        var messageGroupId = 0;

        async.waterfall([
            function(callback) {
                // fromUserIdとtoUserIdでメッセージグループIDを検索
                messageGroupDao.getListByFromUserIdAndToUserId({
                    fromUserId: fromUserId,
                    toUserId: toUserId
                }, callback);
            },
            function(messageGroupList, callback) {
                if (messageGroupList.length > 0) {
                    if (messageGroupList[0].deleteFlag) {
                        callback(new Error('delete messageGroupId'));
                    } else {
                        // fromUserIdとtoUserIdでメッセージグループIDを検索結果をそのまま返す
                        messageGroupId = messageGroupList[0].messageGroupId;
                        callback(null, messageGroupId);
                    }
                } else {
                    // メッセージグループIDがなかったので2人のためのメッセージグループID生成
                    messageService.addMessageGroup({
                        fromUserId: fromUserId,
                        toUserId: toUserId
                    }, callback);
                }
            }
        ], function(error, result) {
            if (error) {
                helper.responseError(response, error, 500);
                return;
            }

            if (result && messageGroupId === 0) {
                messageGroupId = result;
            }

            response.redirect('/message/' + messageGroupId);
        });
    });

    app.get('/message/message_box', function(request, response) {
        var messageGroupList = [];
        var newMessageCount = 0;

        messageGroupDao.getListByFromUserIdAndUpdateDatetime({
            fromUserId: request.session.userId,
            updateDatetime: Date.now()
        }, function(error, messageBoxList) {
            if (error) {
                helper.responseError(response, error, 500);
                return;
            }

            async.eachSeries(messageBoxList, function(params, callback) {
                if (params.toUserId === request.session.userId) {
                    callback();
                    return;
                }

                userDao.getByUserId(params.toUserId, function(error, user) {
                    if (error) {
                        callback(error);
                        return;
                    }

                    if (!user.deleteFlag) {
                        messageGroupList.push({
                            messageGroupId: params.messageGroupId,
                            user: user,
                            newMessageFlag: params.newMessageFlag,
                            updateDatetime: params.updateDatetime,
                            formatUpdateDatetime: helper.time.createDisplayTime(params.updateDatetime)
                        });
                    }
                    callback();
                });
            }, function(error) {
                // 新着メッセージを計測                
                messageGroupDao.getNewMessageGroupListByFromUserId(request.session.userId, function(e, newMessageGroupList) {
                    if (error) {
                        helper.responseError(response, error, 500);
                        return;
                    }

                    newMessageCount = newMessageGroupList.length;

                    response.render('messagebox', {
                        pageTitle: 'メッセージボックス',
                        messageGroupList: messageGroupList,
                    });
                });
            });
        });
    });

    app.post('/message/more_user', function(request, response) {
        var fromUserId = request.session.userId;
        var lastUpdateDatetime = validator.toInt(request.body.lastUpdateDatetime); 
        var messageGroupList = [];

        messageGroupDao.getListByFromUserIdAndUpdateDatetime({
            fromUserId: fromUserId,
            updateDatetime: lastUpdateDatetime
        }, function(error, result) {
            if (error) {
                helper.responseError(response, erorr, 500);
                return;
            }

            async.eachSeries(result, function(params, callback) {

                userDao.getByUserId(params.toUserId, function(error, user) {
                    if (error) {
                        callback(error);
                        return;
                    }

                    if (!user.deleteFlag) {
                        messageGroupList.push({
                            messageGroupId: params.messageGroupId,
                            user: user,
                            newMessageFlag: params.newMessageFlag,
                            updateDatetime: params.updateDatetime,
                            formatUpdateDatetime: helper.time.createDisplayTime(params.updateDatetime)
                        });
                    }
                    callback();
                });
            }, function(error, result) {

                if (error) {
                    helper.responseError(response, error, 500);
                    return;
                }

                response.contentType('application/json');
                response.send(JSON.stringify({
                        pageTitle: 'メッセージボックス',
                        messageGroupList: messageGroupList,
                }));
            });
        });
    });

    app.post('/message/block_user', function(request, response) {
        var fromUserId = request.session.userId;
        var toUserId = validator.toInt(request.body.toUserId);
        
        async.parallel([
            function(callback) {
                messageGroupDao.updateBlockFlag({
                    fromUserId: fromUserId,
                    toUserId: toUserId,
                    blockFlag: true
                }, callback);
            },
            function(callback) {
                messageGroupDao.updateDeleteFlag({
                    fromUserId: fromUserId,
                    toUserId: toUserId,
                    deleteFlag: true
                }, callback);
            },
            function(callback) {
                messageGroupDao.updateDeleteFlag({
                    fromUserId: toUserId,
                    toUserId: fromUserId,
                    deleteFlag: true
                }, callback);
            }
        ], function(error, result) {
            if (error) {
                helper.responseError(response, error, 500);
                return;
            }        
            
            response.redirect('/message/message_box');
        });
    });

    app.post('/message/unblock_user', function(request, response) {
        var fromUserId = request.session.userId;
        var toUserId = validator.toInt(request.body.toUserId);
            
        messageGroupDao.getListByFromUserIdAndToUserId({
            fromUserId: fromUserId,
            toUserId: toUserId
        }, function(error, result) {
            if (error) {
                helper.responseError(response, error, 500);
                return;
            }

            if (!result.length || !result[0].blockFlag) {
                helper.responseError(response, new Error('不正アクセス'), 500);
                return;      
            }
      
            async.parallel([
                function(callback) {
                    messageGroupDao.updateDeleteFlag({
                        fromUserId: fromUserId,
                        toUserId: toUserId,
                        deleteFlag: false
                    }, callback);
                },
                function(callback) {
                    messageGroupDao.updateDeleteFlag({
                        fromUserId: toUserId,   
                        toUserId: fromUserId,
                        deleteFlag: false
                    }, callback);
                },
                function(callback) {
                    messageGroupDao.updateBlockFlag({
                        fromUserId: fromUserId,
                        toUserId: toUserId,
                        blockFlag: false
                    }, callback);
                }
            ], function(error) {
                if (error) {
                    helper.responseError(response, error, 500);
                    return;
                }
                
                response.redirect('/user/' + toUserId);
            });
        });
    });

    app.post('/message/send_message', function(request, response) {
        var fromUserId = request.session.userId;
        var toUserId = validator.toInt(request.body.toUserId);
        var messageGroupId = validator.toInt(request.body.messageGroupId) || 0;
        var message = validator.toString(request.body.message);
;
        var imagePath = validator.toString(request.body.imagePath || '');
        var userImagePath = validator.toString(request.body.userImagePath);
        var username = validator.toString(request.body.username)
        var incrementKey = 'messageId';
        var newMessageCount = 0;

        var messageParams = {
            fromUserId: fromUserId,
            toUserId: toUserId,
            message: message,
            messageGroupId: messageGroupId,
            imagePath: imagePath || '#',
            userImagePath: userImagePath,
            username: username,
        };

        async.waterfall([
            function(callback) {
                messageService.addMessage(messageParams, function(error, result) {
                    if (error) {
                        helper.responseError(response, error, 500);
                        return;
                    }

                    var messageId = result.messageId;
                    var updateDatetime = result.updateDatetime;
                    messageParams.messageId = messageId;
                    messageParams.updateDatetime = updateDatetime;
                    messageParams.formatUpdateDatetime = helper.time.createDisplayTime(updateDatetime);
                    callback();
                });
            },
            function(callback) {
                messageGroupDao.updateNewMessageFlag({
                        fromUserId: toUserId,
                        toUserId: fromUserId,
                        newMessageFlag: true,
                }, function(error, result) {
                    if (error) {
                        helper.responseError(response, error, 500);
                        return;
                    }
                    
                    callback();
                });
            },
            function(callback) {
                // 新着メッセージを計測
                messageGroupDao.getNewMessageGroupListByFromUserId(toUserId, function(error, newMessageGroupList) {
                    if (error) {
                        helper.responseError(response, error, 500);
                        return;
                    }

                    newMessageCount = newMessageGroupList.length;

                    callback();
                });
            }
        ], function(error) {
            if (error) {
                helper.responseError(response, error, 500);
                return;
            } 

            var messageNameSpace = io.of('/message/' + messageGroupId);

            messageNameSpace.once('connection', function(socket) {
                socket.join('/message/' + messageGroupId);
                socket.broadcast.emit('emit_from_server', messageParams);

                socket.on('disconnect', function() {
                    console.log('socket通信が切断されました');
                });
            });

            var notificationSpace = io.of('/notification/' + toUserId);
            notificationSpace.once('connection', function(socket) {
                socket.join('/notification/' + toUserId);
                socket.emit('new_message', newMessageCount);
                socket.on('disconnect', function() {
                    console.log('socket通信が切断されました');
                });
            });

            response.redirect('/message/' + messageGroupId);
        });
    });

    app.post('/message/delete_message', function(request, response) {
        var messageId = validator.toInt(request.body.messageId);
        var messageGroupId = validator.toInt(request.body.messageGroupId);

        messageDao.deleteMessageByMessageId(messageId, function(error, callback) {
            if (error) {
                callback(error);
                return;
            }

            var messageNameSpace = io.of('/message/' + messageGroupId);

            messageNameSpace.once('connection', function(socket) {
                socket.join('/message/' + messageGroupId);

                socket.broadcast.emit('delete_message', {
                    messageId: messageId
                });

                socket.on('disconnect', function() {
                    console.log('socket通信が切断されました');
                });
            });

            response.redirect('/message/' + messageGroupId);
        });
    });

    app.post('/message/more_message', function(request, response) {
        var fromUserId = request.session.userId;
        var toUserId;
        var messageGroupId = validator.toInt(request.param('messageGroupId'));
        var lastUpdateDatetime = validator.toInt(request.param('lastUpdateDatetime'));
        var messageGroupList = [];
        var userMap = {};

        async.waterfall([
            function(callback) {
                messageGroupDao.getListByMessageGroupId(messageGroupId, callback);
            },
            function(result, callback) {
                messageGroupList = result;
                
                var messageGroup = _.find(messageGroupList, function(messageGroup) {
                    return messageGroup.fromUserId === fromUserId;
                });

                // 2人のユーザー情報を取得
                userDao.getMapByUserIdList([ messageGroup.fromUserId, messageGroup.toUserId],  function(error, result) {
                    if (error) {
                        helper.responseError(response, error, 500);
                        return;
                    }

                    userMap = result;
                    callback();
                });
            },
            function(callback) {
                // メッセージを取得
                messageDao.getListByMessageGroupIdAndUpdateDatetime({
                    messageGroupId: messageGroupId,
                    updateDatetime: lastUpdateDatetime
                }, callback);
            }
        ], function(error, result) {
            if (error) {
                helper.responseError(response, error, 500);
                return;
            }

            var messageList = result;

            messageList.forEach(function(message) {
                message.fromUserId = fromUserId;
                message.toUserId = toUserId;
                message.username = userMap[message.userId].username;
                message.userImagePath = userMap[message.userId].imagePath;
                message.formatUpdateDatetime = helper.time.createDisplayTime(message.updateDatetime);
            });

            response.contentType('application/json');
            response.send(JSON.stringify(messageList));    
        });        
        
    });

    app.get('/message/:messageGroupId', function(request, response) {
        var fromUserId = request.session.userId;
        var toUserId;
        var messageGroupId = validator.toInt(request.param('messageGroupId'));
        var messageGroupList = [];
        var userMap = {};
        var messageList;
        var newMessageCount = 0;

        async.waterfall([
            function(callback) {
                messageGroupDao.getListByMessageGroupId(messageGroupId, callback);
            },
            function(result, callback) {
                messageGroupList = result;

                var messageGroup = _.find(messageGroupList, function(messageGroup) {
                    return messageGroup.fromUserId === fromUserId;
                });
                
                if (!messageGroup) {
                    callback(new Error('Cannot get information of 2 user!'));
                    return;
                }

                toUserId = messageGroup.toUserId;
                
                // 2人のユーザー情報を取得
                userDao.getMapByUserIdList([ messageGroup.fromUserId, messageGroup.toUserId], callback);
            },
            function(result, callback) {
                if (!result || result.length > 0) {
                    callback(new Error('Cannot get information of 2 user!'));
                    return;
                }
                userMap = result;

                // メッセージを取得
                messageDao.getListByMessageGroupIdAndUpdateDatetime({
                        messageGroupId: messageGroupId,
                        updateDatetime: Date.now()
                    }, function(error, result) {
                    if (error) {
                        helper.responseError(response, error, 500);
                        return;
                    }
                    
                    messageList = result;
                    callback();
                });
            },
            function(callback) {
                messageGroupDao.updateNewMessageFlag({ 
                    fromUserId: fromUserId,
                    toUserId: toUserId,
                    newMessageFlag: false,
                }, function(error) {
                    if (error) {
                        callback(error);
                        return;
                    }

                    callback();
                });
            },
            function(callback) {
                // 新着メッセージを計測
                messageGroupDao.getNewMessageGroupListByFromUserId(fromUserId, function(error, newMessageGroupList) {
                    if (error) {
                        callback(erorr);
                        return;
                    }

                    newMessageCount = newMessageGroupList.length;

                    callback();
                });
            }
        ], function(error) {
            if (error) {
                helper.responseError(response, error, 500);
                return;
            }

            var notificationSpace = io.of('/notification/' + fromUserId);
            notificationSpace.once('connection', function(socket) {
                socket.join('/notification/' + fromUserId);
                socket.emit('new_message', newMessageCount);
                socket.on('disconnect', function() {
                    console.log('socket通信が切断されました');
                });
            });

            // 盗聴防止
            var messageNameSpace = io.of('/message/' + messageGroupId);

            messageNameSpace.once('connection', function(socket) {
                socket.join('/message/' + messageGroupId);

                socket.on('disconnect', function() {
                    console.log('socket通信が切断されました');
                });
            });

            response.render('message', {
                title: 'プライベートチャット',
                userMap: userMap,
                fromUserId: fromUserId,
                toUserId: toUserId,
                messageGroupId: messageGroupId,
                messageList: messageList,
                newMessageCount: newMessageCount
            });
        });
    });
};

