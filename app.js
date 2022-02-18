const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const { TwitterUser } = require("./models/twitterUser");
const { Post } = require("./models/post");
const bodyParser = require("body-parser");

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

//users homepage
app.get("/home", async (req, res) => {
  try {
    const user = await TwitterUser.findOne({ username: "Britt Olsson" }).exec();
    const posts = await Post.find();
    res.render("index.ejs", { user, posts });
  } catch (err) {
    console.log(err.message);
  }
});

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
app.post("/home", (req, res, next) => {
  Post.create(req.body, async (err, post) => {
    if (err) {
      next(err);
    } else {
      const user = await TwitterUser.findOne({ username: "Britt Olsson" });
      user.posts = post._id;
      user.save((error, user) => {
        if (error) {
          next(error);
        } else {
          return res.redirect("home");
        }
      });
    }
  });
});
//user create a post , have to modify the code
// app.post("/home", async (req, res, next) => {
//   const post = await new Post(req.body);
//   console.log(post);
//   try {
//     await post.save();
//     res.redirect("/home");
//   } catch (err) {
//     next(err.message);
//   }
// });

//go to the specific users page when click en user icon and print all the posts
app.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find();
    const user = await TwitterUser.findOne({ _id: userId })
      .populate("posts")
      .exec();

    res.render("usersPosts.ejs", { user, posts });
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
