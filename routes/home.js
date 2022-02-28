const express = require("express");
const router = express.Router();

const { TwitterUser } = require("../models/twitterUser");
const { Post } = require("../models/post");
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
    console.log("user", user);
    const post = await new Post({
      _creator: user._id,
      content: req.body.content,
    });

    post.save();

    //user.posts.push(post._id);
    //TwitterUser.updateOne(user, { $push: { posts: post._id } });
    res.redirect("home");
  } catch (err) {
    next(err);
  }
});
module.exports = router;
