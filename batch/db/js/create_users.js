var db = db.getSiblingDB('rooming-develop');

var userNum;
try {
  userNum = db.users.count();
} catch(e) {
  print(e);
};

var now = new Date();
var userId = userNum, insertDatetime, updateDatetime, gender, deleteFlag;

for(var i = 0; i < 10; i++) {
  userId++;
  gender = (Math.round(Math.random() * 100) % 2) ? "male" : "female";
  insertDatetime = new Date(now.getTime() - (Math.random() * 1000000000));
  updateDatetime = new Date((now.getTime() - insertDatetime.getTime()) * Math.random() + insertDatetime.getTime());
  deleteFlag = (Math.round(Math.random() * 100) % 3) ? false : true;

  db.users.insert({
    "_id"            : userId,
    "userId"         : userId,
    "facebookId"     : null,
    "twitterId"      : null,
    "username"       : "user-" + i,
    "gender"         : gender,
    "insertDatetime" : insertDatetime,
    "updateDatetime" : updateDatetime,
    "deleteFlag"     : deleteFlag
  });
}

/* REFER FROM model/users.js'
 *
 var userSchema = new Schema({
   userId: {type: Number},
   facebookId: {type: Object},
   twitterId: {type: Object},
   username: {type: String},
   gender: {type: String},
   imagePath: {type: String, default: 'https://s3-ap-northeast-1.amazonaws.com/postimage/sample.jpeg'},
   insertDatetime: {type: Date, default: Date.now},
   updateDatetime: {type: Date, default: Date.now},
   deleteFlag: {type: Boolean, default: false}
});
*/
