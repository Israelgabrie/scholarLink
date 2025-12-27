const Transaction = require("../../schemas/transactionSchema");
const User = require("../../schemas/user");
const School = require("../../schemas/school");
const axios = require("axios");

// controllers/paystackController.js
async function getTransaction(req, res) {
  try {
    const { userId, transactionId } = req.body;

    if (!userId && !transactionId) {
      return res.status(400).json({
        success: false,
        message: "userId or transactionId is required",
      });
    }

    // 1️⃣ If transactionId is provided, verify via Paystack API
    if (transactionId) {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const transactionData = response?.data?.data;

      // Check if the transaction belongs to this user
      if (transactionData?.metadata?.userId !== userId) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized to view this transaction",
        });
      }

      return res.status(200).json({
        success: true,
        data: transactionData, // paystack transaction details
      });
    }

    // 2️⃣ If only userId is provided, fetch transactions from your DB
    const transactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "fullName email school");

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No transactions found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("Error fetching transaction:", error.response?.data || error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.response?.data || error.message,
    });
  }
}

// controllers/paystackController.js
async function getUserTransactions(req, res) {
  try {
    let { search, startDate, endDate, userId, size = 30, lastId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    size = parseInt(size);

    // 1️⃣ Build query object
    const query = { user: userId };

    // Filter by search (reference or paymentType in metadata)
    if (search) {
      query.$or = [
        { reference: { $regex: search, $options: "i" } },
        { "metadata.paymentType": { $regex: search, $options: "i" } },
      ];
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Pagination: fetch transactions before lastId if provided
    if (lastId) {
      query._id = { $lt: lastId }; // assumes _id is ObjectId
    }

    // 2️⃣ Fetch transactions sorted by newest first
    const transactions = await Transaction.find(query)
      .sort({ _id: -1 })
      .limit(size)
      .populate("user", "fullName email school");

    return res.status(200).json({
      success: true,
      data: transactions,
      hasMore: transactions.length === size, // useful for infinite scroll
    });
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

module.exports = { getTransaction, getUserTransactions };
