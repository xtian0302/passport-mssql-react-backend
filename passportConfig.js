const sql = require("mssql");
const bcrypt = require("bcrypt");
const localStrategy = require("passport-local").Strategy;

const config = {
  user: "sa",
  password: "Password1",
  server: "localhost\\S2012", // You can use 'localhost\\instance' to connect to named instance
  database: "testDatabase",
  options: { encrypt: false },
};

module.exports = function (passport) {
  passport.use(
    new localStrategy(async (username, password, done) => {
      let user = await getUser(username);
      if (user instanceof Error) {
        throw user;
      } else if (user) {
        await bcrypt.compare(password, user.password, (err, result) => {
          if (err) throw err;
          if (result === true) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        });
      }
    })
  );
  passport.serializeUser((user, cb) => {
    cb(null, user.Id);
  });

  passport.deserializeUser(async (id, cb) => {
    let user = await getUserByID(id);
    if (user instanceof Error) {
      throw user;
    } else if (user) {
      const userInformation = {
        username: user.username,
      };
      cb(null, userInformation);
    }
  });
};
getUser = async (username) => {
  try {
    let pool = await sql.connect(config);
    let result1;
    await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query("select * from account where username = @username")
      .then((res) => (result1 = res))
      .then(() => pool.close());
    return result1.recordset[0];
  } catch (err) {
    // ... error checks
    console.log(err);
    throw err;
  }
};
getUserByID = async (id) => {
  try {
    let pool = await sql.connect(config);
    let result1;
    await pool
      .request()
      .input("id", sql.Int, id)
      .query("select * from account where Id = @id")
      .then((res) => (result1 = res))
      .then(() => pool.close());
    return result1.recordset[0];
  } catch (err) {
    // ... error checks
    console.log(err);
    throw err;
  }
};
