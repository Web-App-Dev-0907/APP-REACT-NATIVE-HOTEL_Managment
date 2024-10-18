const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const typeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "hotel",
    },
    images: {
      type: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("types", typeSchema);
