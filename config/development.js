module.exports = {
    'debug': true,
    'root_url': 'http://localhost:3000',
    'cookie_secret_key': 'wishmatchCookie_1030-8qh#pPe59mUwq9qQ~1%+$)PNB9$2sdB!~/c2V/921gPAH56T3zJgL6+D5Llc)_23456',
    'store_secret_key': 'wishmatchStore_52~-_8xG02N/0+hP-!4sD!(kDU(Q!HkL11eW3BgHp5y3K$0od&7(9Ul)m4N(xbUw_20131019',
    'facebook': {
        'app_id': process.env.FACEBOOK_ID,
        'app_secret': process.env.FACEBOOK_SECRET,
        'app_token': process.env.FACEBOOK_APP_TOKEN,
        'callback_url': 'http://localhost:3000/auth/facebook/callback',
    },
    'twitter': {
        'consumer_key': process.env.TWITTER_CONSUMER_KEY,
        'consumer_secret': process.env.TWITTER_CONSUMER_SECRET
    },
    'amazon_s3': {
        'path': 'd/'
    },
    'dynamodb': {
        'region': 'tokyo',
        'endpoint': 'http://localhost:8000',
        'access_key_id': 'local_access_key_id',
        'secret_access_key': 'local_secret_access_key'
    },
    'mongo_url': {
        'mongolab' : '',
        'mongolocal': 'mongodb://localhost/wishmatch'
    }
};
