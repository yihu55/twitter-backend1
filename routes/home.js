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

router.get("/:userId", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await TwitterUser.findOne({ _id: userId });
    const img = await user.img;
    console.log(user);
    console.log(req.user);
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

router.post("/:userId/follow", async (req, res, next) => {
  try {
    //britt
    const userId = req.params.userId;
    //anna as inlogged
    const currentUserId = req.user.id;
    //if britt and anna is not the same person
    if (userId !== currentUserId) {
      //get britt from database
      const user = await TwitterUser.findById(userId);
      //get anna from database
      const currentUser = await TwitterUser.findById(currentUserId);
      console.log(userId);
      //if already following userId
      if (
        //if in annas following not include britt
        !currentUser.following.includes(userId)
        //or britts followers not include anna
      ) {
        //push annasid in britts followers
        await user.updateOne({ $push: { followers: currentUserId } });
        //push brittsid in annas following
        await currentUser.updateOne({ $push: { following: userId } });
      } else {
        res.status(403); //equivalent o res.status(403).send('Forbidden')
        throw new Error("you already following this person");
      }
    } else {
      res.status(403);
      throw new Error("you can not follow yourself");
    }
  } catch (err) {
    res.sendStatus(500);
    next(err);
  }
});

module.exports = router;
