const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const twitterUserSchema = new mongoose.Schema({
  // username: { type: String, required: true, unique: true },
  // password: { type: String, required: true },
  //posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  img: {
    type: String,
  },
  email: { type: String },
  name: { type: String },
  //a collection this user following
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "TwitterUser" }],
  //a collection this user followed by
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "TwitterUser" }],
});
twitterUserSchema.plugin(passportLocalMongoose);
const TwitterUser = mongoose.model("TwitterUser", twitterUserSchema);

exports.TwitterUser = TwitterUser;
