//const mongoose = require("mongoose");
const sql = require("mssql");
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const session = require("express-session");
const bodyParser = require("body-parser");
const User = require("./user");
let apiPort = 4000;

const app = express();

const config = {
  user: "sa",
  password: "Password1",
  server: "localhost\\S2012", // You can use 'localhost\\instance' to connect to named instance
  database: "testDatabase",
  options: { encrypt: false },
};
// const db_name = "";
// const db_user = "";
// const db_pass = "";

// mongoose.connect(
//   `mongodb+srv://${db_user}:<password>@cluster0.uoidc.mongodb.net/<dbname>?retryWrites=true&w=majority`,
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   },
//   () => {
//     console.log(`Mongoose connected to ${db_name} as ${db_user}`);
//   }
// );

//Middleware -------------------------------------------------------------

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);
app.use(session({ secret: "sectr", resave: true, saveUninitialized: true }));
app.use(cookieParser("sectr"));
app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);

//Routes -------------------------------------------------------------
app.post("/login", async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user) res.send("No User Exists");
    else {
      req.logIn(user, (err) => {
        if (err) throw err;
        res.send("Successfully Authenticated");
        console.log("Authernticated User(stored to session) : ", req.user);
      });
    }
  })(req, res, next);
});

app.post("/register", async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result1;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await pool
      .request()
      .input("username", sql.NVarChar, req.body.username)
      .input("password", sql.NVarChar, hashedPassword)
      .query(
        "INSERT INTO [dbo].[account] ([username],[password]) VALUES (@username, @password); SELECT SCOPE_IDENTITY() AS id;"
      )
      .then((res) => (result1 = res.recordset[0].id))
      .then(() => pool.close());

    res.send("account created at ID : " + result1);
  } catch (err) {
    // ... error checks
    console.log(err);
    res
      .status(400)
      .send(new Error("Failed to register account due to : " + err));
  }
});

app.get("/getUser", async (req, res) => {
  res.send(req.user); //req.user stores the user session that has been authenticated
});

app.listen(apiPort, () => {
  console.log("Auth Server started at port : ", apiPort);
});
