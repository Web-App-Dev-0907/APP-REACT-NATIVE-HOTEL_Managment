const mongoose = require("mongoose");

// Define the Note model Schema
const spotSchema = new mongoose.Schema(
  {
    name: String,
    identifier: String,
    description: String,
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "types",
    },
    location: String,
    position: {
      lat: Number,
      lng: Number,
    },
    amenities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "amenities",
      },
    ],
    entrancePolicies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "check_in_policies",
      },
    ],
    closingPolicies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "check_out_policies",
      },
    ],
    openingDays: [String],
    images: [String],
    fee: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("spots", spotSchema);
