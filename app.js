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

const { TwitterUser } = require("./models/twitterUser");
const { Post } = require("./models/post");

const app = express();
const PORT = 3000;
const STATIC_ROOT = path.join(__dirname, "public");

// const secured = (req, res, next) => {
//   if (req.user) {
//     return next();
//   }
//   req.session.returnTo = req.originalUrl;
//   res.redirect("/login");
// };

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
passport.use(TwitterUser.createStrategy());
passport.serializeUser(TwitterUser.serializeUser());
passport.deserializeUser(TwitterUser.deserializeUser());

app.use("/createuser", createUserRouter);

//login page
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

// login authentication
app.post(
  "/login",
  passport.authenticate("local", {
    // successRedirect: "/home",
    failureRedirect: "/login",
    failureMessage: true,
  }),
  (req, res) => {
    res.redirect("/home");
  }
);

//go to the specific users page when click en user icon and print all the posts
app.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({ _creator: userId })
      .populate("_creator")
      .sort({ createdAt: -1 }) //desc createAt time
      .exec();

    res.render("userPosts.ejs", {
      posts,
      //username: req.user.name,//return the inlogged username
    });
  } catch (err) {
    console.log(err.message);
  }
});
app.use("/home", homeRouter);
app.use("/profile", profileRouter);

connect();
app.listen(3000, () => {
  console.log(`Server running on port ${PORT}`);
});
