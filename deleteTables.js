process.env['NODE_PATH'] = __dirname + '/lib/dynamodb:' + __dirname + '/lib:'  + __dirname + '/node_modules';
require('module')._initPaths();

// third party
var async = require('async');

var appRoot = __dirname;
var datastore = require(appRoot + '/config/datastore');

async.eachSeries(datastore.dynamodb, function(table, callback) {
    var schema = require('schema/dynamodb/' + table.name);
    var dao = require('dao/' + table.name + 'Dao');
    dao.deleteTable(schema.TableName, callback);
}, function(error) {
    if (error) {
        throw error;
    }
    console.log('complete delete tables');
    process.exit();
});
