const express = require("express");
const router = express.Router();

const { TwitterUser } = require("../models/twitterUser");

//create user page
router.get("/", (req, res) => {
  res.render("createUser.ejs");
});

//create a new user
router.post("/", async (req, res, next) => {
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

module.exports = router;
