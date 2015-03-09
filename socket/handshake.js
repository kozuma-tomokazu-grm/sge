exports.init = function(io, app, mongoStore) {
    var chat = io.of('/chat');
    chat.use(function(socket, next) {
        //cookieにパース
        var cookie = require('express/node_modules/cookie').parse(decodeURIComponent(socket.request.headers.cookie));
        console.log('------signed cookie------');
        console.log(cookie);
        console.log('------signed cookie------');
        console.log('------cookie secret key------');
        console.log(app.get('cookie secret key'));
        console.log('------cookie secret key------');

        //署名によって暗号化されているのをもとに戻す
        var decodedCookie = require('express/node_modules/connect').utils.parseSignedCookies(cookie, app.get('cookie secret key'));
        console.log('------decoded cookie------');
        console.log(decodedCookie);
        console.log('------decoded cookie------');

        console.log('------store secret key------');
        console.log(app.get('store secret key'));
        console.log('------store secret key------');
        var sessionID = decodedCookie[app.get('store secret key')];
        mongoStore.get(sessionID, function(err, session) {
            if(err || !session) {
                return next(null, false);
            }
            // httpで使っているsessionデータをwebsocketでも使う
            console.log('------session data------');
            console.log(session);
            console.log('------session data------');
            socket.session = session;

            // sessionの再生成方法が間違っているから今後検討 sessionデータの再生成はセキュリティのため？？
            // socket.session = express.session({sessionID: sessionID, store: mongoStore}, sessionData);
            next(null, true);
        });

        // //cookieにパース
        // var cookie = require('express/node_modules/cookie').parse(decodeURIComponent(handshakeData.headers.cookie));

        // //署名によって暗号化されているのをもとに戻す
        // var decodedCookie = require('express/node_modules/connect').utils.parseSignedCookies(cookie, app.get('cookie secret key'));

        // var storeKey = app.get('store secret key');
        // var sessionID = decodedCookie[storeKey];

        // mongoStore.get(sessionID, function(err, session) {
        //     if(err || !session) return next(null, false);
        //     handshakeData.session = session;
        //     next(null, true);
        // });
    });
}