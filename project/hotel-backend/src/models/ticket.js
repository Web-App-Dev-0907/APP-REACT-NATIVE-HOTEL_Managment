const mongoose = require("mongoose");

// Define the Note model Schema
const ticketSchema = new mongoose.Schema(
  {
    spot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "spots",
    },
    name: String,
    guestAllowed: Number,
    amenities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "amenities",
      },
    ],
    cancellationPolicy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cancellation_policies",
    },
    price: Number,
    wasPrice: Number,
    roomAvailable: Number,
    images: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("tickets", ticketSchema);
