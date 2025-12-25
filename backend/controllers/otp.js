// controllers/studentController.js
const User = require("../schemas/user"); // your user schema
const Otp = require("../schemas/otp"); // OTP schema
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const sendMail = require("../helpers/sendMail");

/**
 * Controller to send OTP email
 * Expects { email } in req.body
 */
async function sendOtpEmail(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required", success: false });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    // Remove previous OTPs
    await Otp.deleteMany({ email });

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP in DB
    const otpEntry = new Otp({ email, code: otpCode });
    await otpEntry.save();

    // Read HTML template
    const templatePath = path.join(__dirname, "../template/otpTemplate.html");
    let htmlTemplate = fs.readFileSync(templatePath, "utf8");

    // Replace placeholders
    htmlTemplate = htmlTemplate.replace("{{name}}", user.fullName).replace("{{otp}}", otpCode);

    // Send OTP email
    const emailSent = await sendMail({
      toEmail: email,
      toName: user.fullName,
      subject: "Your New Otp Code",
      htmlContent: htmlTemplate,
    });

    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send OTP email", success: false });
    }

    return res.status(200).json({ message: "OTP sent successfully", success: true });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
}

/**
 * Controller to validate OTP and verify user
 * Expects { email, otpCode } in req.body
 */
async function validateOtp(req, res) {
  try {
    const { email, otpCode } = req.body;
    if (!email || !otpCode) {
      return res.status(400).json({ message: "Email and OTP code are required", success: false });
    }

    // Find OTP
    const otpEntry = await Otp.findOne({ email, code: otpCode });
    if (!otpEntry) {
      return res.status(400).json({ message: "Invalid OTP", success: false });
    }

    // Delete OTP after validation
    await Otp.deleteOne({ _id: otpEntry._id });

    // Update user's verified status
    const user = await User.findOneAndUpdate(
      { email },
      { verified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    return res.status(200).json({ message: "Account verified successfully", success: true });
  } catch (error) {
    console.error("Error validating OTP:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
}

module.exports = { sendOtpEmail, validateOtp };
