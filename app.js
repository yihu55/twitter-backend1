const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const connect = require("./config/db");
const session = require("express-session");

const profileRouter = require("./routes/profile");
const createUserRouter = require("./routes/createUser");

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
    secret: "asdf1234",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.authenticate("session"));
passport.use(TwitterUser.createStrategy());
passport.serializeUser(TwitterUser.serializeUser());
passport.deserializeUser(TwitterUser.deserializeUser());

app.use("/createuser", createUserRouter);

// login page
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
//render all posts
app.get("/home", async (req, res, next) => {
  try {
    // find all posts combine users table with _creator as link
    const posts = await Post.find().populate("_creator").exec();

    res.render("index.ejs", { username: req.user.username, posts });
  } catch (err) {
    next(err);
  }
});

// send a post to server then render home page, data stored both in twitteruser and posts schema
app.post("/home", async (req, res, next) => {
  try {
    console.log("name", req.user.username);
    const username = req.user.username;
    const user = await TwitterUser.findOne({ username: username });
    console.log("user", user);
    const post = await new Post({
      _creator: user._id,
      content: req.body.content,
    });
    console.log(user.posts);
    post.save();

    //user.posts.push(post._id);
    TwitterUser.updateOne(user, { $push: { posts: post._id } });
    res.redirect("home");
  } catch (err) {
    next(err);
  }
});

//go to the specific users page when click en user icon and print all the posts
app.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({ _creator: userId })
      .populate("_creator")
      .exec();

    res.render("userPosts.ejs", { posts });
  } catch (err) {
    console.log(err.message);
  }
});

app.use("/profile", profileRouter);

connect();
app.listen(3000, () => {
  console.log(`Server running on port ${PORT}`);
});
