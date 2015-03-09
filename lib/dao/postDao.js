// third party
var util = require('util');
var _ = require('underscore');

// util
var validator = require('util/validator');

// base
var BaseDao = require('./baseDao');

var PostDao = function() {
    this.name = 'post';
}
util.inherits(PostDao, BaseDao);

/**
 * idからポスト内容を取得
 * param {int} id ポストID
 * result {Object} post
 *
 **/
PostDao.prototype.getByPostId = function(postId, callback) {
    try {
        validator.unsignedInteger(postId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.findOne({
        postId: postId,
        deleteFlag: false
    }, callback);
}

PostDao.prototype.getListByIdList = function(idList, callback) {
    try {
        validator.array(idList);
        _.each(idList, function(id) {
            validator.unsignedInteger(id);
        });

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.find({
        postId: { $in: idList },
        deleteFlag: false
    })
    .sort({ updateDatetime: -1 })
    .exec(callback);
}

/**
 * postを新着順に取得
 **/
PostDao.prototype.getList = function(params, callback) {
    try {
        validator.has(params, ['offset', 'limit']);
        validator.integer(params.offset);
        validator.unsignedInteger(params.limit);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    var skip = (params.offset - 1) * params.limit;
    self.schema.find({deleteFlag: false})
        .sort({insertDatetime: -1})
        .skip(skip)
        .limit(params.limit)
        .exec(callback);
}

/**
 * postを新着順に取得
 **/
PostDao.prototype.getListByLessThanId = function(params, callback) {
    try {
        validator.has(params, ['offset', 'limit', 'lessThanId']);
        validator.integer(params.offset);
        validator.unsignedInteger(params.limit);
        validator.unsignedInteger(params.lessThanId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    var skip = (params.offset - 1) * params.limit;
    self.schema.find({
        postId: {$lt: params.lessThanId},
        deleteFlag: false
    })
    .sort({postId: -1})
    .skip(skip)
    .limit(params.limit)
    .exec(callback);
}

/**
 * 新規postをDBに追加
 *
 * param {Object} params
 * param {int} params.userId ユーザーID
 * param {string} params.iamgePath 画像パス
 * param {string} params.title タイトル
 * param {string} params.content 内容
 * param {string} params.date
 * param {string} params.place
 * param {string} params.address
 * result
 *
 **/
PostDao.prototype.add = function(params, callback) {
    try {
        validator.has(params, ['userId', 'imagePath', 'title', 'content', 'date', 'hour', 'money', 'place', 'address', 'url']);
        validator.unsignedInteger(params.userId);
        validator.string(params.imagePath);
        validator.string(params.title);
        if (params.content) {
            validator.string(params.content);
        }

        if (params.date) {
            validator.string(params.date);
        }
        if (params.hour) {
            validator.string(params.hour);
        }
        if (params.money) {
            validator.string(params.money);
        }
        if (params.pay) {
            validator.integer(params.pay);
        }
        if (params.place) {
            validator.string(params.place);
        }
        if (params.address) {
            validator.string(params.address);
        }
        if (params.url) {
            validator.string(params.url);
        }

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var schema = this.schema;
    var post = new schema({
        userId:       params.userId,
        imagePath:    params.imagePath,
        title:        params.title,
        content:      params.content,
        date:         params.date,
        hour:         params.hour,
        money:        params.money,
        pay:          params.pay,
        place:        params.place,
        address:      params.address,
        url:          params.url
    });

    post.save(callback);
}

/**
 * 新規postをDBに追加
 *
 * param {Object} params
 * param {int} params.userId ユーザーID
 * param {string} params.iamgePath 画像パス
 * param {string} params.title タイトル
 * param {string} params.content 内容
 * param {string} params.date
 * param {string} params.place
 * param {string} params.address
 * result
 *
 **/
PostDao.prototype.updateByPostId = function(params, callback) {
    try {
        validator.has(params, ['postId', 'title', 'content', 'date', 'hour', 'money', 'place', 'address', 'url']);
        validator.unsignedInteger(params.postId);
        validator.string(params.title);
        if (params.content) {
            validator.string(params.content);
        }
        if (params.date) {
            validator.string(params.date);
        }
        if (params.hour) {
            validator.string(params.hour);
        }
        if (params.money) {
            validator.string(params.money);
        }
        if (params.place) {
            validator.string(params.place);
        }
        if (params.address) {
            validator.string(params.address);
        }
        if (params.url) {
            validator.string(params.url);
        }

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.update({postId: params.postId}, {
        $set: {
            // imagePath: params.imagePath,
            title: params.title,
            content: params.content,
            date: params.date,
            hour: params.hour,
            money: params.money,
            place: params.place,
            address: params.address,
            url: params.url,
            updateDatetime: new Date()
        }
    }, callback);
}

/**
 * userIdからpostを取得
 * param {int} userId
 * result {Object} post
 *
 **/
PostDao.prototype.getByUserId = function(params, callback) {
    try {
        validator.has(params, ['userId', 'offset', 'limit']);
        validator.unsignedInteger(params.userId);
        validator.integer(params.offset);
        validator.unsignedInteger(params.limit);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    var skip = (params.offset - 1) * params.limit;
    self.schema.find({
        userId: params.userId,
        deleteFlag: false,
    })
    .sort({postId: -1})
    .skip(skip).limit(params.limit)
    .exec(callback);
}

PostDao.prototype.getListByUserIdAndUpdateDatetimeLimit = function(params, callback) {
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
    self.schema.find({
        userId: params.userId,
        updateDatetime: { $lt: params.updateDatetime },
        deleteFlag: false
    })
    .sort({updateDatetime: -1})
    .limit(params.limit)
    .exec(callback);
}

PostDao.prototype.getCountByUserId = function(userId, callback) {
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
    }, function(error, data){
        if(error) {
            callback(error);
            return;
        }
        if(!data) return callback(null, 0);
        callback(null, data.length);
    });
};

/**
 * postを新着順に取得
 **/
PostDao.prototype.newarrivalsByFollowedUserIdList = function(params, callback) {
    try {
        validator.has(params, ['followedUserIdList', 'offset', 'limit']);
        validator.array(params.followedUserIdList);
        _.each(params.followedUserIdList, function(followedUserId) {
            validator.unsignedInteger(followedUserId);
        });
        validator.integer(params.offset);
        validator.unsignedInteger(params.limit);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    var skip = (params.offset - 1) * params.limit;
    self.schema.find({
        deleteFlag: false,
        userId: {
            $in: params.followedUserIdList
        }
    })
    .sort({insertDatetime: -1})
    .skip(skip)
    .limit(params.limit)
    .exec(callback);
}

/**
 *
 **/
PostDao.prototype.getListByFollowedUserIdListAndLimit = function(params, callback) {
    try {
        validator.has(params, ['followedUserIdList', 'limit', 'lessThanId']);
        _.each(params.followedUserIdList, function(followedUserId) {
            validator.unsignedInteger(followedUserId);
        });
        validator.unsignedInteger(params.limit);
        validator.unsignedInteger(params.lessThanId);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.find({
        deleteFlag: false,
        postId: { $lt: params.lessThanId },
        userId: { $in: params.followedUserIdList }
    })
    .sort({insertDatetime: -1})
    .limit(params.limit)
    .exec(callback);
}

/**
 * post件数を取得
 **/
PostDao.prototype.getUserPostCount = function(userId, callback) {
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

/**
 * 削除
 **/
PostDao.prototype.delete = function(id, callback) {
    try {
        validator.unsignedInteger(id);

        validator.function(callback);
    } catch (error) {
        callback(error);
        return;
    }

    var self = this;
    self.schema.update({
        postId: id
    },
    {
        $set: {
            deleteFlag: true
        }
    }, callback);
};

var dao = new PostDao();
dao.init();
module.exports = dao;
