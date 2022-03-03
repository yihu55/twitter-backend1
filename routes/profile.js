const express = require("express");
const router = express.Router();
const multer = require("multer");

const { TwitterUser } = require("../models/twitterUser");

//define storage for the images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname); //name of file on the uploaders computer
  },
});
const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 3, //1mb
  },
});

//go to profile page when click profile icon
router.get("/", async (req, res, next) => {
  try {
    const username = req.user.username;
    const user = await TwitterUser.findOne({ username: username });
    const countFollowing = await TwitterUser.aggregate([
      { $match: { username: username } },
      { $project: { result: { $size: ["$following"] } } },
    ]);
    const countFollowers = await TwitterUser.aggregate([
      { $match: { username: username } },
      { $project: { result: { $size: ["$followers"] } } },
    ]);
    console.log(countFollowers[0].result, countFollowing[0].result);

    res.render("profile.ejs", {
      email: user.email,
      img: user.img,
      name: user.name,
      followers: countFollowers[0].result,
      following: countFollowing[0].result,
    }); //{ username: req.user.username })
  } catch (err) {
    next(err);
  }
});

//modify the profile //if email name or img is empty, they updates empty. behöver åtgärda
router.post("/", upload.single("image"), async (req, res, next) => {
  console.log(req.file);
  console.log(req.user.username);
  try {
    //const user = { username: "anna" };
    const username = req.user.username;
    console.log("USERNAME", username);
    await TwitterUser.updateOne(
      { username: username },
      {
        $set: {
          email: req.body.email,
          name: req.body.name,
          img: req.file.filename,
        },
      }
    );

    res.redirect("/profile");
  } catch (err) {
    next(err);
  }
});

// router.post("/", (req, res) => {
//   console.log(req.user.username);
// });
module.exports = router;
