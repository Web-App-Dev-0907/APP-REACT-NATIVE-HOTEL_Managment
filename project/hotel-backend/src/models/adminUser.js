const mongoose = require("mongoose");

// Define the Note model Schema
const adminUserSchema = new mongoose.Schema(
  {
    name: String,
    password: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("admin_users", adminUserSchema);
