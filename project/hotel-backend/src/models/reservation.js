const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reservationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    hotelId: {
      type: Schema.Types.ObjectId,
      ref: "hotels",
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "rooms",
    },
    spotId: {
      type: Schema.Types.ObjectId,
      ref: "spots",
    },
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: "tickets",
    },
    priceAmount: {
      type: Number,
      required: true,
    },
    feeAmount: {
      type: Number,
      default: 0,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    buyDate: {
      type: Date,
      default: Date.now,
    },
    timeRemainingForCancellation: {
      type: Number,
      default: 86400000,
    },
    paymentIntentId: {
      type: String,
      default: "",
    },
    reserveDates: [String],
    cancellationStatus: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("reservations", reservationSchema);
