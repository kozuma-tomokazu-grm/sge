var db = db.getSiblingDB('rooming-develop');

//room collection length
var roomNum;
try {
  roomNum = db.rooms.count();
} catch(e) {
  print(e);
};

var userIds = db.users.find({}, {"userId": true}).toArray(), //ユーザーID一覧
    userIdIndex = 0;
var now = new Date();

//document variables
var roomId = roomNum, insertDatetime, updateDatetime, deleteFlag; 

for(var i = 0; i < 10; i++) {
  roomId++;
  userIdIndex = Math.floor(userIds.length * Math.random());
  insertDatetime = new Date(now.getTime() - (Math.random() * 1000000000));
  updateDatetime = new Date((now.getTime() - insertDatetime.getTime()) * Math.random() + insertDatetime.getTime());
  deleteFlag = (Math.round(Math.random() * 100) % 3) ? false : true;

  db.rooms.insert({
    "_id"            : roomId,
    "roomId"         : roomId,
    "userId"         : userIds[userIdIndex].userId,
    "tagList"        : null,
    "text"           : "some text-" + roomId,
    "insertDatetime" : insertDatetime,
    "updateDatetime" : updateDatetime,
    "deleteFlag"     : deleteFlag
  });
}

