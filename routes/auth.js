/*
 * auth page.
 */

//dao
var userDao = require('dao/userDao');

var helper    = require('helpers/applicationHelper');
var mailer    = require('mailer/applicationMailer');

//OAuth認証のためのpassportモジュール読み込み
var passport = require('passport');
var FacebookStrategy = require('passport-facebook-canvas');
var TwitterStrategy = require('passport-twitter').Strategy;

exports.init = function(app){
    //OAuth認証用
    passport.use(new FacebookStrategy({
        clientID: app.get('config').facebook.app_id,
        clientSecret: app.get('config').facebook.app_secret,
        callbackURL: app.get('config').facebook.callback_url
    }, function(accessToken, refreshToken, profile, done){
        passport.session.accessToken = accessToken;
        process.nextTick(function(){
            done(null, profile);
        });
    }));

    passport.serializeUser(function(user, done){
        done(null, user);
    });

    passport.deserializeUser(function(obj, done){
        done(null, obj);
    });

    // /authにアクセスする事で、facebook認証につながる。
    app.get('/auth/facebook', passport.authenticate('facebook-canvas', { scope: ['email'] } ));

    //　facebook認証が終わると、このoauthloginにget通信がされる。
    app.get('/auth/facebook/callback', passport.authenticate('facebook-canvas', {failureRedirect: '/login?fail'}),
        function(req, res) {
            userDao.getByFacebookId(req.user.id, function(error, result) {
                if(error) {
                    helper.responseError(res, error, 500);
                    return;
                }
                // ログアウトしていた場合
                if (result && result.deleteFlag === false) {
                    req.session.userId = result.userId;
                    req.session.accessToken = passport.session.accessToken;
                    res.redirect('/');
                // アカウント削除していた場合
                } else if (result && result.deleteFlag) {
                    userDao.updateByUserId(result.userId, {deleteFlag: false}, function(error) {
                        if (error) {
                            helper.responseError(res, error, 500);
                            return;
                        }
                        req.session.userId = result.userId;
                        res.redirect('/');
                    });
                // 新規アカウント作成
                } else {
                    var user = req.user;
                    var data = {
                        facebookId: user.id,
                        username: user.displayName,
                        gender: user.gender,
                        email: user.emails[0].value,
                        imagePath: 'https://graph.facebook.com/' + user.id + '/picture',
                        tagIdList: [],
                        wishListUrl: ''
                    }
                    userDao.add(data, function(error, data) {
                        if(error) {
                            helper.responseError(res, error, 500);
                            return;
                        }
                        req.session.userId = data.userId;

                        if(data.email){
                            // 登録完了メール送信
                            mailer.sendWellcome(data.email, user.displayName);
                        }
                        res.redirect('/');
                    });
                }
            });
        }
    );

    passport.use(new TwitterStrategy({
            consumerKey: app.get('config').twitter.consumer_key,
            consumerSecret: app.get('config').twitter.consumer_secret,
            callbackURL: app.get('config').twitter.callback_url
        }, function(token, tokenSecret, profile, done) {
            process.nextTick(function(){
                done(null, profile);
            });
        }
    ));

    app.get('/auth/twitter', passport.authenticate('twitter'));

    app.get('/auth/twitter/callback', passport.authenticate('twitter', {failureRedirect: '/login?fail'}),
        function(req, res) {
            userDao.getByTwitterId(req.user.id, function(err, result) {
                if(err) {
                    helper.responseError(res, err, 500);
                    return;
                }
                if(result) {
                    req.session.userId = result.userId;
                    res.redirect('/');
                } else {
                    var data = {
                        twitterId: req.user.id,
                        username:    req.user.username,
                        imagePath: req.user.photos[0].value.replace('image_normal.jpg', 'image.jpg') //todo とりあえず置換！
                    }
                    userDao.addUser(data, function(err, result) {
                        if(err) {
                            helper.responseError(res, err, 500);
                            return;
                        }
                        req.session.userId = result.userId;
                        res.redirect('/');
                    });
                }
            });
        }
    );
};
