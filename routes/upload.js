var express = require('express');
var router = express.Router();
var formidable = require('formidable');
const mongodb = require('mongodb');
var fs = require('fs');
var csv = require("fast-csv");

/* GET users listing. */
router.post('/', function(req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.path;
      var newpath = './uploads/' + files.filetoupload.name;
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        //res.status(200).send('File uploaded and moved!');
         try {
        // Import CSV File to MongoDB database
        let csvData = [];
        
        fs.access(newpath, fs.constants.R_OK | fs.constants.W_OK, (err) => {
            if (err) {
                console.log("%s doesn't exist", newpath);
            } else {
                console.log('can read/write %s', newpath);
            }
        });
        fs.createReadStream(newpath)
            .pipe(csv.parse({ headers: true }))
            .on("error", (error) => {
                throw error.message;
            })
            .on("data", (row) => {
                csvData.push(row);
            })
            .on("end", () => {

              // Establish connection to the database
              const url = 'mongodb+srv://root:apiuser@cluster0.stnyb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
              var dbConn;
              mongodb.MongoClient.connect(url, {
                  useUnifiedTopology: true,
              }).then((client) => {
                  console.log('DB Connected!');
                  dbConn = client.db();

                  //inserting into the table "employees"
                  var collectionName = 'tutorials';
                  var collection = dbConn.collection(collectionName);
                  collection.insertMany(csvData, (err, result) => {
                      if (err) console.log(err);
                      if (result) {
                          res.status(200).send({
                              message:
                              "Upload/import the CSV data into database successfully: ",
                          });
                          client.close();
                      }
                  });
              }).catch(err => {
                  res.status(500).send({
                      message: "Fail to import data into database!",
                      error: err.message,
                  });
              });
          });
  } catch (error) {
      console.log("catch error", error);
      
  }
    });
 });
});

module.exports = router;
