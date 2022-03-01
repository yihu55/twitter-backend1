const express = require("express");
const router = express.Router();

const { TwitterUser } = require("../models/twitterUser");
const { Post } = require("../models/post");

router.get("/", async (req, res, next) => {
  try {
    //find all posts combine users table with _creator as link
    const posts = await Post.find({})
      //.sort({ createdAt: -1 })
      .populate("_creator")
      .exec();

    res.render("publicHomePage.ejs", { posts });
  } catch (err) {
    next(err);
  }
});
router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(req.params);
    const user = await TwitterUser.findOne({ _id: userId });
    const img = await user.img;
    console.log(user);
    const posts = await Post.find({ _creator: userId })
      .populate("_creator")
      .sort({ createdAt: -1 }) //desc createAt time
      .exec();

    res.render("publicUserPage.ejs", {
      posts,
      img,
      //username: req.user.name,//return the inlogged username
    });
  } catch (err) {
    console.log(err.message);
  }
});
module.exports = router;
