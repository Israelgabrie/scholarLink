const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema(
  {
    schoolId: { type: String, required: true, unique: true, trim: true }, // unique identifier for the school
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    currentSession: { type: String, trim: true },
    paid: { type: Boolean, default: false }, // tracks if the school has paid for the service
  },
  { timestamps: true }
);

const School = mongoose.model("School", schoolSchema);
module.exports = School;
