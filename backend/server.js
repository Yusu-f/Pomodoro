const express = require("express");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const open = require("open");

const app = express();
app.use(express.json());
app.use(cors());

var db;
MongoClient.connect("mongodb://localhost/pomodoroApp", {
  useUnifiedTopology: true,
})
  .then((connection) => {
    db = connection.db("pomodoroApp");
    app.listen(5000, () => {
      console.log(
        "App started on port 5000 and Mongodb connection established succesfully"
      );
    });
  })
  .catch((error) => {
    console.log("ERROR:", error);
  });

app.post("/", (req, res) => {
  let d = new Date().toDateString();

  open("http://localhost:3000");

  db.collection("Pomodoros")
    .find()
    .toArray()
    .then((array) => {
      let doc = array.find((doc) => {
        return doc._id == d;
      });
      if (doc) {
        db.collection("Pomodoros").updateOne(
          { _id: d },
          { $set: { completed: req.body.completed } }
        );
        res.json(req.body);
      } else {
        db.collection("Pomodoros").insertOne({
          _id: d,
          completed: req.body.completed,
        });
        res.json(req.body);
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/", (req, res) => {
  let d = new Date().toDateString();

  db.collection("Pomodoros")
    .find()
    .toArray()
    .then((array) => {
      let doc = array.find((doc) => {
        return doc._id == d;
      });
      if (doc) res.json(doc.completed);
      else {
        res.json(0);
      }
    })
    .catch((err) => {
      console.log(err);
    });
});
