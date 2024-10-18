const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cancellationPolicySchema = new Schema(
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

module.exports = mongoose.model(
  "cancellation_policies",
  cancellationPolicySchema
);
