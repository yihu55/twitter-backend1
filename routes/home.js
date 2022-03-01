const express = require("express");
const router = express.Router();

const { TwitterUser } = require("../models/twitterUser");
const { Post } = require("../models/post");
const { render } = require("express/lib/response");
//render all posts
router.get("/", async (req, res, next) => {
  try {
    //find all posts combine users table with _creator as link
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate("_creator")
      .exec();

    res.render("index.ejs", { username: req.user.username, posts });
  } catch (err) {
    next(err);
  }
});

// send a post to server then render home page, data stored both in twitteruser and posts schema
router.post("/", async (req, res, next) => {
  try {
    console.log("name", req.user.username);
    const username = req.user.username;
    const user = await TwitterUser.findOne({ username: username });
    //console.log("user", user);
    const post = await new Post({
      _creator: user._id,
      content: req.body.content,
    });
    if (!post.content) {
      throw new Error("please fill content");
    }

    post.save();

    //user.posts.push(post._id);
    //TwitterUser.updateOne(user, { $push: { posts: post._id } });
    res.redirect("home");
  } catch (err) {
    next(err);
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await TwitterUser.findOne({ _id: userId });
    const img = await user.img;
    console.log(user);
    const posts = await Post.find({ _creator: userId })
      .populate("_creator")
      .sort({ createdAt: -1 }) //desc createAt time
      .exec();

    res.render("userPosts.ejs", {
      posts,
      img,
      username: req.user.name, //return the inlogged username
    });
  } catch (err) {
    console.log(err.message);
  }
});
module.exports = router;
