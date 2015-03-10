// var config = require('config');
// var mongoose = require('mongoose');
// var autoIncrement = require('mongoose-auto-increment');
// var Schema = mongoose.Schema;
// var connection = mongoose.createConnection('mongodb://localhost/wishmatch', function(error) {
//     if (error) {
//         console.error(error);
//         process.exit();
//     }
// });

// var connectionSettingMap = {
//   connection: connection,
//   schema: Schema
// }

var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'sge'
});

module.exports = connection;