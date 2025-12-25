const User = require("../schemas/user");
const School = require("../schemas/school");
const Otp = require("../schemas/otp");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const sendMail = require("../helpers/sendMail");
const { nanoid } = require("nanoid");

async function signUp(req, res) {
  try {
    // Trim all fields
    let {
      fullName,
      email,
      phoneNumber,
      password,
      confirmPassword,
      schoolName,
      schoolAddress,
      currentSession,
    } = req.body;

    fullName = fullName?.trim();
    email = email?.trim().toLowerCase();
    phoneNumber = phoneNumber?.trim();
    password = password?.trim();
    confirmPassword = confirmPassword?.trim();
    schoolName = schoolName?.trim();
    schoolAddress = schoolAddress?.trim();
    currentSession = currentSession?.trim();

    // Validate required fields
    if (
      !fullName ||
      !email ||
      !phoneNumber ||
      !password ||
      !confirmPassword ||
      !schoolName ||
      !schoolAddress ||
      !currentSession
    ) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Passwords do not match", success: false });
    }

    // Validate session format YYYY/YYYY with 1-year difference
    const sessionRegex = /^(\d{4})\/(\d{4})$/;
    const match = currentSession.match(sessionRegex);
    if (!match || parseInt(match[2]) - parseInt(match[1]) !== 1) {
      return res.status(400).json({
        message:
          "Session must be in the format YYYY/YYYY with a 1-year difference",
        success: false,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists", success: false });
    }

    // --- Generate OTP and send email BEFORE saving user ---
    await Otp.deleteMany({ email });
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpEntry = new Otp({ email, code: otpCode });
    await otpEntry.save();

    const templatePath = path.join(__dirname, "../template/otpTemplate.html");
    let htmlTemplate = fs.readFileSync(templatePath, "utf8");
    htmlTemplate = htmlTemplate.replace("{{name}}", fullName).replace("{{otp}}", otpCode);

    const emailSent = await sendMail({
      toEmail: email,
      toName: fullName,
      subject: "Welcome to Scholar Link! Verify Your Account",
      htmlContent: htmlTemplate,
    });

    if (!emailSent) {
      return res
        .status(500)
        .json({ message: "Failed to send OTP email", success: false });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Create school with correct field names
    console.log(nanoid(10))
    const newSchool = new School({
      schoolId: nanoid(10),
      name: schoolName,       // matches schema
      address: schoolAddress, // matches schema
      currentSession,
      paid: false,
    });
    await newSchool.save();

    // Save admin user with reference to school
    const newUser = new User({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      role: "admin",
      verified: false,
      school: newSchool._id,
    });
    await newUser.save();

    return res.status(201).json({
      message: "Admin and school registered successfully. OTP sent to email.",
      success: true,
    });
  } catch (error) {
    console.error("Error in admin sign up:", error);
    return res
      .status(500)
      .json({ message: error?.message, success: false });
  }
}

module.exports = { signUp };
