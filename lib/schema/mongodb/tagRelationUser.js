var connectionSetting = require('connectionSetting');
var connection = connectionSetting.connection;
var Schema = connectionSetting.schema;
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(connection);

var tagRelationUserSchema = new Schema({
    tagRelationUserId: {type: Number},
    tagName: {type: String, unique: true},
    userId: {type: Number},
    insertDatetime: {type: Date, default: Date.now},
    updateDatetime: {type: Date, default: Date.now},
    deleteFlag: {type: Boolean, default: false}
});

tagRelationUserSchema.plugin(autoIncrement.plugin, {
    model: 'tagRelationUser',
    field: 'tagRelationUserId',
    startAt: 1,
    incrementBy: 1
});

module.exports = connection.model('tagRelationUser', tagRelationUserSchema);
