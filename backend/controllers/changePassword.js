// controllers/changePasswordController.js
const User = require("../schemas/user");
const Otp = require("../schemas/otp");
const bcrypt = require("bcryptjs");

async function changePassword(req, res) {
  try {
    let { email, otpCode, password, confirmPassword } = req.body;

    email = email?.trim().toLowerCase();
    otpCode = otpCode?.trim();
    password = password?.trim();
    confirmPassword = confirmPassword?.trim();

    if (!email || !otpCode || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Check if OTP exists and is valid
    const otpEntry = await Otp.findOne({ email, code: otpCode });
    if (!otpEntry) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Hash the new password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    // Delete the OTP after successful use
    await Otp.deleteOne({ _id: otpEntry._id });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error in changePassword:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = { changePassword };
