// third party
var async = require('async');
var _ = require('underscore');
var config = require('config');
var AWS = require('aws-sdk');
var fs = require('fs');
var gm = require('gm').subClass({ imageMagick: true });

// util
var validator = require('util/validator');

// helper
var helper = require('../helpers/applicationHelper');

// dao
var postDao = require('dao/postDao');
var userDao = require('dao/userDao');
var likeDao = require('dao/likeDao');
var commentDao = require('dao/commentDao');

var postService = function() {
    this.name = 'post';
}

/**
 * 最新の投稿を取得
 * {object} params
 * {number} params.userId ユーザーID
 * {number} params.offset オフセット
 * {number} params.limit リミット
 */
postService.prototype.getList = function(params, callback) {
    try {
        validator.has(params, ['userId', 'offset', 'limit']);
        validator.unsignedInteger(params.userId);
        validator.integer(params.offset);
        validator.unsignedInteger(params.limit);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }
    // TODO validatorを実装
    var self = this;
    async.waterfall([
        // 新着9件を取得
        function(callback) {
            postDao.getList({
                offset: params.offset,
                limit: params.limit
            }, callback);
        },
        // 投稿にひもづく情報を取得
        function(postList, callback) {
            if (!postList.length) {
                callback(null, []);
                return;
            }
            self.getPostsInfo({
                userId: params.userId,
                postList: postList
            }, callback);
        },
        // データ整形
        function(postList, callback) {
            self.jsonView(postList, callback);
        }
    ], callback);
}

/**
 * ページャー部分を取得
 * {object} params
 * {number} params.userId ユーザーID
 * {number} params.lessThanId postId
 * {number} params.page ページ数
 * {number} params.per 件数
 */
