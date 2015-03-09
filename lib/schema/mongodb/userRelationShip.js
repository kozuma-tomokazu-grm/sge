var connectionSetting = require('connectionSetting');
var connection = connectionSetting.connection;
var Schema = connectionSetting.schema;
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(connection);

var userRelationShipSchema = new Schema({
    followUserId: {type: Number},
    followedUserId: {type: Number},
    insertDatetime: {type: Date, default: Date.now},
    updateDatetime: {type: Date, default: Date.now},
    deleteFlag: {type: Boolean, default: false}
});

userRelationShipSchema.index({ followUserId: 1, followedUserId: 1 }, { unique: true });

module.exports = connection.model('userRelationShip', userRelationShipSchema);
