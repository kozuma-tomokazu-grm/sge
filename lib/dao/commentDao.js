// third party
var util = require('util');
var _ = require('underscore');

// util
var validator = require('util/validator');

// base
var BaseDao = require('./baseDao');

var CommentDao = function() {
    this.name = 'comment'
};
util.inherits(CommentDao, BaseDao)

/**
 * 新規commentをDBに追加
 * param {Object} params
 *
 **/
CommentDao.prototype.addComment = function(params, callback) {
    try {
        validator.has(params, ['userId', 'postId', 'content']);
        validator.unsignedInteger(params.userId);
        validator.unsignedInteger(params.postId);
        validator.string(params.content);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var schema = this.schema;
    var comment = new schema({
        userId: params.userId,
        postId: params.postId,
        content: params.content
    });
    comment.save(callback);
};

CommentDao.prototype.getListByUserIdAndUpdateDatetimeLimit = function(params, callback) {
    try {
        validator.has(params, ['userId', 'updateDatetime', 'limit']);
        validator.unsignedInteger(params.userId);
        validator.date(params.updateDatetime);
        validator.unsignedInteger(params.limit);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;

    self.schema.aggregate()
    .match({ 
        userId: params.userId, 
        updateDatetime: { $lt: params.updateDatetime },
        deleteFlag: false
    })
    .group({ _id: "$postId", updateDatetime: { $addToSet: "$updateDatetime"}})
    .sort({ updateDatetime: -1})
    .limit(params.limit)
    .exec(callback); 
}

CommentDao.prototype.getListByPostIdList = function(postIdList, callback) {
    try {
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
    self.schema.find({
        postId: { 
            $in: postIdList
        }
    })
    .exec(callback);
}

CommentDao.prototype.getListByPostIdAndUpdateDatetimeLimit = function(params, callback) {
    try {
        validator.has(params, ['postId', 'updateDatetime', 'limit']);
        validator.unsignedInteger(params.postId);
        validator.date(params.updateDatetime);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.find({
        postId: params.postId,
        updateDatetime: {$lt: params.updateDatetime},
        deleteFlag: false,
    })
    .sort({updateDatetime: -1})
    .limit(params.limit)
    .exec(callback);
};


CommentDao.prototype.getPostCommentCount = function(postId, callback) {
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
        if(!data) return callback(0);
        callback(null, data.length);
    });
};

CommentDao.prototype.getUserCommentCount = function(userId, callback) {
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
    }, function(err, data){
        if(err) {
            callback(err);
            return;
        }
        if(!data) return callback(null, 0);
        callback(null, data.length);
    });
};

CommentDao.prototype.getUserCommentPostList = function(userId, callback) {
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
    .sort({insertDatetime: -1})
    .exec(callback);
};

CommentDao.prototype.deleteComment = function(commentId, userId, callback) {
    try {
        validator.unsignedInteger(userId);
        validator.unsignedInteger(commentId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.update({
        commentId: commentId,
        userId: userId,
    },
    {
        $set: {
            deleteFlag: true
        }
    }, callback);
};

CommentDao.prototype.deleteAllCommentByPostId = function(postId, callback) {
    try {
        validator.unsignedInteger(postId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.update({
        postId: postId
    },
    {
        $set: {
            deleteFlag: true
        }
    },
    {
        multi: true
    }, callback);
};

var dao = new CommentDao();
dao.init();
module.exports = dao;
