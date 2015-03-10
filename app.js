/**
 * Module dependencies.
 */
 // デフォルトのrequireのパス設定
process.env['NODE_PATH'] = __dirname + '/lib:'  + __dirname + '/node_modules:' + __dirname + '/resources';
require('module')._initPaths();

var config = require('config');
var express = require('express');
var fs = require('fs');
var http = require('http');
var path = require('path');
var flash = require('connect-flash');
// var mongo = require('socket.io-adapter-mongo');
// var MongoStore = require('connect-mongo')(express); //sessionストア用のDB
// var mongoStore = new MongoStore({
//     url: 'mongodb://localhost/sge',
//     db: 'session_user'
// });

var _ = require('underscore');

var app = express();

// 攻撃者にバックエンドのサーバーが何か伝えない
app.disable('x-powered-by');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// app.set('config', config);

//cookie署名時のキー
app.set('cookie secret key', 'sge');

//store保存時のキー
app.set('store secret key', 'sge');

app.use(express.favicon(__dirname + '/public/favicon.ico'));
if (config.debug) {
    app.use(express.logger('dev'));
}

app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.multipart());
app.use(express.cookieParser(app.get('cookie secret key')));

// app.use(express.session({
//     store: mongoStore,
//     key: app.get('store secret key'),
//     cookie: {
//         maxAge: 7 * 24 * 60 * 60 * 1000 // a week
//     }
// }));

app.use(flash());


app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
    app.locals.pretty = true;
}

var server = http.createServer(app);


//pageごとにroutingを管理
require('./routes/index').init(app);

server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
