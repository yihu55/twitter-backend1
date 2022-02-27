const express = require("express");
const router = express.Router();
const passport = require("passport");

const { TwitterUser } = require("../models/twitterUser");

passport.use(TwitterUser.createStrategy());
passport.serializeUser(TwitterUser.serializeUser());
passport.deserializeUser(TwitterUser.deserializeUser());
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
router.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/login");
});
module.exports = router;
