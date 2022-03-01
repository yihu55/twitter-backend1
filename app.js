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

const { TwitterUser } = require("./models/twitterUser");
const { Post } = require("./models/post");

const app = express();
const PORT = 3000;
const STATIC_ROOT = path.join(__dirname, "public");

const secured = (req, res, next) => {
  if (req.user) {
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

//go to the specific users page when click en user icon and print all the posts
// app.get("/users/:userId", async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const user = await TwitterUser.findOne({ _id: userId });
//     const img = await user.img;
//     //console.log(user);
//     const posts = await Post.find({ _creator: userId })
//       .populate("_creator")
//       .sort({ createdAt: -1 }) //desc createAt time
//       .exec();

//     res.render("userPosts.ejs", {
//       posts,
//       img,
//       //username: req.user.name,//return the inlogged username
//     });
//   } catch (err) {
//     console.log(err.message);
//   }
// });

connect();
app.listen(3000, () => {
  console.log(`Server running on port ${PORT}`);
});
//checkNotAuthenticate functin middleware
//checkAuthenticate function middleware
//delete module methodOverride
