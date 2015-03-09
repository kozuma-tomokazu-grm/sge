// dao
var userDao = require('dao/userDao');

exports.index = {
    filter: function(request, response, next) {
        if (!request.session.userId) {
            next();
            return;
        }
        userDao.updateUpdateDatetimeByUserId({
            userId: request.session.userId,
            updateDatetime: new Date()
        }, next);
    }
};
