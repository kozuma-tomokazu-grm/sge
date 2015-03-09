// third party
var util = require('util');
var _ = require('underscore');

// util
var validator = require('util/validator');

// base
var BaseDao = require('./baseDao');

/**
 *
 * @fileOverview ユーザーDao
 **/
var UserDao = function() {
    this.name = 'user';
}
util.inherits(UserDao, BaseDao);

/**
 * 新規userをDBに追加
 * param {Object} params
 * result
 *
 **/
UserDao.prototype.add = function(params, callback) {
    try {
        validator.has(params, ['userId', 'facebookId', 'username', 'gender', 'imagePath']);
        validator.naturalInteger(params.userId);
        validator.string(params.facebookId);
        validator.string(params.username);
        validator.string(params.gender);
        validator.string(params.imagePath);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;

    self.putItem(params, callback);
}

/**
 * userIdで取得
 * param {int} userId
 * result {Object} user
 *
 **/
UserDao.prototype.getByUserId = function(userId, callback) {
    try {
        validator.unsignedInteger(userId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.docClient.query({
        TableName: self.name,
        KeyConditions: [
            self.docClient.Condition('userId', 'EQ', userId)
        ],
        QueryFilter: [
            self.docClient.Condition('deleteFlag', 'EQ', false)
        ]
    }, function(error, result) {
        if (error) {
            callback(error);
            return;
        }
        if (!result || !result.Items ||  result.Items.length === 0) {
            callback(null, null);
            return;
        }
        callback(null, _.first(result.Items));
    });
}

/**
 * facebookIdからuserを取得
 * param {int} facebookId
 * result {Object} user
 *
 **/
UserDao.prototype.getByFacebookId = function(facebookId, callback) {
    try {
        validator.string(facebookId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.docClient.query({
        TableName: self.name,
        IndexName: 'facebookId',
        KeyConditions: [
            self.docClient.Condition('facebookId', 'EQ', facebookId)
        ],
        QueryFilter: [
            self.docClient.Condition('deleteFlag', 'EQ', false)
        ]
    }, function(error, result) {
        if (error) {
            callback(error);
            return;
        }
        if (!result || !result.Items || result.Items.length === 0) {
            callback(null, null);
            return;
        }
        callback(null, _.first(result.Items));
    });
}

/**
 *
 * userIdListからuserMapを取得
 * param {array} userIdList
 * result {Object} user
 *
 **/
UserDao.prototype.getMapByUserIdList = function(userIdList, callback) {
    try {
        validator.array(userIdList);
        _.each(userIdList, function(userId) {
            validator.unsignedInteger(userId);
        });

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;


    var keyList = _.map(userIdList, function(userId) {
        return {
            userId: userId
        }
    });

    if (userIdList.length === 0) {
        callback(null, {});
        return;
    }

    self.docClient.batchGetItem({
        RequestItems: {
            'user': {
                Keys: keyList,
                ConsistentRead: false
            }
        }
    }, function(error, result) {
        if (error) {
            callback(error);
            return;
        }
        if (!result || !result.Responses['user'] || result.Responses['user'].length === 0) {
            callback(null, {});
            return;
        }
        
        callback(null, _.indexBy(result.Responses['user'], 'userId'));
    });
}

/**
 *
 * userIdListからuserListを取得
 * param {array} userIdList
 * result {Array} user
 *
 **/
UserDao.prototype.getListByUserIdList = function(userIdList, callback) {
    try {
        validator.array(userIdList);
        _.each(userIdList, function(userId) {
            validator.unsignedInteger(userId);
        });

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;

    var keyList = _.map(userIdList, function(userId) {
        return {
            userId: userId
        }
    });

    self.docClient.batchGetItem({
        RequestItems: {
            'user': {
                Keys: keyList,
                ConsistentRead: false
            }
        }
    }, function(error, result) {
        if (error) {
            callback(error);
            return;
        }
        if (!result || !result.Responses['user']　|| result.Responses['user'].length === 0) {
            callback(null, []);
            return;
        }
        callback(null, result.Responses['user']);
    });
}

/**
 * 最終ログイン日時が早いユーザーを取得
 **/
UserDao.prototype.getRecentLoginUserList = function(params, callback) {
    try {
        validator.has(params, ['gender', 'offset', 'limit']);
        validator.string(params.gender);
        validator.integer(params.offset);
        validator.unsignedInteger(params.limit);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.docClient.query({
        TableName: self.name,
        IndexName: 'gender',
        KeyConditions: [
            self.docClient.Condition('gender', 'EQ', params.gender)
        ],
        QueryFilter: [
            self.docClient.Condition('deleteFlag', 'EQ', false)
        ],
        Limit: params.limit,
        ScanIndexForward: false
    }, function(error, result) {
        if (error) {
            callback(error);
            return;
        }
        if (!result || !result.Items || result.Items.length === 0) {
            callback(null, []);
            return;
        }
        callback(null, result.Items);
    });
}

/**
 * lastLoginDatetimeを更新
 *
 * param {Object} params
 * param {int} params.userId ユーザーID
 * param {Date} params.updateDatetime 更新日時
 *
 **/
UserDao.prototype.updateDatetimeByUserId = function(params, callback) {
    try {
        validator.has(params, ['userId', 'updateDatetime'])
        validator.unsignedInteger(params.userId);
        validator.unsignedInteger(params.updateDatetime);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.docClient.updateItem({
        TableName: self.name,
        Key: {
            userId: params.userId
        },
        UpdateExpression: "set updateDatetime = :updateDatetime",
        ExpressionAttributeValues: {
            ":updateDatetime":  params.updateDatetime
        }
    }, callback);
};


/**
 * wishListUrlを更新
 *
 * param {Object} params
 * param {int} params.userId ユーザーID
 * param {Date} params.wishListUrl ウィッシュリストURL
 *
 **/
UserDao.prototype.updateWishListUrlByUserId = function(params, callback) {
    try {
        validator.has(params, ['userId', 'wishListUrl'])
        validator.unsignedInteger(params.userId);
        validator.string(params.wishListUrl);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.docClient.updateItem({
        TableName: self.name,
        Key: {
            userId: params.userId
        },
        UpdateExpression: "set wishListUrl = :wishListUrl",
        ExpressionAttributeValues: {
            ":wishListUrl":  params.wishListUrl
        }
    }, callback);
};

/**
 * 削除
 *
 * param {Object} params
 * param {int} params.userId ユーザーID
 *
 **/
UserDao.prototype.deleteByUserId = function(params, callback) {
    try {
        validator.has(params, ['userId'])
        validator.unsignedInteger(params.userId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.docClient.updateItem({
        TableName: self.name,
        KeyConditions: [
            self.docClient.Condition('userId', 'EQ', params.userId)
        ],
        UpdateExpression: "set deleteFlag = :deleteFlag",
        ExpressionAttributeValues: {
            ":deleteFlag":  true
        }
    }, callback);
};

var dao = new UserDao();
dao.init();
module.exports = dao;

