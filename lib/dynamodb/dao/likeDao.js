// third party
var util = require('util');
var _ = require('underscore');

// util
var validator = require('util/validator');

// base
var BaseDao = require('./baseDao');

/**
 *
 * @fileOverview likeDao
 **/
var LikeDao = function() {
    this.name = 'like';
}
util.inherits(LikeDao, BaseDao);

/*
 * like情報をDBに保存
 * param {Object} params
 * result
 **/
LikeDao.prototype.getByUserIdAndPostId = function(params, callback) {
    try {
        validator.has(params, ['postId', 'userId']);
        validator.unsignedInteger(params.postId);
        validator.unsignedInteger(params.userId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.docClient.query({
        TableName: self.name,
        KeyConditions: [
            self.docClient.Condition('postId', 'EQ', params.postId),
            self.docClient.Condition('userId', 'EQ', params.userId)
        ]
    }, function(error, result) {
        if (error) {
            callback(error);
            return;
        }
        if (!result || result.Items.length === 0) {
            callback(null, null);
            return;
        }
        callback(null, _.first(result.Items) || null);
    });
}

/**
 * visitorLike
 * param {int} postId
 * result
 **/
LikeDao.prototype.visitorLike = function(postId, callback) {
    try {
        validator.unsignedInteger(postId);
        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.addLike(postId, null, callback);
}

/**
 * PostIdで取得
 * param {int} postId
 * result
 **/
LikeDao.prototype.getListByPostId = function(postId, callback) {
    try {
        validator.unsignedInteger(postId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.docClient.query({
        TableName: self.name,
        KeyConditions: [
            self.docClient.Condition('postId', 'EQ', postId),
        ],
        QueryFilter: [
            self.docClient.Condition('deleteFlag', 'EQ', false)
        ]
    }, function(error, result) {
        if (error) {
            callback(error);
            return;
        }
        if (!result || result.Items.length === 0) {
            callback(null, []);
            return;
        }
        callback(null, result.Items);
    });
};

/**
 * getPostLikeCount
 * param {int} postId
 * result
 **/
LikeDao.prototype.getPostLikeCount = function(postId, callback) {
    try {
        validator.unsignedInteger(postId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.docClient.query({
        TableName: self.name,
        KeyConditions: [
            self.docClient.Condition('postId', 'EQ', postId)
        ],
        QueryFilter: [
            self.docClient.Condition('deleteFlag', 'EQ', false)
        ]
    }, function(error, result) {
        if (error) {
            callback(error);
            return;
        }

        if (!result.Items) {
            return callback(null, 0);
        }

        callback(null, result.Items.length);
    });
};

/**
 * getUserLikeActive
 * param {int} postId
 * param {int} userId
 * result
 **/
LikeDao.prototype.getUserLikeActive = function(postId, userId, callback) {
    try {
        validator.unsignedInteger(userId);
        validator.unsignedInteger(postId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.docClient.query({
        TableName: self.name,
        KeyConditions: [
            self.docClient.Condition('postId', 'EQ', postId),
            self.docClient.Condition('userId', 'EQ', userId)
        ],
        QueryFilter: [
            self.docClient.Condition('deleteFlag', 'EQ', false)
        ]
    }, function(error, data) {
        if (error) {
            callback(error);
            return;
        }

        if (data.Items.length) {
            callback(null, true);
        } else {
            callback(false);
        }
    });
};

/**
 * getUserLikeActivePostList
 * param {int} postId
 * param {int} userId
 * result
 **/
LikeDao.prototype.getUserLikeActivePostList = function(postIdList, userId, callback) {
    try {
        validator.unsignedInteger(userId);
        validator.array(postIdList);
        _.each(postIdList, function(postId) {
            validator.unsignedInteger(postId);
        });

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.docClient.query({
        TableName: self.name,
        IndexName: 'userId',
        KeyConditions: [
            self.docClient.Condition('userId', 'EQ', userId)
        ],
        QueryFilter: [
            // TODO postIdList内の要素と同じ物があるかどうか判定 現状これじゃできてないけど動作的には問題ない
            // 件数を絞れていないからこの後の処理がどんどん重くなる
            // self.docClient.Condition('postId', 'EQ', postIdList),
            self.docClient.Condition('deleteFlag', 'EQ', false)
        ]
    }, function(error, result) {
        if (error) {
            callback(error);
            return;
        }
        if (!result) {
            callback(null, []);
            return;
        }
        callback(error, result.Items);
    });
}

/**
 * userIdで取得
 * param {int} userId
 * result
 **/
LikeDao.prototype.getListByUserId = function(userId, callback) {
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
        IndexName: 'userId',
        KeyConditions: [
            self.docClient.Condition('userId', 'EQ', userId)
        ],
        QueryFilter: [
            self.docClient.Condition('deleteFlag', 'EQ', false)
        ],
        ScanIndexForward: false
    }, function(error, result) {
        if (error) {
            callback(error);
            return;
        }
        if (!result || result.Items.length === 0) {
            callback(null, []);
            return;
        }
        callback(null, result.Items);
    });
};

LikeDao.prototype.getListByUserIdAndLessThanId = function(params, callback) {
    try {
        validator.has(params, ['userId', 'limit', 'lessThanId']);
        validator.unsignedInteger(params.userId);
        validator.unsignedInteger(params.limit);
        validator.integer(params.lessThanId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.docClient.query({
        TableName: self.name,
        KeyConditions: [
            self.docClient.Condition('postId', 'NOT NULL'),
            self.docClient.Condition('userId', 'EQ', userId)
        ],
        QueryFilter: [
            self.docClient.Condition('lessThanId', 'LT', lessThanId)
        ],
        ScanIndexForward: false,
        LIMIT: params.limit,
    }, callback);
};

/**
 * addLike
 * param {int} postId
 * param {int} userId
 * result
 **/
LikeDao.prototype.add = function(params, callback) {
    try {
        validator.has(params, ['userId', 'postId']);
        validator.unsignedInteger(params.userId);
        validator.unsignedInteger(params.postId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;

    self.putItem(params, callback);
}

/**
 * 削除
 *
 * param {Object} params
 * param {int} params.userId ユーザーID
 * param {int} params.postId 投稿ID
 * param {boolean} params.deleteFlag デリートフラグ
 *
 **/
LikeDao.prototype.updateDeleteFlag = function(params, callback) {
    try {
        validator.has(params, ['userId', 'postId', 'deleteFlag'])
        validator.naturalInteger(params.userId);
        validator.naturalInteger(params.postId);
        validator.boolean(params.deleteFlag);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.docClient.updateItem({
        TableName: self.name,
        Key: {
            userId: params.userId,
            postId: params.postId
        },
        UpdateExpression: 'set deleteFlag = :deleteFlag',
        ExpressionAttributeValues: {
            ':deleteFlag':  params.deleteFlag
        }
    }, callback);
};

var dao = new LikeDao();
dao.init();
module.exports = dao;
