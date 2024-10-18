const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hotels",
    },
    name: String,
    guestAllowed: Number,
    amenities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "amenities",
      },
    ],
    price: Number,
    wasPrice: Number,
    roomAvailable: Number,
    cancellationPolicy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cancellation_policies",
    },
    images: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("rooms", roomSchema);
