// schemas/transactionSchema.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reference: { type: String, required: true, unique: true },
    amount: { type: Number, required: true }, // in kobo
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    metadata: { type: Object, required: true }, // contains planType, userId, etc.
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
