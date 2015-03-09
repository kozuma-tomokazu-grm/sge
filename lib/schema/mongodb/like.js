var connectionSetting = require('connectionSetting');
var connection = connectionSetting.connection;
var Schema = connectionSetting.schema;
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(connection);

var likeSchema = new Schema({
    likeId: {type: Number},
    postId: {type: Number},
    userId: {type: Number, default: null},
    insertDatetime: {type: Date, default: Date.now},
    updateDatetime: {type: Date, default: Date.now},
    deleteFlag: {type: Boolean, default: false}
});

likeSchema.plugin(autoIncrement.plugin, {
    model: 'Like',
    field: 'likeId',
    startAt: 1,
    incrementBy: 1
});

module.exports = connection.model('Like', likeSchema);
