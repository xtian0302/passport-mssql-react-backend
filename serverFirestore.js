//const mongoose = require("mongoose");
const admin = require("firebase-admin");
const serviceAccount = require("./dev-test-25bc6-firebase-adminsdk-hxe8h-af23768f71.json");
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const session = require("express-session");
const bodyParser = require("body-parser");
let apiPort = 4000;

const app = express();

//initialize Firestore
admin.initializeApp({
  credential: firebaseAdminSdk.credential.cert(
    JSON.parse(
      Buffer.from(process.env.GOOGLE_CONFIG_BASE64, "base64").toString("ascii")
    )
  ),
});

const db = admin.firestore();
//Middleware -------------------------------------------------------------

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//Cors
app.use(
  cors({
    origin: [
      "http://10.11.140.16:3001",
      "http://localhost:3001",
      "https://5fc6a12c6c3c5648bb10f34e--xtian0302.netlify.app/login",
      "https://5fc6a12c6c3c5648bb10f34e--xtian0302.netlify.app/register",
      "https://5fc6a12c6c3c5648bb10f34e--xtian0302.netlify.app",
    ],
    credentials: true,
  })
);
//Initialize cookie secret
app.use(session({ secret: "sectr", resave: true, saveUninitialized: true }));
app.use(cookieParser("sectr"));
//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
require("./passportFirestore")(passport);
//Routes -------------------------------------------------------------
app.post("/login", async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user) res.send("No User Exists");
    else {
      req.logIn(user, (err) => {
        if (err) throw err;
        res.send("Successfully Authenticated");
        console.log("Authernticated User (stored to session) : ", req.user);
      });
    }
  })(req, res, next);
});

app.get("/logout", function (req, res) {
  req.logout();
  res.send("logout success");
});

app.post("/register", async (req, res) => {
  try {
    let result1;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await db
      .collection("users")
      .add({
        username: req.body.username,
        password: hashedPassword,
      })
      .then(function (docRef) {
        console.log("Document written with ID: ", docRef.id);
        result1 = docRef.id;
      })
      .catch(function (error) {
        console.error("Error adding document: ", error);
      });
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

//Start Web Service
app.listen(apiPort, () => {
  console.log("Auth Server started at port : ", apiPort);
});
