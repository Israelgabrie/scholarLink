// routes/paystackRoutes.js
const paystackRouter = require("express").Router();
const { startPayment } = require("../controllers/paystack/startPayment");
const { webhookController } = require("../controllers/paystack/webhook");
const { getTransaction, getUserTransactions } = require("../controllers/paystack/transaction");

// Webhook route
paystackRouter.post("/webhook", (req, res) => {
  try {
    console.log(req.body)
    webhookController(req, res);
  } catch (error) {
    res.send({ success: false, message: error?.message });
  }
});

// Webhook route
paystackRouter.post("/pay", (req, res) => {
  try {
    startPayment(req, res);
  } catch (error) {
    res.send({ success: false, message: error?.message });
  }
});

// Webhook route
paystackRouter.post("/transaction", (req, res) => {
  try {
    getTransaction(req, res);
  } catch (error) {
    res.send({ success: false, message: error?.message });
  }
});

// Webhook route
paystackRouter.post("/user-transaction", (req, res) => {
  try {
    getUserTransactions(req, res);
  } catch (error) {
    res.send({ success: false, message: error?.message });
  }
});

// You can add the callback route later
// paystackRouter.get("/callback", callbackController);

module.exports = paystackRouter;
