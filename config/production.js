module.exports = {
    'debug': false,
    'root_url': process.env.ROOT_URL,
    'cookie_secret_key': 'roomingCookie_1111-7Fl+xmF9+rMsarPV3V!K2Sgj-5N5J%i~7Nch&j9!8uA)(80-Sn7V8r~I~449M_23456',
    'store_secret_key': 'roomingStore_)&/XC_ZPD!u65&1C%$$q8BAL53q%!67eMwcSdj!%fpu9XR~27zE3oDjEk-543g6&_20131225',
    'facebook': {
        'app_id': process.env.FACEBOOK_ID,
        'app_secret': process.env.FACEBOOK_SECRET,
        'app_token': process.env.FACEBOOK_APP_TOKEN,
        'callback_url': process.env.ROOT_URL + '/auth/facebook/callback'        
    },
    'twitter': {
        'consumer_key': process.env.TWITTER_CONSUMER_KEY,
        'consumer_secret': process.env.TWITTER_CONSUMER_SECRET
    },
    'amazon_s3': {
        'path': ''
    },
    'dynamodb': {
        'region': 'ap-northeast-1',
        'endpoint': 'http://dynamodb.ap-northeast-1.amazonaws.com',
        'access_key_id': process.env.DYNAMODB_ACCESS_KEY_ID,
        'secret_access_key': process.env.DYNAMODB_SECRET_ACCESS_KEY
    },
    'mongo_url': {
        'mongolab' : process.env.MONGOLAB_URI,
        'mongohq' : '',
        'mongolocal': ''
    }
};
