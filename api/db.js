var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var config = require('./config/config.js')
var mongoUrl = process.env.MONGODB_URI;
//var mongoUrl = "mongodb://127.0.0.1:27017";
exports.connect = function(callback) {
    MongoClient.connect(mongoUrl, function(err, db) {
        if (err) {
            callback(false);
        } else {
            callback(db);
            // db.close();
        }
    });
};