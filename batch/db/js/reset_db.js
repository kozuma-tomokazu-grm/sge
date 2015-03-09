var db = db.getSiblingDB('rooming-develop');
var cols = db.getCollectionNames();

for (var i=0, len=cols.length; i < len; i++) {
  if (cols[i] != "system.indexes") {
    db.getCollection(cols[i]).drop();
  }
}
