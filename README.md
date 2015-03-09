NODE_ENV=production forever start  -o ../logs/access.log -e ../logs/error.log app.js

stylusのコンパイル、ウォッチング等  
http://qiita.com/yoh-nak/items/f8d1f4cbfe31c62e82fc  
stylus public/styl/application.styl -o public/stylesheets/  

foreverの停止  
http://onlineconsultant.jp/pukiwiki/?node.js%20node.js%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%97%E3%83%88%E3%82%92forever%E3%81%A7%E3%83%87%E3%83%BC%E3%83%A2%E3%83%B3%E5%8C%96%E3%81%99%E3%82%8B  
forever stopall    

lib/dao/postDao.jsのプロトタイプチェーンで書くと、拡張性が保てるらしい  
javascriptはクラスベースオブジェクト指向言語ではなく、  
プロトタイプベース指向言語だから  

vim ~/.bash_profile  
export AWS_ACCESS_KEY_ID=''  
export AWS_SECRET_ACCESS_KEY=''  

export DYNAMODB_ACCESS_KEY_ID=''
export DYNAMODB_SECRET_ACCESS_KEY=''

export FACEBOOK_ID=''  
export FACEBOOK_SECRET=''  
export FACEBOOK_APP_TOKEN=

export TWITTER_ACCOUNT_ID=''  
export TWITTER_CONSUMER_KEY=''  
export TWITTER_CONSUMER_SECRET=''  

export WISHMATCH_GMAIL_PASSWORD=''  
export MONGOLAB_URI=''

export ROOT_URL=''

git push heroku yourbranch:master
