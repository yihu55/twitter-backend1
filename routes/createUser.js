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

    //use passport to hash the password then store in db
    await user.setPassword(password);

    await user.save();
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
    res.redirect("/createuser");
  }
});

module.exports = router;
