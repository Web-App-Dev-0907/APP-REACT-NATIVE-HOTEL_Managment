const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const searchLocationSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    formatted_address: String,
    latitude: Number,
    longitude: Number,
    icon: String,
    useDate: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("search_locations", searchLocationSchema);
