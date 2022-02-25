const express = require("express");
const router = express.Router();
const passport = require("passport");

const { TwitterUser } = require("../models/twitterUser");

//login page
router.get("/login", (req, res) => {
  res.render("login.ejs");
});

// login authentication
router.post(
  "/login",
  passport.authenticate("local", {
    // successRedirect: "/home",
    failureRedirect: "/login",
    failureMessage: true,
  }),
  (req, res) => {
    res.redirect("/home");
  }
);

module.exports = router;
