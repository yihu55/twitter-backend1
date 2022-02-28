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
});
twitterUserSchema.plugin(passportLocalMongoose);
const TwitterUser = mongoose.model("TwitterUser", twitterUserSchema);

exports.TwitterUser = TwitterUser;
