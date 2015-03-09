/*
 * root page.
 */

// thier party
var async = require('async');
var _ = require('underscore');
var validator = require('validator');


// helper
var helper = require('helpers/applicationHelper');

exports.init = function(app){

    // TOPページを取得
    app.get('/', function(req, res) {
        res.send({key: 'value'});
    });
}
