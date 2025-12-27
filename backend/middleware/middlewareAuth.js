// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../schemas/user");

async function authenticateUser(req, res, next) {
  try {
    const token = req.cookies?.authToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No authentication token found",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    const user = await User.findById(decoded.id)
      .select("-password")
      .populate("school");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your account first",
      });
    }

    // ✅ Attach user to request for downstream handlers
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in authenticateUser middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = { authenticateUser };

