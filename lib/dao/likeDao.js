// third party
var util = require('util');
var _ = require('underscore');

// util
var validator = require('util/validator');

// base
var BaseDao = require('dao/baseDao');

var LikeDao = function() {
    this.name = 'like';
}
util.inherits(LikeDao, BaseDao);

/**
 * userIdとpostIdで取得
 * result
 **/
LikeDao.prototype.getByUserIdAndPostId = function(params, callback) {
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
    self.schema.findOne({
        postId: params.postId,
        userId: params.userId
    }, callback);
};

LikeDao.prototype.visitorLike = function(postId, callback) {
    try {
        validator.unsignedInteger(postId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }
    var self =this;
    self.addLike(postId, null, callback);
};


LikeDao.prototype.getListByPostId = function(postId, callback) {
    try {
        validator.unsignedInteger(postId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.find({
        postId: postId,
        userId: {$ne: null},
        deleteFlag: false
    }, callback);
};

LikeDao.prototype.getPostLikeCount = function(postId, callback) {
    try {
        validator.unsignedInteger(postId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.find({
        postId: postId,
        deleteFlag: false,
    }, function(err, data){
        if(err) {
            callback(err);
            return;
        }
        if(!data) return callback(null, 0);
        callback(null, data.length);
    });
};

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
    self.schema.findOne({
        postId: postId,
        userId: userId,
        deleteFlag: false,
    }, function(err, data){
        if(err) {
            callback(err);
            return;
        }

        if (data === null) {
            callback(null, false);
        } else {
            callback(null, true);
        }
    });
};

LikeDao.prototype.getUserLikeActivePostList = function(postIds, userId, callback) {
    try {
        validator.unsignedInteger(userId);
        validator.array(postIds);
        _.each(postIds, function(postId) {
            validator.unsignedInteger(postId);
        });

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.find({
        postId: { $in: postIds },
        userId: userId,
        deleteFlag: false,
    }, callback);
};

LikeDao.prototype.getListByUserId = function(userId, callback) {
    try {
        validator.unsignedInteger(userId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.find({
        userId: userId,
        deleteFlag: false,
    })
    .sort({updateDatetime: -1})
    .exec(callback);
};

LikeDao.prototype.getListByUserIdAndLimit = function(params, callback) {
    try {
        validator.has(params, ['userId', 'limit']);
        validator.unsignedInteger(params.userId);
        validator.unsignedInteger(params.limit);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.find({
        userId: userId,
        deleteFlag: false,
    })
    .sort({updateDatetime: -1})
    .exec(callback);
};

LikeDao.prototype.getListByUserIdAndUpdateDatetimeLimit = function(params, callback) {
    try {
        validator.has(params, ['userId', 'updateDatetime','limit']);
        validator.unsignedInteger(params.userId);
        validator.date(params.updateDatetime);
        validator.unsignedInteger(params.limit);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.find({
        userId: params.userId,
        updateDatetime: {$lt: params.updateDatetime},
        deleteFlag: false
    })
    .sort({ updateDatetime: -1 })
    .limit(params.limit)
    .exec(callback);
}

LikeDao.prototype.add = function(params, callback) {
    try {
        validator.has(params, ['userId', 'postId']);
        validator.naturalInteger(params.userId);
        validator.naturalInteger(params.postId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    var schema = self.schema;
    var like = new schema({
        userId: params.userId,
        postId: params.postId
    });
    like.save(callback);
}

/**
 * 削除
 *
 * param {Object} params パラメータ
 * param {Number} params.userId ユーザーID
 * param {Number} params.postId 投稿ID
 * param {Boolean} params.deleteFlag デリートフラグ
 *
 **/
LikeDao.prototype.updateDeleteFlag = function(params, callback) {
    try {
        validator.has(params, ['userId', 'postId', 'deleteFlag']);
        validator.naturalInteger(params.userId);
        validator.naturalInteger(params.postId);
        validator.boolean(params.deleteFlag);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.update({
        userId: params.userId,
        postId: params.postId
    },
    {
        $set: {
            deleteFlag: params.deleteFlag,
            updateDatetime: new Date()
        }
    },
    {
        multi: true
    }, callback);
};

/**
 * 削除
 *
 * param {Object} params パラメータ
 * param {Number} params.postId 投稿ID
 * param {Boolean} params.deleteFlag デリートフラグ
 *
 **/
LikeDao.prototype.updateAllDeleteFlag = function(params, callback) {
    try {
        validator.has(params, ['postId', 'deleteFlag']);
        validator.naturalInteger(params.postId);
        validator.boolean(params.deleteFlag);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.update({
        postId: params.postId
    },
    {
        $set: {
            deleteFlag: params.deleteFlag
        }
    },
    {
        multi: true
    }, callback);
};

var dao = new LikeDao();
dao.init();
module.exports = dao;
