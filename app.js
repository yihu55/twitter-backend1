const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const connect = async () => {
  await mongoose.connect("mongodb://127.0.0.1/twitterUsers");
  return mongoose.connection;
};

const app = express();

const STATIC_ROOT = path.join(__dirname, "public");

app.use("/public", express.static(STATIC_ROOT));

const PORT = 3000;
app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.listen(3000, () => {
  console.log(`Server running on port ${PORT}`);
});

exports.connect = connect;
