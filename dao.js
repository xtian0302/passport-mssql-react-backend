const mongoose = require("mongoose");
const User = require("./user");

const db_name = "test";
const db_user = "devuser";
const db_pass = "devuser";
mongoose.connect(
  `mongodb://admin:efJLIn5lbLsgLmSJ@SG-test-39887.servers.mongodirector.com:27017/admin`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    console.log(`Mongoose connected to ${db_name} as ${db_user}` + err);
  }
);

var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
