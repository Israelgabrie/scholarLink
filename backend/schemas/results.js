// schemas/resultSchema.js
const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    session: {
      type: String,
      required: true,
      trim: true,
    },
    term: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    testScore: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    examScore: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approved: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true },
);

// Compound index to ensure unique result per student, course, session, and term
resultSchema.index(
  { student: 1, course: 1, session: 1, term: 1 },
  { unique: true },
);

// Index for faster queries
resultSchema.index({ school: 1 });
resultSchema.index({ course: 1 });
resultSchema.index({ teacher: 1 });
resultSchema.index({ student: 1 });
resultSchema.index({ approved: 1 });

module.exports = mongoose.model("Result", resultSchema);
