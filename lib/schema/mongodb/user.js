var connectionSetting = require('connectionSetting');
var connection = connectionSetting.connection;
var Schema = connectionSetting.schema;
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(connection);

var userSchema = new Schema({
    userId: {type: Number},
    facebookId: {type: String},
    twitterId: {type: String},
    username: {type: String},
    email: {type: String},
    gender: {type: String},
    imagePath: {type: String, default: 'https://s3-ap-northeast-1.amazonaws.com/postimage/sample.jpeg'},
    wishListUrl: { type: String },
    insertDatetime: {type: Date, default: Date.now},
    updateDatetime: {type: Date, default: Date.now},
    deleteFlag: {type: Boolean, default: false}
});

userSchema.plugin(autoIncrement.plugin, {
    model: 'User',
    field: 'userId',
    startAt: 1,
    incrementBy: 1
});

module.exports = connection.model('User', userSchema);
