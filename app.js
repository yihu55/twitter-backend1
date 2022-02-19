const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const { TwitterUser } = require("./models/twitterUser");
const { Post } = require("./models/post");
const bodyParser = require("body-parser");
const { render, redirect } = require("express/lib/response");

const app = express();
const PORT = 3000;
const STATIC_ROOT = path.join(__dirname, "public");

const connect = async () => {
  await mongoose.connect("mongodb://localhost/twitterUsers");
  return mongoose.connection;
};
connect();

app.use("/public", express.static(STATIC_ROOT));
//app.use(express.urlencoded());
app.use(bodyParser.urlencoded({ extended: true }));

//create user page
app.get("/createuser", (req, res) => {
  res.render("createUser.ejs");
});

//create a new user
app.post("/createuser", async (req, res, next) => {
  const user = await new TwitterUser(req.body);
  console.log(user);
  try {
    await user.save();
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
});

// login page
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

// login authentication
app.post("/login", (req, res) => {
  //kod for authentication
  res.redirect("index.ejs");
});

//users homepage render all followed posts
app.get("/home", async (req, res) => {
  try {
    const posts = await Post.find().populate("_creator").exec();
    res.render("index.ejs", { posts });
  } catch (err) {
    console.log(err.message);
  }
});

// send a post to server then render home page, data stored both in twitteruser and posts schema
app.post("/home", async (req, res, next) => {
  try {
    const user = await TwitterUser.findOne({ username: "Britt Olsson" });
    const post = await new Post({
      _creator: user._id,
      content: req.body.content,
    });
    post.save();
    user.posts.push(post._id);
    res.redirect("home");
  } catch (err) {
    next(err);
  }
});

//go to the specific users page when click en user icon and print all the posts
app.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({ _creator: userId });
    const user = await TwitterUser.findOne({ _id: userId })
      .populate("posts")
      .exec();

    res.render("userPosts.ejs", { user, posts });
  } catch (err) {
    console.log(err.message);
  }
});

//go to profile page when click profile icon
app.get("/profile", (req, res) => {
  res.render("profile.ejs");
});

//modify the profile
app.post("/profile", (req, res) => {
  res.render("profile.ejs");
});

app.listen(3000, () => {
  console.log(`Server running on port ${PORT}`);
});

exports.connect = connect;
