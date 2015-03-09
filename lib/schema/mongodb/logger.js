var connectionSetting = require('connectionSetting');
var connection = connectionSetting.connection;
var Schema = connectionSetting.schema;

var loggerSchema = new Schema({
  debugLevel: {type: Object,  default: null},
  error: {type: Object,  default: null},
  message: {type: String,  default: null},
  data: {type: Object,  default: null},
  request_headers: {type: Object,  default: null},
  request_route: {type: Object,  default: null},
  request_session: {type: Object,  default: null},
  insertDatetime: {type: Date, default: Date.now},
});

module.exports = connection.model('Logger', loggerSchema);
