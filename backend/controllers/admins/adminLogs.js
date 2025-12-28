const mongoose = require("mongoose");
const { Log } = require("../../schemas/logSchema");

async function getUserLogs(req, res) {
  try {
    const { userId, lastId, startDate, endDate } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId is required" });
    }

    // Safely cast userId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const query = {
      $or: [
        { actor: userObjectId },
        { involvedUsers: userObjectId },
        { content: { $regex: userId, $options: "i" } }, // fallback text match
      ],
    };

    /* ---------------- DATE FILTERING ---------------- */
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    /* ---------------- PAGINATION ---------------- */
    if (lastId) {
      query._id = { $lt: new mongoose.Types.ObjectId(lastId) };
    }

    const logs = await Log.find(query)
      .sort({ _id: -1 }) // newest first
      .limit(30); // consistent with your other controllers

    return res.status(200).json({
      success: true,
      message: "Logs fetched successfully",
      logs,
    });
  } catch (error) {
    console.error("Get user logs error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = { getUserLogs };
