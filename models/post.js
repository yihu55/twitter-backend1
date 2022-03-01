const mongoose = require("mongoose");
const moment = require("moment");

const postsSchema = new mongoose.Schema({
  _creator: { type: mongoose.Schema.Types.ObjectId, ref: "TwitterUser" },
  content: { type: String, maxLength: 140, required: true },
  createdAt: {
    type: String,
    immutable: true,
    default: () => moment().format("YYYY-MM-DD, HH:mm:ss"),
  },
});
const Post = mongoose.model("Post", postsSchema);

exports.Post = Post;
