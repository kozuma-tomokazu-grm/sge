// third party
var config = require('config');
var async = require('async');
var _ = require('underscore');
var http = require('superagent');

// util
var validator = require('util/validator');

var facebook = function() {
    this.name = 'facebook';
}

/**
 * applicationAccessTokenを取得
 **/
facebook.prototype.getAppAccessToken = function(callback){
    var facebook = config.facebook;
    var url = 'https://graph.facebook.com/oauth/access_token';
    var request = http['get'](url);
    var query = {
        client_id: facebook.app_id,
        client_secret: facebook.app_secret,
        grant_type: 'client_credentials'
    };
    request
        .query(query)
        .end(function(response) {
            if (response.status < 200 || response.status >= 300) {
                var error = new Error(response.error || 'facebook API Failed - ' + url + ' :' + response.status);
                error.status = response.status;
                error.body = response.body;
                callback(error, null);
                return;
            }
            callback(null, response.body);
        });
}

/**
 * ユーザーに通知を送信
 */
facebook.prototype.notification = function(params, callback) {
    try {
        validator.has(params, ['toFacebookId', 'fromFacebookId', 'text']);
        validator.string(params.toFacebookId);
        validator.string(params.fromFacebookId);
        validator.string(params.text);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }
    var facebook = config.facebook;
    var url = 'https://graph.facebook.com/' + params.toFacebookId + '/notifications';
    var request = http['post'](url);
    var query = {
        access_token: facebook.app_token,
        template: '@[' + params.fromFacebookId + ']' + params.text,
        href: ''
    };
    request
        .send(query)
        .end(function(response) {
            if (response.status < 200 || response.status >= 300) {
                var error = new Error(response.error || 'facebook API Failed - ' + url + ' status code:' + response.status);
                error.status = response.status;
                error.body = response.body;
                callback(error, null);
                return;
            }
            callback(null, response.body);
        });
}

var api = new facebook();
module.exports = api;
