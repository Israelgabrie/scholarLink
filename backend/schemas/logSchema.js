const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    /* -------- WHAT HAPPENED -------- */
    title: {
      type: String,
      required: true,
      trim: true,
      default: "No title specified", // ✅ default if title not provided
    },

    content: {
      type: String,
      trim: true,
      default: "", // optional content default
    },

    action: {
      type: String,
      enum: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "INVITE_SENT",
        "INVITE_USED",
        "RESULT_UPLOADED",
        "COURSE_REG_OPENED",
        "COURSE_REG_CLOSED",
        "LOGIN",
        "LOGOUT",
        "UNKNOWN", // ✅ added
      ],
      required: true,
      default: "UNKNOWN", // ✅ default if action not provided
    },

    level: {
      type: String,
      enum: ["INFO", "WARNING", "ERROR"],
      default: "INFO",
    },

    /* -------- WHO DID IT -------- */
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* -------- WHO WAS AFFECTED -------- */
    involvedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    /* -------- EXTRA SAFE DATA -------- */
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

const Log = mongoose.model("Log", logSchema);

/* ---------------- HELPER FUNCTION ---------------- */
async function createLog({
  title = "No title specified",
  content = "",
  action = "UNKNOWN",
  actor,
  involvedUsers = [],
  level = "INFO",
  meta = {},
}) {
  try {
    if (!actor) {
      // actor is required, everything else has defaults
      throw new Error("actor is required to create a log");
    }

    const log = await Log.create({
      title,
      content,
      action,
      actor,
      involvedUsers,
      level,
      meta,
    });

    return log;
  } catch (error) {
    console.log("Log creation error:", error?.message);
    // fire-and-forget, does not throw
  }
}

module.exports = { Log, createLog };
