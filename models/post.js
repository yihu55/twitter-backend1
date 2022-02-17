const mongoose = require("mongoose");
const moment = require("moment");

const postsSchema = new mongoose.Schema({
  content: { type: String, maxLength: 140 },
  createdAt: {
    type: Date,
    immutable: true,
    default: () => moment().format(),
  },
  username: { type: mongoose.Schema.Types.ObjectId, ref: "TwitterUser" },
});
const Post = mongoose.model("Post", postsSchema);

exports.Post = Post;
