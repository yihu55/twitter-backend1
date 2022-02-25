const mongoose = require("mongoose");

const connect = async () => {
  try {
    const connect = await mongoose.connect("mongodb://localhost/twitterUsers");
  } catch (err) {
    console.log(err);
  }
};

module.exports = connect;
