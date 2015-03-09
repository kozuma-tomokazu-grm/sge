var connectionSetting = require('connectionSetting');
var connection = connectionSetting.connection;
var Schema = connectionSetting.schema;
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(connection);

var postSchema = new Schema({
    postId: {type: Number},
    userId: {type: Number},
    imagePath: {type: String, default: null},
    title : {type: String, default: null},
    date: {type: Date, default: null},
    hour: {type: String, default: null},
    money: {type: String, default: 0},
    place: {type: String, default: null},
    address: {type: String, default: null},
    content: {type: String, default: null},
    url: {type: String, default: null},
    insertDatetime: {type: Date, default: Date.now},
    updateDatetime: {type: Date, default: Date.now},
    deleteFlag: {type: Boolean, default: false}
});

postSchema.plugin(autoIncrement.plugin, {
    model: 'Post',
    field: 'postId',
    startAt: 1,
    incrementBy: 1
});

module.exports = connection.model('Post', postSchema);
