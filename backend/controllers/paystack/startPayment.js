// controllers/paystackController.js
const axios = require("axios");
const EnumSchema = require("../../schemas/enumSchema");
const User = require("../../schemas/user");
const School = require("../../schemas/school");

async function startPayment(req, res) {
  try {
    const { paymentType, userId, email } = req.body;

    if (!paymentType || !userId || !email) {
      return res.status(400).json({
        success: false,
        message: "paymentType, userId, and email are required",
      });
    }

    // 1️⃣ Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2️⃣ Get user's school
    const school = await School.findById(user.school);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    // 🚫 BLOCK if already paid
    if (school.paid === true) {
      return res.status(400).json({
        success: false,
        alreadyPaid: true,
        message: "School subscription is still active",
      });
    }

    // 3️⃣ Validate payment type
    if (paymentType !== "basicPlan") {
      return res.status(400).json({
        success: false,
        message: "Invalid payment type",
      });
    }

    // 4️⃣ Get plan amount
    const plan = await EnumSchema.findOne({ name: "basicPlan" });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    const amount = plan.values * 100; // Paystack uses kobo

    // 5️⃣ Initialize Paystack
    const response = await axios.post(
      `${process.env.PAYSTACK_URL}/transaction/initialize`,
      {
        email,
        amount,
        currency: "NGN",
        callback_url: process.env.CALLBACK_URL,
        metadata: {
          userId,
          schoolId: school._id,
          paymentType,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 6️⃣ Send payment link
    return res.status(200).json({
      success: true,
      authorization_url: response.data.data.authorization_url,
      reference: response.data.data.reference,
    });
  } catch (error) {
    console.error("Error starting payment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = { startPayment };
