const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const saleSchema = new Schema({
  reservationId: {
    type: Schema.Types.ObjectId,
    ref: "reservations",
  },
  priceAmount: {
    type: Number,
    required: true,
  },
  feeAmount: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  cancellationStatus: {
    type: Boolean,
    default: false,
  },
  paidWith: {
    type: String,
    required: true,
  },
  refundAmount: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("sales", saleSchema);
