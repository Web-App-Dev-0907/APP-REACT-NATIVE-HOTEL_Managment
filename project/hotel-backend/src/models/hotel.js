const mongoose = require("mongoose");

// Define the Note model Schema
const hotelSchema = new mongoose.Schema(
  {
    name: String,
    identifier: String,
    status: String,
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "types",
    },
    images: [String],
    location: String,
    position: {
      lat: Number,
      lng: Number,
    },
    description: String,
    amenities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "amenities",
      },
    ],
    checkIn: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "check_in_policies",
      },
    ],
    checkOut: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "check_out_policies",
      },
    ],
    openingDays: [String],
    fee: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("hotels", hotelSchema);
