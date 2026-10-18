
const mongoose = require("mongoose");

const milkRecordSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    milkType: {
      type: String,
      enum: ["Cow", "Buffalo"],
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.1
    },
    rate: {
      type: Number,
      required: true,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MilkRecord", milkRecordSchema);
