const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const profileRouter = require("./routes/profile");

const { TwitterUser } = require("./models/twitterUser");
const { Post } = require("./models/post");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");

const app = express();
const PORT = 3000;
const STATIC_ROOT = path.join(__dirname, "public");

const secured = (req, res, next) => {
  if (req.user) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect("/login");
};

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

//create user page
app.get("/createuser", (req, res) => {
  res.render("createUser.ejs");
});

//create a new user
app.post("/createuser", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = new TwitterUser({ username });
    await user.setPassword(password);
    //console.log(user);
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
//req.user.username
//users homepage render all followed posts
// app.get("/home", async (req, res) => {
//   // try {
//   //   const username = req.user.username;
//   //   console.log(username);
//   //
//   //   res.render("index.ejs", { username, posts });
//   // } catch (err) {
//   //   console.log(err.message);
//   // }
//   if (req.user) {
//     const posts = await Post.find().populate("_creator").exec();
//     res.render("index.ejs", posts);
//   } else {
//     redirect("/login");
//   }
// });
app.get("/home", secured, async (req, res, next) => {
  // try {
  //   if (req.user) {
  //     const posts = await Post.find().populate("_creator").exec();
  //     res.render("index.ejs", { username: req.user.username, posts });
  //   } else {
  //     res.redirect("/login");
  //   }
  // } catch (err) {
  //   next(err);
  // }
  try {
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
    const post = await new Post({
      _creator: user._id,
      content: req.body.content,
    });
    console.log(req.user);
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

app.use("/profile", secured, profileRouter);

const connect = async () => {
  await mongoose.connect("mongodb://localhost/twitterUsers");
  return mongoose.connection;
};
connect();

app.listen(3000, () => {
  console.log(`Server running on port ${PORT}`);
});

//exports.connect = connect;