postService.prototype.getListByLessThanId = function(params, callback) {
    try {
        validator.has(params, ['userId', 'offset', 'limit']);
        validator.unsignedInteger(params.userId);
        validator.integer(params.offset);
        validator.unsignedInteger(params.limit);
        validator.unsignedInteger(params.lessThanId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    async.waterfall([
        function(callback) {
            postDao.getListByLessThanId({
                lessThanId: params.lessThanId,
                offset: params.offset,
                limit: params.limit
            }, callback);
        },
        function(postList, callback) {
            self.getPostsInfo({
                userId: params.userId,
                postList: postList
            }, callback);
        },
        // データ整形
        function(result, callback) {
            self.jsonView(result, callback);
        }
    ], callback);
}

/**
 * userIdで取得
 * {object} params
 * {number} params.userId ユーザーID
 * {number} params.lessThanId postId
 * {number} params.page ページ数
 * {number} params.per 件数
 */
postService.prototype.getListByUserId = function(params, callback) {
    try {
        validator.has(params, ['userId', 'offset', 'limit']);
        validator.unsignedInteger(params.userId);
        validator.integer(params.offset);
        validator.unsignedInteger(params.limit);
        validator.unsignedInteger(params.loginUserId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }
    var self = this;
    async.waterfall([
        // ユーザーの投稿情報を取得
        function(callback) {
            postDao.getByUserId({
                userId: params.userId,
                offset: params.offset,
                limit: params.limit
            }, callback);
        },
        // 投稿の詳細情報を取得
        function(postList, callback) {
            self.getPostsInfo({
                userId: params.userId,
                postList: postList
            }, callback);
        },
        // データ整形
        function(result, callback) {
            self.jsonView(result, callback);
        }
    ], callback);
}

/**
 * userIdで取得
 * {object} params
 * {number} params.userId ユーザーID
 * {date} params.updateDatetime 
 * {number} params.limit 
 * {number} params.loginUserId
 */
postService.prototype.getListByUserIdAndUpdateDatetimeLimit = function(params, callback) {
    try {
        validator.has(params, ['userId', 'updateDatetime', 'limit', 'loginUserId']);
        validator.unsignedInteger(params.userId);
        validator.date(params.updateDatetime);
        validator.unsignedInteger(params.limit);
        validator.unsignedInteger(params.loginUserId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }
    var self = this;
    async.waterfall([
        // 投稿情報を取得
        function(callback) {
            postDao.getListByUserIdAndUpdateDatetimeLimit({
                userId: params.userId,
                updateDatetime: params.updateDatetime,
                limit: params.limit
            }, callback);
        },
        // 投稿の詳細情報を取得
        function(postList, callback) {
            self.getPostsInfo({
                userId: params.loginUserId,
                postList: postList
            }, callback);
        },
        // データ整形
        function(postData, callback) {
            self.jsonView(postData, callback);
        }
    ], callback);
}

postService.prototype.getUserCommentList = function(params, callback) {
    try {
        validator.has(params, ['userId', 'updateDatetime', 'limit', 'loginUserId']);
        validator.unsignedInteger(params.userId);
        validator.date(params.updateDatetime);
        validator.unsignedInteger(params.limit);
        validator.unsignedInteger(params.loginUserId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }
    var self = this;
    var postIdList = [];
    var postIdUpdateDatimeMap = {};
    async.waterfall([
        // ユーザーのコメント情報を取得
        function(callback){
            commentDao.getListByUserIdAndUpdateDatetimeLimit({
                userId:params.userId,
                updateDatetime: params.updateDatetime,
                limit: params.limit
            }, function(error, commentList) {
                if(error) {
                    callback(error);
                    return;
                }

                _.each(commentList, function(comment){
                    postIdList.push(comment._id);
                    postIdUpdateDatimeMap[comment._id] = {};
                    postIdUpdateDatimeMap[comment._id].commentUpdateDatetime = comment.updateDatetime[0];
                });

                postIdList = _.uniq(postIdList);
                callback();
            });
        },
        // 投稿情報を取得
        function(callback) {
            postDao.getListByIdList(postIdList, callback);
        },
        function(postList, callback){
            self.getPostsInfo({
                userId: params.userId,
                postList: postList
            }, callback);
        },
        // データ整形
        function(result, callback) {
            self.jsonView(result, callback);
        }
    ], function(error, result) {
        _.each(result, function(post, index) {
            result[index].commentUpdateDatetime = postIdUpdateDatimeMap[post.id].commentUpdateDatetime;
        });
        
        callback(error, result);
    });
}

postService.prototype.getByPostIdList = function(params, callback) {
    try {
        validator.has(params, ['postIdList', 'loginUserId']);
        validator.array(params.postIdList);
        _.each(params.postIdList, function(postId) {
            validator.unsignedInteger(postId);
        });
        validator.unsignedInteger(params.loginUserId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    async.waterfall([
        function(callback){
            postDao.getListByIdList(params.postIdList, callback);
        },
        // 詳細情報を取得
        function(postList, callback) {
            self.getPostsInfo({
                userId: params.loginUserId,
                postList: postList
            }, callback);
        },
        // データ整形
        function(postList, callback) {
            self.jsonView(postList, callback);
        }
    ], callback);
};

postService.prototype.getPostsInfo = function(params, callback) {
    try {
        validator.has(params, ['userId', 'postList']);
        validator.unsignedInteger(params.userId);
        validator.array(params.postList);
        _.each(params.postList, function(post) {
            validator.unsignedInteger(post.postId);
            validator.unsignedInteger(post.userId);
        });

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }
    var result = {
        postList: params.postList,
        postIdList: [],
        users: [],
        userIdList: [],
        likeActiveList: [],
        likeCountList: [],
        commentCountList: []
    };

    _.each(params.postList, function(post){
        result.postIdList.push(post.postId);
        result.userIdList.push(post.userId);
    });
    result.postIdList = _.uniq(result.postIdList);
    result.userIdList = _.uniq(result.userIdList);

    async.waterfall([
        // ユーザーリストを取得
        function(callback){
            userDao.getMapByUserIdList(result.userIdList, function(error, userMap){
                if(error) {
                    callback(error);
                    return;
                }
                _.each(result.postList, function(post){
                    _.each(userMap, function(user){
                        if(post.userId === user.userId){
                            result.users[user.userId] = user;
                        }
                    });
                });
                callback();
            });
        },
        // いいねした投稿を取得
        function(callback){
            if(!params.userId) {
                callback();
                return;
            }
            likeDao.getUserLikeActivePostList(result.postIdList, params.userId, function(error, likeList) {
                if (error) {
                    callback(error);
                    return;
                }
                _.each(likeList, function(like) {
                    result.likeActiveList.push(like.postId);
                });
                callback();
            });
        },
        // 各投稿のいいねされた件数を取得
        function(callback) {
            async.each(result.postIdList, function(id, callback){
                likeDao.getPostLikeCount(id, function(error, count){
                    if (error) {
                        callback(error);
                        return;
                    }
                    result.likeCountList[id] = count;
                    callback();
                });
            }, callback);
        },
        // コメント数を取得
        function(callback) {
            async.each(result.postIdList, function(id, callback){
                commentDao.getPostCommentCount(id, function(error, count){
                    if (error) {
                        callback(error);
                        return;
                    }
                    result.commentCountList[id] = count;
                    callback();
                });
            }, callback);
        },
    ], function(error) {
        callback(error, result);
    });
};

postService.prototype.jsonView = function(result, callback){
    var data = [];
    _.each(result.postList, function(post){
        data.push({
            id: post.postId,
            imagePath: '',//helper.image.imageUrl(post.imagePath),
            ogImagePath: post.imagePath,
            title: post.title,
            content: post.content,
            date: post.date,
            hour: post.hour,
            money: post.money,
            place: post.place,
            address: post.address,
            url: post.url,
            user: {
                id: post.userId,
                username:    result.users[post.userId].username,
                imagePath: result.users[post.userId].imagePath,
            },
            likeCount: result.likeCountList[post.postId],
            likeActive: (result.likeActiveList.indexOf(post.postId) < 0) ? false : true,
            commentCount: result.commentCountList[post.postId],
            updateDatetime: post.updateDatetime,
            displayTime: helper.time.createDisplayTime(post.insertDatetime)
        });
    });
    callback(null, data);
};

postService.prototype.createFileName = function(params, callback) {
    try {
        validator.has(params, ['dirName', 'userId', 'orientation', 'file']);
        validator.string(params.dirName);
        validator.unsignedInteger(params.userId);
        if (params.orientation) {
            validator.string(params.orientation);
        }
        validator.object(params.file);
        validator.has(params.file, ['type']);
        validator.string(params.file.type);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }
    var date = new Date();
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    if(m < 10){
        params.dirName += y + '/0' + m + '/';
    }else{
        params.dirName += y + '/'    + m + '/';
    }

    var fileName = params.userId + '_' + date.getTime();
    if(params.orientation) fileName += '-' + params.orientation;

    if(params.file.type === 'image/jpeg'){
        fileName += '.jpg';
    }else if(params.file.type === 'image/png'){
        fileName += '.png';
    }else if(params.file.type === 'image/gif'){
        fileName += '.gif';
    }
    var imagePath = params.dirName + fileName;
    callback(null, imagePath);
}

postService.prototype.fileUpload = function(file, fileName, callback) {
    try {
        validator.object(file);
        validator.string(fileName);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }
    AWS.config.update({
        accessKeyId: config.amazon_s3.access_key_id,
        secretAccessKey: config.amazon_s3.secret_access_key,
        region: config.amazon_s3.region,
    });

    var s3 = new AWS.S3();
    var s3bucket = new AWS.S3({params: {Bucket: 'wishmatch'}});

    fs.stat(file.path, function(error, fileInfo) {
        if (error) {
            callback(error);
            return;
        }
        var readStream = fs.createReadStream(file.path);
        var params = {
            Bucket: config.amazon_s3.bucket,
            Key: fileName,
            ContentType: file.type,
            ContentLength: fileInfo.size,
            Body: readStream
        };
        s3.putObject(params, callback);
    });
}

postService.prototype.createImage = function(params, callback) {
    try {
        validator.has(params, ['title', 'img_dir', 'font_dir', 'file']);
        validator.string(params.title);
        validator.string(params.img_dir);
        validator.string(params.font_dir);
        validator.object(params.file);
        validator.has(params.file, ['path']);
        validator.string(params.file.path);
        if (params.select) {
            validator.string(params.select);
        }

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var originalImageName = 'originalImage.png';
    var shareImageName = 'shareImage.png';
    var color = '#000';

    if (params.select) {
        originalImageName = params.select;
        shareImageName = 'share' + params.select;
        color = '#fff'
    }

    var x = 50,y = 160;
    var fontSize = 30;
    if(params.title.length <= 10) {
        x = 200;
        y = y;
    } else if(params.title.length <= 18) {
        y = y;
    } else if(params.title.length <= 36){
        y = y - 10;
        params.title = params.title.substr(0, 18) + "\n" + params.title.substr(18);
    } else if(params.title.length <= 54){
        y = y - 20;
        params.title = params.title.substr(0, 18) + "\n" + params.title.substr(18, 18) + "\n" + params.title.substr(36);
    } else if(params.title.length <= 72){
        y = y - 30;
        params.title = params.title.substr(0, 18) + "\n" + params.title.substr(18, 18) + "\n" + params.title.substr(36, 18) + "\n"+ params.title.substr(54);
    } else if(params.title.length <= 90) {
        y = y - 40;
        params.title = params.title.substr(0, 18) + "\n" + params.title.substr(18, 18) + "\n" + params.title.substr(36, 18) + "\n"+ params.title.substr(54, 18) + "\n" + params.title.substr(72);
    }

    gm(params.img_dir + originalImageName)
    .font(params.font_dir + "kokoro/Kokoro.otf")
    .fontSize(fontSize)
    .stroke(color)
    .fill(color)
    .drawText(x, y, params.title)
    .write(params.img_dir + shareImageName, function(error) {
        if (error) {
            callback(error);
            return;
        }
        params.file.path = params.img_dir + shareImageName;
        callback();
    });
}

var service = new postService();
module.exports = service;
