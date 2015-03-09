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
var socket = require('socket.io');
var mongo = require('socket.io-adapter-mongo');
var MongoStore = require('connect-mongo')(express); //sessionストア用のDB
var mongoStore = new MongoStore({
    url: config.mongo_url.mongolab || config.mongo_url.mongolocal,
    db: 'wishmatch_session_user'
});
var passport = require('passport');
var stylus = require('stylus');
var _ = require('underscore');

var app = express();

// 攻撃者にバックエンドのサーバーが何か伝えない
app.disable('x-powered-by');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// app.set('view options', { layout:'layout.ejs' });
// config set
app.set('config', config);

//cookie署名時のキー
app.set('cookie secret key', app.get('config').cookie_secret_key);

//store保存時のキー
app.set('store secret key', app.get('config').store_secret_key);

app.use(express.favicon(__dirname + '/public/favicon.ico'));
if (config.debug) {
    app.use(express.logger('dev'));
}

app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.multipart());
app.use(express.cookieParser(app.get('cookie secret key')));

app.use(express.session({
    store: mongoStore,
    key: app.get('store secret key'),
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000 // a week
    }
}));

// use filter
app.use(
    require("middlewares/express_filter")
    .onError(function(error, req, res){
        require('helpers/applicationHelper').responseError(res, new Error('invalid access'), 500)
    })
    .setRoot(__dirname)
    .config(__dirname + '/config/filter_config.json')
    .doFilter(app)
);

// 独自トークン
express.logger.token('user-id', function(request, response) {
    if (request.session) {
        return request.session.userId ? request.session.userId : null;
    }
    return null;
});

var logs_dir = path.join(__dirname, 'logs');
try {
    fs.statSync(logs_dir);
} catch(error) {
    console.log(error);
    fs.mkdirSync(logs_dir, 0777);
}

// ロガー設定
app.use(express.logger({
    format: ':remote-addr - - [:date] :method :url HTTP/:http-version :status Referrer::referrer :user-agent userId::user-id',
    stream: fs.createWriteStream('logs/access_log.log', { flags: 'a', 'encoding': 'utf8', 'mode': 0777 })
}));

var conditionalCSRF = function (req, res, next) {
    res.locals._req = req;
    res.locals._res = res;
    res.locals._helper = require('helpers/applicationHelper');
    res.locals._config = app.get('config');

    var whiteList = [
        '/non_csrf/'
    ];

    var url = _.find(whiteList, function(url) {
        return url == req.url;
    });

    if (url) {
        next();
    } else {
        (express.csrf())(req, res, function() {
            res.locals._csrf = req.csrfToken();
            next();
        });
    }
};

app.use(conditionalCSRF);

//OAuth認証用
app.use(passport.initialize());
app.use(passport.session());

app.use(require('express-serialize')({
    algorithm: 'aes-256-cbc',
    secretKey: 'secret key',
    encoding: 'utf8'
}));

//use responseOverride middleware
// app.use(require('middlewares/response-override'));

app.use(flash());

//Stylusコンパイル設定
app.use(stylus.middleware({
    src : __dirname + '/public/styl/',
    dest: __dirname + '/public/stylesheets/',
    compile: function(str, path) { // optional, but recommended
        console.log('=====compiling stylus=====');
        var compress = true;
        if ('development' == app.get('env')) {
            compress = false;
        }
        return stylus(str)
            .set('filename', path)
            .set('warn', true)
            .set('compress', compress)
    }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
    app.locals.pretty = true;
}

var server = http.createServer(app);

//socket.io
var io = socket(server);
// setメソッドとauthorizationは廃止(後方互換のためのこされてはいる)
// io.set('log level', 1);

// 複数のサーバ間でメッセージをbroadcastするときに使用される。0.9にあったStoreの代替
io.adapter(mongo(config.mongo_url.mongolab || config.mongo_url.mongolocal));

// デフォルトネームスペース
// io.of('/').use(function(socket, next) {}); と同じ意味
io.use(function(socket, next) {
    if (socket.request.headers.cookie) return next();
    next(new Error('Authentication error'));
});
//var io = Socket(server);
//    io.set('log level', 1);

//handshakeの設定
// require('./socket/handshake.js').init(io, app, mongoStore);


//pageごとにroutingを管理
require('./routes/index').init(app);
require('./routes/auth').init(app);
require('./routes/user').init(app);
require('./routes/userList').init(app);
require('./routes/room').init(app);
require('./routes/tag').init(app);
require('./routes/post').init(app);
require('./routes/message').init(app, io);
require('./routes/information').init(app);
require('./routes/userRelationShip').init(app);
require('./routes/followFeed').init(app);
require('./routes/error').init(app);

// socketioのイベント
// require('./routes/socketio/chat').init(io);


server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
