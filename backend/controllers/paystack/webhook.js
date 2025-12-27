const Transaction = require("../../schemas/transactionSchema");
const User = require("../../schemas/user");
const School = require("../../schemas/school");
const crypto = require("crypto");

// controllers/paystackWebhookController.js
async function webhookController(req, res) {
  try {

    // 1️⃣ Verify Paystack signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    const paystackSignature = req.headers["x-paystack-signature"];
    if (hash !== paystackSignature) {
      console.warn("Invalid Paystack signature");
      return res.status(400).send("Invalid signature");
    }

    const { event, data } = req.body;

    // Only process successful charges
    if (event !== "charge.success") {
      console.log("Ignoring non-success event:", event);
      return res.status(200).json({ success: true });
    }

    // 2️⃣ Save transaction to DB
    let transaction = await Transaction.findOne({ reference: data.reference });
    if (!transaction) {
      transaction = new Transaction({
        reference: data.reference,
        amount: data.amount / 100, // store in Naira
        status: data.status,
        user: data.metadata.userId,
        paymentType: data.metadata.paymentType,
        paidAt: data.paid_at || new Date(),
        metadata: data.metadata,
      });
      await transaction.save();
    } else {
      // update existing if repeated webhook
      transaction.status = data.status;
      transaction.metadata = data.metadata;
      transaction.paidAt = data.paid_at || transaction.paidAt;
      await transaction.save();
    }

    // 3️⃣ Update user's school
    const user = await User.findById(data.metadata.userId).populate("school");
    if (user && user.school) {
      const school = user.school;
      school.paid = true;
      school.paymentDate = transaction.paidAt; // store payment date
      await school.save();
    }

    // 4️⃣ Return success to Paystack
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

module.exports = { webhookController };
