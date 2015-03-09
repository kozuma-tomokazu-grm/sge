/*
 * post page.
 */

// third party
var async = require('async');
var _ = require('underscore');
var gm = require('gm').subClass({ imageMagick: true });
var config = require('config');
var AWS = require('aws-sdk');
var fs = require('fs');
var ExifImage = require('exif').ExifImage;
var validator = require('validator');

// serrvice
var postService = require('service/postService');
var tagRelationPostService = require('service/tagRelationPostService');

// helper
var helper    = require('helpers/applicationHelper');

// dao
var postDao = require('dao/postDao');
var hourDao = require('dao/hourDao');
var tagRelationPostDao = require('dao/tagRelationPostDao');

var img_dir = __dirname + '/../public/images/share/';
var font_dir = __dirname + '/../public/fonts/';

exports.init = function(app) {
    //投稿ページの表示
    app.get('/post', function(req, res) {
        hourDao.getAllMap(function(error, hourList) {
            if (error) {
                helper.responseError(res, error, 500);
            }

            var imageList = ['beach.png', 'champagne.png', 'memo.png', 'misuji.png', 'restaurant.png', 'road.png', 'typing.png', 'yosemite.png'];

            res.render('post/index', {
                title: '投稿',
                back_root_flg: true,
                hourList: hourList,
                imageList: imageList,
                validTitle: req.flash('validTitle'),
            });
        });
    });

    app.post('/post/upload', function(req, res) {
        var data = req.body;
        var select = data.select;
        var userId = req.session.userId;
        var file         = req.files.image;
        var title    = data.title;
        var content    = data.content;
        var date    = data.date;
        var hour = data.hour;
        var money = data.money;
        var place = data.place;
        var address = data.address;
        var url = data.url;
        var tagNameList = data.tag.split(',');

        //以下に各項目のバリデーション
        if(!title){
            req.flash('validTitle', 'タイトルの入力がありません。');
        }

        // バリデーションにひっかかった場合リダイレクト
        if(!title) {
            res.redirect('/post');
            return;
        }
        // if(file.type != 'image/jpeg' && file.type != 'image/png' && file.type != 'image/gif') {
        //     // todo error message
        //     res.redirect('/post');
        //     return;
        // }
        var fileName = '';
        var exifData;
        var orientation;

        async.waterfall([
            // todo exif削除
            function(callback){
                if(!file || file.type !== 'image/jpeg') {
                    callback();
                    return;
                }
                new ExifImage({ image : file.path }, function (err, data) {
                    if(err) {
                        callback(err);
                        return;
                    }
                    exifData = data;
                    if(exifData && exifData.image && exifData.image.Orientation) {
                        orientation = exifData.image.Orientation;
                    }
                    callback();
                });
            },
            // 画像がない場合、画像を作成
            function(callback) {
                if (file.size) {
                    callback();
                    return;
                }
                postService.createImage({
                    title: title,
                    file: file,
                    select: select,
                    img_dir: img_dir,
                    font_dir: font_dir
                }, callback);
            },
            // ファイル名を作成
            function(callback) {
                var dirName = config.amazon_s3.path + 'room/';
                postService.createFileName({
                    file: file,
                    orientation: orientation,
                    userId: userId,
                    dirName: dirName
                }, function(error, result) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    fileName = result;
                    callback();
                });
            },
            // ファイルをアップロード
            function(callback) {
                postService.fileUpload(file, fileName, function(error) {
                    callback(error);
                });
            },
            // 投稿を追加
            function(callback) {
                postDao.add({
                    userId: userId,
                    imagePath: fileName,
                    title: title,
                    content: content,
                    date: date,
                    hour: hour,
                    money: money,
                    place: place,
                    address: address,
                    url: url
                }, function(error, postData) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    callback(null, postData);
                });
            },
            // タグを登録
            function(postData, callback) {
                tagRelationPostService.insertOrUpdateByPostIdAndTagNameList({
                    postId: postData.postId,
                    tagNameList: tagNameList
                }, function(error, reuslt) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    callback(null, postData);
                });
            }
        ], function(error, postData) {
            if (error) {
                helper.responseError(res, error, 500);
                res.redirect('/');
                return;
            }

            res.redirect('/room/' + postData.postId);
        });
    });

    app.get('/post/edit/:postId', function(request, response){
        var postId = validator.toInt(request.param('postId'));
        var userId = request.session.userId;
        var data = {
            title: '編集',
            back_root_flg: true
        };

        async.waterfall([
            // 投稿情報を取得
            function(callback) {
                postDao.getByPostId(postId, function(error, postData) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    // userIdが違ったらTOPにリダイレクトする
                    if (postData.userId != userId) {
                        response.redirect('/');
                        return;
                    }
                    data.post = postData;
                    data.post.formatDatetime = helper.time.createDisplayTime(postData.date);
                    callback();
                });
            },
            // tagNameListを取得
            function(callback) {
                tagRelationPostDao.getListByPostId(postId, function(error, tagRelationUserList) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    data.tagNameList = _.pluck(tagRelationUserList, 'tagName');
                    callback();
                });
            },
            // 時間データを取得
            function(callback) {
                hourDao.getAllMap(function(error, hourList) {
                    if (error) {
                        helper.responseError(res, error, 500);
                    }
                    data.hourList = hourList;
                    callback();
                });
            }
        ], function(error, result) {
            if (error) {
                helper.responseError(response, null, 403);
                return;
            }
            response.render('post/edit', data);
        });
    });

    app.post('/post/edit', function(req, res) {
        var data = req.body;
        var userId = req.session.userId;
        var file = req.files.image;
        var postId = validator.toInt(data.postId);
        var title = data.title;
        var content = data.content;
        var date = data.date;
        var hour = data.hour;
        var money = data.money;
        var place = data.place;
        var address = data.address;
        var url = data.url;
        var tagNameList = data.tag.split(',');

        // バリデーションにひっかかった場合リダイレクト
        if(!title) {
            req.flash('validTitle', 'タイトルの入力がありません。');
            res.redirect('/post');
            return;
        }
        // if(file.type != 'image/jpeg' && file.type != 'image/png' && file.type != 'image/gif') {
        //     // todo error message
        //     res.redirect('/post');
        //     return;
        // }
        var fileName ;
        var exifData;
        var orientation;

        async.waterfall([
            // todo exif削除
            function(callback){
                if(!file || file.type !== 'image/jpeg') {
                    callback();
                    return;
                }
                new ExifImage({ image : file.path }, function (error, data) {
                    if(error) {
                        callback(error);
                        return;
                    }
                    exifData = data;
                    if(exifData && exifData.image && exifData.image.Orientation) {
                        orientation = exifData.image.Orientation;
                    }
                    callback();
                });
            },
            // 画像がない場合、画像を作成
            function(callback) {
                if (file.size) {
                    callback();
                    return;
                }
                postService.createImage({
                    title: title,
                    file: file,
                    img_dir: img_dir,
                    font_dir: font_dir
                }, callback);
            },
            // ファイル名を作成
            function(callback) {
                var dirName = config.amazon_s3.path + 'room/';
                postService.createFileName({
                    file: file,
                    orientation: orientation,
                    userId: userId,
                    dirName: dirName
                }, function(error, result) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    fileName = result;
                    callback();
                });
            },
            // ファイルをアップロード
            function(callback) {
                postService.fileUpload(file, fileName, function(error) {
                    callback(error);
                });
            },
            // 投稿を更新
            function(callback) {
                postDao.updateByPostId({
                    postId: postId,
                    userId: userId,
                    imagePath: fileName,
                    title: title,
                    content: content,
                    date: date,
                    hour: hour,
                    money: money,
                    place: place,
                    address: address,
                    url: url
                }, function(error, result) {
                    callback(error);
                });
            },
            // タグを登録
            function(callback) {
                tagRelationPostService.insertOrUpdateByPostIdAndTagNameList({
                    postId: postId,
                    tagNameList: tagNameList
                }, function(error, result) {
                    callback(error);
                });
            }
        ], function(error, result) {
            if (error) {
                helper.responseError(res, error, 500);
                return;
            }
            res.redirect('/room/' + postId + '?posted=true');
        });
    });
}
