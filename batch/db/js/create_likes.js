var db = db.getSiblingDB('rooming-develop');

//like collection length
var likeNum;
try {
  likeNum = db.likes.count();
} catch(e) {
  print(e);
};

var userIds = db.users.find({}, {"userId": true}).toArray(), //ユーザーID一覧
    userIdIndex = 0;
var roomIds = db.rooms.find({}, {"roomId": true}).toArray(), //Room ID一覧
    roomIdIndex = 0;

var now = new Date();

//document variables
var likeId = likeNum, likeFlag, insertDatetime, updateDatetime, deleteFlag; 

for(var i = 0; i < 10; i++) {
  likeId++;
  roomIdIndex = Math.floor(roomIds.length * Math.random());
  userIdIndex = Math.floor(userIds.length * Math.random());
  likeFlag = (Math.round(Math.random() * 100) % 5) ? true : false;
  insertDatetime = new Date(now.getTime() - (Math.random() * 1000000000));
  updateDatetime = new Date((now.getTime() - insertDatetime.getTime()) * Math.random() + insertDatetime.getTime());
  deleteFlag = (Math.round(Math.random() * 100) % 5) ? false : true;

  db.likes.insert({
    "_id"            : likeId,
    "likeId"         : likeId,
    "roomId"         : roomIds[roomIdIndex].roomId,
    "userId"         : userIds[userIdIndex].userId,
    "likeFlag"       : likeFlag,
    "insertDatetime" : insertDatetime,
    "updateDatetime" : updateDatetime,
    "deleteFlag"     : deleteFlag
  });
}

/*
var likeSchema = new Schema({
	likeId: {type: Number},
  roomId: {type: Number},
  userId: {type: Number},
  likeFlag: {type: Boolean, default: false}
  insertDatetime: {type: Date, default: Date.now},
  updateDatetime: {type: Date, default: Date.now},
  deleteFlag: {type: Boolean, default: false}
});
*/

