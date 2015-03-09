var connectionSetting = require('connectionSetting');
var connection = connectionSetting.connection;
var Schema = connectionSetting.schema;
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(connection);

var commentSchema = new Schema({
    commentId: {type: Number},
    postId: {type: Number},
    userId: {type: Number},
    content: {type: String},
    insertDatetime: {type: Date, default: Date.now},
    updateDatetime: {type: Date, default: Date.now},
    deleteFlag: {type: Boolean, default: false}
});

commentSchema.plugin(autoIncrement.plugin, {
    model: 'Comment',
    field: 'commentId',
    startAt: 1,
    incrementBy: 1
});

module.exports = connection.model('Comment', commentSchema);
