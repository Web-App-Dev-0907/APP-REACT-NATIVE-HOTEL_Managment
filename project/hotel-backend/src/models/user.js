const mongoose = require("mongoose");

// Define the Note model Schema
const userSchema = new mongoose.Schema(
  {
    name: String,
    country: String,
    phoneNumber: String,
    email: String,
    password: String,
    loginBy: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", userSchema);
