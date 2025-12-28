const mongoose = require("mongoose");

const inviteLinkSchema = new mongoose.Schema(
  {
    inviteToken: { type: String, required: true, unique: true }, // unique token for the link
    email: { type: String, required: true, lowercase: true, trim: true }, // recipient email
    name: { type: String, required: true, trim: true }, // recipient name
    role: {
      type: String,
      enum: ["student", "teacher"],
      default: "student",
    },
    // Optional pre-filled details
    matricNumber: { type: String, trim: true },
    department: { type: String, trim: true },
    program: { type: String, trim: true },
    session: { type: String, trim: true },
    className: { type: String, trim: true }, // added className

    // The school the invite belongs to
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },

    // The user who created the invite (admin or teacher)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Expiry date/time for the link
    expiresAt: { type: Date, required: true },

    // Whether the invite has been used
    used: { type: Boolean, default: false },
    usedAt: { type: Date }, // when the invite was used
  },
  { timestamps: true }
);

const InviteLink = mongoose.model("InviteLink", inviteLinkSchema);

module.exports = InviteLink;
