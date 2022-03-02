const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
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
  followers: [{ type: ObjectId, ref: "TwitterUser" }],
  // //a collection this user followed by
  following: [{ type: ObjectId, ref: "TwitterUser" }],
  // followers: {
  //   type: Array,
  //   default: [],
  // },
  // following: {
  //   type: Array,
  //   default: [],
  // },
});
twitterUserSchema.plugin(passportLocalMongoose);
const TwitterUser = mongoose.model("TwitterUser", twitterUserSchema);

exports.TwitterUser = TwitterUser;
