// helper

var config = require('config');

// dao
var loggerDao = require('dao/loggerDao');

exports.image = require('helpers/imageHelper');
exports.user    = require('helpers/userHelper');
exports.room    = require('helpers/roomHelper');
exports.time    = require('helpers/timeHelper');


exports.truncate = function(text, length, omission){
    if(!length)     length        = 30;
    if(!omission) omission    = '...';

    if(text.length > length){
        text = text.substring(0, length);
        text = text + omission;
    }

    return text;
}

exports.getSiteTitle = function(){
    return config.site_title;
}

exports.pageTitle = function(pageTitle, title){
    defaultText = config.site_tagline + ' 〜 '    + config.site_title;
    if(pageTitle){
        return pageTitle + ' | ' + defaultText;
    }else if(title){
        return title + ' | ' + defaultText;
    }

    return defaultText;
}

exports.pageDescription = function(description){
    if(description) return description;
    return config.site_description;
}

exports.canonicalUrl = function(url){
    var URL = require('url');
    var url_parts = URL.parse(url, true);
    return url_parts.pathname;
}



exports.apiResponseError = function(response, error, status){
    var statusCode     = 404;
    var errorMessage = '404 not found'

    if(status === 403){
        statusCode     = 403;
        errorMessage = '403 Forbidden';
    }else if(status === 418){
        statusCode     = 418;
        errorMessage = "418 I'm a teapot";
    }else if(status === 500){
        logger('FATAL', error, response);
        statusCode     = 500;
        errorMessage = 'Internal Server Error';
    }
    console.log(error.stack);
    response.end(JSON.stringify({error: errorMessage}));
}

exports.responseError = function(response, error, status){
    var statusCode = 404;
    var template     = 'error/404';

    if(status === 403){
        statusCode = 403;
        template     = 'error/403';
    }else if(status === 500){
        logger('FATAL', error, response);
        statusCode = 500;
        template     = 'error/500';
    }
    if (error) {    
        console.log(error.stack);
    }
    response.statusCode = statusCode;
    response.render(template, {
        back_root_flg: true
    });
}

exports.Errorlogger = function(debugLevel, err, response, message){
    logger('WARN', err, response, message);
}

var logger = function(debugLevel, err, response, message){
    debugLevel = debugLevel || 'INFO';
    response = response || {};
    response.req = response.req || {};

    loggerDao.addLog({
        debugLevel: debugLevel,
        message: message,
        error: err,
        request_headers: response.req.headers,
        request_route: response.req.route,
        request_session: response.req.session,
    });
}
