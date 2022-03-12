const express = require("express");
const router = express.Router();

const { TwitterUser } = require("../models/twitterUser");
const { Post } = require("../models/post");

//render all posts
router.get("/", async (req, res, next) => {
  try {
    //find all posts combine users table with _creator as link
    // const posts = await Post.find({})
    //   .sort({ createdAt: -1 })
    //   .populate("_creator")
    //   .exec();

    //render posts the inlogged user is following
    const userid = req.user.id;
    const currentUser = await TwitterUser.findById(req.user.id);
    const following = currentUser.following;
    const followingIds = following.map((f) => f.toString());
    followingIds.push(userid);
    console.log("followingIds", followingIds);

    console.log(typeof followingIds);
    console.log("type of req.user.id", typeof req.user.id);
    const posts = await Post.find({
      //   _creator: { $in: [{ followingIds }, userid] },

      _creator: followingIds,
    })
      .sort({
        createdAt: -1,
      })
      .populate("_creator")
      .exec();
    //ids not include followingids
    const notyetfollowings = await TwitterUser.find({
      _id: { $nin: followingIds },
    });

    res.render("index.ejs", {
      username: req.user.username,
      profileImg: req.user.img,
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
    const post = await new Post({
      _creator: user._id,
      content: req.body.content,
    });
    if (!post.content) {
      throw new Error("please fill content");
    }
    if (post.content.length > 140) {
      throw new Error("no more than 140 letters");
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
        res.redirect(`/home/${userId}`);
      } else {
        res.redirect(`/home/${userId}`);
      }
    } else {
      res.status(400).send("you can not follow yourself");
    }
  } catch (err) {
    res.sendStatus(500);
    next(err);
  }
});

router.post("/:userId/unfollow", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.user.id;
    const user = await TwitterUser.findById(userId);
    const currentUser = await TwitterUser.findById(currentUserId);
    if (currentUser.following.includes(userId)) {
      await user.updateOne({ $pull: { followers: currentUserId } });
      await currentUser.updateOne({ $pull: { following: userId } });
      res.redirect(`/home/${userId}`);
    } else {
      res.redirect(`/home/${userId}`);
    }
  } catch (err) {
    res.sendStatus(500);
    next(err);
  }
});

module.exports = router;
