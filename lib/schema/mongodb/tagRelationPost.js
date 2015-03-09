var connectionSetting = require('connectionSetting');
var connection = connectionSetting.connection;
var Schema = connectionSetting.schema;
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(connection);

var tagRelationPostSchema = new Schema({
    tagRelationPostId: {type: Number},
    tagName: {type: String, unique: true},
    postId: {type: Number},
    insertDatetime: {type: Date, default: Date.now},
    updateDatetime: {type: Date, default: Date.now},
    deleteFlag: {type: Boolean, default: false}
});

tagRelationPostSchema.plugin(autoIncrement.plugin, {
    model: 'tagRelationPost',
    field: 'tagRelationPostId',
    startAt: 1,
    incrementBy: 1
});

module.exports = connection.model('tagRelationPost', tagRelationPostSchema);
