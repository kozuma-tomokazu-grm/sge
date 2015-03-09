var config = require('config');
var email = require("emailjs");
var jade = require('jade');
var fs  = require('fs');
var helper = require('helpers/applicationHelper');

exports.sendWellcome = function(toAddress, username){
    var path = 'lib/mailer/template/wellcome.jade';
    fs.readFile(path, 'utf8', function(err, data){
        if(err) return;
        var fn = jade.compile(data);

        var subject = 'WishMatch[ウィッシュマッチ]へようこそ！';
        var text = fn({
            username: username,
        });

        var fromAddress = 'wishmatchjp@gmail.com';

        sendMail(fromAddress, toAddress, subject, text, function(err){
            if (err) {
                helper.Errorlogger('WARN', err, null, 'send mail wellcome');
                return;
            }
            return;
        });
    });
}

exports.sendReport = function(fromAddress, username, subject){
    var path = 'lib/mailer/template/report.jade';
    fs.readFile(path, 'utf8', function(err, data){
        if(err) return;
        var fn = jade.compile(data);
        var text = fn({
            username: username,
            subject: subject,
        });

        var toAddress = 'wishmatchjp@gmail.com';

        sendMail(fromAddress, toAddress, subject, text, function(err){
            if (err) {
                helper.Errorlogger('WARN', err, null, 'send mail wellcome');
                return;
            }
            return;
        });
    });
}

exports.sendWishMatch = function(toAddress, params){
    var path = 'lib/mailer/template/wishmatch.jade';
    fs.readFile(path, 'utf8', function(err, data){
        if(err) return;
        var fn = jade.compile(data);
        var subject = params.subject;
        var text = fn(params);

        var fromAddress = 'wishmatchjp@gmail.com';

        sendMail(fromAddress, toAddress, subject, text, function(err){
            if (err) {
                helper.Errorlogger('WARN', err, null, 'send mail wellcome');
                return;
            }
            return;
        });
    });
}

var sendMail =    function(fromAddress, toAddress, subject, text, callback){
    var server = email.server.connect({
        user:         config.email.address,
        password: config.email.password,
        host:         config.email.smtpHost,
        ssl:            true,
    });
    var headers = {
        from:         fromAddress,
        to:             toAddress,
        subject:    subject,
    };

    var message = email.message.create(headers);
    message.attach_alternative(text);
    server.send(message, function(err, message){
        if(err) callback(err);
/*         console.log(err || message); */
        callback(null);
    });
};

