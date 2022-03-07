if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const connect = require("./config/db");
const session = require("express-session");

const profileRouter = require("./routes/profile");
const createUserRouter = require("./routes/createUser");
const homeRouter = require("./routes/home");
const loginRouter = require("./routes/login");
const publicRouter = require("./routes/public");

const app = express();
const PORT = 3000;
const STATIC_ROOT = path.join(__dirname, "public");

const secured = (req, res, next) => {
  if (req.user) {
    console.log(req.user);
    return next();
  }
  //req.session.returnTo = req.originalUrl;
  res.redirect("/login");
};

app.use("/public", express.static(STATIC_ROOT));
//app.use(express.urlencoded());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.authenticate("session"));
app.use("/public", publicRouter);
app.use("/createuser", createUserRouter);
app.use("/", loginRouter);
app.use("/home", secured, homeRouter);
app.use("/profile", secured, profileRouter);

connect();
app.listen(3000, () => {
  console.log(`Server running on port ${PORT}`);
});
