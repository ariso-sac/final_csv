const dbConfig = 'mongodb+srv://root:apiuser@cluster0.stnyb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig;
db.products = require("./models/product")(mongoose);

module.exports = db;