const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "admin", "superAdmin", "teacher"],
      default: "student",
    },
    matricNumber: { type: String, trim: true },
    department: { type: String, trim: true },
    program: { type: String, trim: true },
    session: { type: String, trim: true },
    className: { type: String, trim: true }, // added className
    phoneNumber: { type: String, trim: true },
    verified: { type: Boolean, default: false },
    profileImage: { type: String, default: "" },

    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    }, // reference to the school
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
