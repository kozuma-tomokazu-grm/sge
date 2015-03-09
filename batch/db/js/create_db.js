var db = db.getSiblingDB('rooming-develop');

db.createCollection("users");
db.createCollection("rooms");
db.createCollection("likes");
db.createCollection("comments");
