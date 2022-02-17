const mongoose = require("mongoose");

const twitterUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  //posts: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
});
const TwitterUser = mongoose.model("TwitterUser", twitterUserSchema);

exports.TwitterUser = TwitterUser;
