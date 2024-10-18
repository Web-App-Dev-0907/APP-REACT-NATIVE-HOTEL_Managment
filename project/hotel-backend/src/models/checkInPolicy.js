const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const checkInPolicySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "hotel",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("check_in_policies", checkInPolicySchema);
