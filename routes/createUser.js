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

    if (!username || !password) {
      res.status(400); //bad request
      throw new Error("Please add all fields");
    }

    //if user exist
    const userExists = await TwitterUser.findOne({ username });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

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
