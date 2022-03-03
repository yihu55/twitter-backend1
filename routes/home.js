const express = require("express");
const router = express.Router();

const { TwitterUser } = require("../models/twitterUser");
const { Post } = require("../models/post");
const { render } = require("express/lib/response");
//render all posts
router.get("/", async (req, res, next) => {
  try {
    //find all posts combine users table with _creator as link
    // const posts = await Post.find({})
    //   .sort({ createdAt: -1 })
    //   .populate("_creator")
    //   .exec();

    //the inlogged user is following
    const currentUser = await TwitterUser.findOne(
      { id: req.user.id }
      //{ following: 1 }
    );
    const following = currentUser.following;
    const followingIds = following.map((f) => f.toString());
    const posts = await Post.find({ _creator: followingIds })
      .sort({
        createdAt: -1,
      })
      .populate("_creator");

    //ids not include followingids
    const notyetfollowings = await TwitterUser.find({
      _id: { $nin: followingIds },
    });

    res.render("index.ejs", {
      username: req.user.username,
      posts,
      notyetfollowings,
    });
  } catch (err) {
    next(err);
  }
});

// send a post to server then render home page, data stored both in twitteruser and posts schema
router.post("/", async (req, res, next) => {
  try {
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
//db.twitterusers.aggregate([{$match:{username:"emma"}},{$project:{result:{$size:["$following"]}}}])
router.get("/:userId", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    // return userId
    console.log(userId);
    const user = await TwitterUser.findOne({ _id: userId });
    const img = await user.img;
    const currentUser = await TwitterUser.findById(req.user.id);
    const posts = await Post.find({ _creator: userId })
      .populate("_creator")
      .sort({ createdAt: -1 }) //desc createAt time
      .exec();

    res.render("userPosts.ejs", {
      posts,
      img,
      userId,
      user,
      username: req.user.name, //return the inlogged username
      currentUser: currentUser,
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
      //console.log(userId);
      //if anna not alreadry following britt
      if (!currentUser.following.includes(userId)) {
        //push annasid in britts followers
        await user.updateOne({ $push: { followers: currentUserId } });
        //push brittsid in annas following
        await currentUser.updateOne({ $push: { following: userId } });
        res.send("YOU ARE FOLLOWING THIS PERSON"); // have to send response, otherwise it´s keep pending
      } else {
        res.status(403).json("you already following this person");
      }
    } else {
      res.status(403).json("you can not follow yourself");
    }
  } catch (err) {
    res.sendStatus(500);
    next(err);
  }
});

router.post("/:userId/unfollow", async (req, res, next) => {
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
      //console.log(userId);
      //if anna not alreadry following britt
      if (currentUser.following.includes(userId)) {
        //push annasid in britts followers
        await user.updateOne({ $pull: { followers: currentUserId } });
        //push brittsid in annas following
        await currentUser.updateOne({ $pull: { following: userId } });
        res.send("YOU ARE NOT FOLLOWING THIS PERSON NOW"); // have to send response, otherwise it´s keep pending
      } else {
        res.status(403).json("you are not following this person");
      }
    } else {
      res.status(403).json("you can not unfollow yourself");
    }
  } catch (err) {
    res.sendStatus(500);
    next(err);
  }
});

module.exports = router;
