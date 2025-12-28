const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema(
  {
    schoolId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    currentSession: { type: String, trim: true },

    profileImage: {
      type: String,
      default: null,
    },

    paid: { type: Boolean, default: false },

    // ✅ Can students register courses?
    allowCourseRegistration: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("School", schoolSchema);
