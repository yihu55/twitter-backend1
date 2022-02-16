const mongoose = require("mongoose");

const twitterUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});
const TwitterUser = mongoose.model("TwitterUser", twitterUserSchema);

exports.TwitterUser = TwitterUser;
