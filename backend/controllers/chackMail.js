// controllers/checkEmailController.js
const User = require("../schemas/user");

async function checkEmail(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      return res.status(200).json({
        success: true,
        exists: true,
        message: "Email already exists",
      });
    } else {
      return res.status(200).json({
        success: true,
        exists: false,
        message: "Email is available",
      });
    }
  } catch (error) {
    console.error("Error in checkEmail:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = { checkEmail };
