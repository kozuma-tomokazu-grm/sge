// third party
var _ = require('underscore');
var config = require('config');
var AWS = require("aws-sdk");
var DOC = require("dynamodb/dynamodb-doc/dynamodb-doc");

// setting accessKeyId and secretAccessKey
var awsConfig = {
    accessKeyId: config.dynamodb.access_key_id,
    secretAccessKey: config.dynamodb.secret_access_key,
    region: config.dynamodb.region,
    endpoint: config.dynamodb.endpoint
}

// JSON DynamoDB Client
var docClient = new DOC.DynamoDB( new AWS.DynamoDB(awsConfig));

// util
var validator = require('util/validator');

var BaseDao = function() {
    this.name = null;
    this.docClient = null;
};

// initialization
BaseDao.prototype.init = function() {
    var self = this;
    self.docClient = docClient;
};

// add item
BaseDao.prototype.putItem = function(item, callback) {
    item.insertDatetime = Date.now();
    item.updateDatetime = Date.now();
    item.deleteFlag = false;
    var self = this;
    self.docClient.putItem({
        TableName: self.name,
        Item: item
    }, callback);
};

// get item
BaseDao.prototype.getByHashAndRange = function(key, callback) {
    var self = this;
    self.docClient.getItem({
        TableName: self.name,
        Key: key
    }, callback);
};

// create table
BaseDao.prototype.createTable = function(schema, callback) {
    var self = this;
    self.docClient.createTable(schema, function(error, result) {
        if (error && error.code !== 'ResourceInUseException') {
            callback(error);
        }
        if (error && error.code === 'ResourceInUseException') {
            console.log(schema.TableName + ' table is already exists');
        }
        callback();
    });
};

// delte table
BaseDao.prototype.deleteTable = function(tableName, callback) {
    var self = this;
    self.docClient.deleteTable({
        TableName: tableName
    }, callback);
};

module.exports = BaseDao;
