var db = db.getSiblingDB('rooming-develop');

//like collection length
var commentNum;
try {
  commentNum = db.comments.count();
} catch(e) {
  print(e);
};

var userIds = db.users.find({}, {"userId": true}).toArray(), //ユーザーID一覧
    userIdIndex = 0;
var postIds = db.rooms.find({}, {"postId": true}).toArray(), //Post ID一覧
    postIdIndex = 0;

var now = new Date();

//document variables
var commentId = commentNum, likeFlag, insertDatetime, updateDatetime, deleteFlag; 

for(var i = 0; i < 10; i++) {
  commentId++;
  postIdIndex = Math.floor(postIds.length * Math.random());
  userIdIndex = Math.floor(userIds.length * Math.random());
  insertDatetime = new Date(now.getTime() - (Math.random() * 1000000000));
  updateDatetime = new Date((now.getTime() - insertDatetime.getTime()) * Math.random() + insertDatetime.getTime());
  deleteFlag = (Math.round(Math.random() * 100) % 3) ? false : true;

  db.comments.insert({
    "_id"            : commentId,
    "commentId"      : commentId,
    "roomId"         : roomIds[roomIdIndex].roomId,
    "userId"         : userIds[userIdIndex].userId,
    "comment"        : "some comments-" + commentId,
    "insertDatetime" : insertDatetime,
    "updateDatetime" : updateDatetime,
    "deleteFlag"     : deleteFlag
  });
}

