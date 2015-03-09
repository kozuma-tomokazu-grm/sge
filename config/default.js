module.exports = {
  'site_title':   'WishMatch',
  'site_tagline': '暇な時間をチケットでお金に換えられるサービス',
  'site_description':  'WishMatch[ウィッシュマッチ]は人と人の欲求をマッチングさせて、幸せにし続けるサービスです。暇な時間をチケットに換えて、お金に換えよう!',
  'root_url': process.env.ROOT_URL,
  'img_root_url': 'https://s3-ap-northeast-1.amazonaws.com/wishmatch',
  'email': {
    address:  'wishmatchjp@gmail.com',
    password: process.env.WISHMATCH_GMAIL_PASSWORD,
    smtpHost: 'smtp.gmail.com',
  },

  'cookie_secret_key': '',
  'store_secret_key':  '',

  'facebook': {
    'app_id':       process.env.FACEBOOK_ID,
    'app_secret':   process.env.FACEBOOK_SECRET,
    'page_id':      '',
    'scope':        ''
  },
  'twitter': {
    'account_id': process.env.TWITTER_ACCOUNT_ID,
    'consumer_key':    process.env.TWITTER_CONSUMER_KEY,
    'consumer_secret': process.env.TWITTER_CONSUMER_SECRET,
    'callback_url': '/auth/twitter/callback',
  },
  'amazon_s3': {
    'access_key_id': process.env.AWS_ACCESS_KEY_ID,
    'secret_access_key': process.env.AWS_SECRET_ACCESS_KEY,
    'bucket': 'wishmatch',
    'region': 'ap-northeast-1', // Tokyo
    'path': ''
  },
  'limit': 9
};
