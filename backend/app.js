// Load env variables at the very top
require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");

const connectToDatabase = require("./config/db.js");
const { authRouter } = require("./routes/authRoutes.js");
const { enumRoutes } = require("./routes/enumRoutes");
const paystackRouter = require("./routes/payStackRoute.js");
const School = require("./schemas/school");
const { courseRouter } = require("./routes/courseRoute.js");
const updateRouter = require("./routes/updateRoutes.js");
const { inviteRouter } = require("./routes/invite.js");
const { logRouter } = require("./routes/adminRoutes.js");

// Add other routers here if needed
// const otpRouter = require("./routes/otpRouter.js");

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------- MIDDLEWARE -------------------

// Enable CORS for dev frontend (adjust origins as needed)
app.use(
  cors({
    origin: [
      "https://scholar-link-gamma.vercel.app",
      "https://nematocystic-noble-tropophilous.ngrok-free.dev",
    ],
    credentials: true,
  })
);


app.use(express.static(path.join(__dirname, "dist")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "script-src 'self'; " +
      "img-src 'self' data:;"
  );
  next();
});

// ------------------- API ROUTES -------------------
app.use("/auth", authRouter);
app.use("/enum", enumRoutes);
app.use("/paystack", paystackRouter);
app.use("/course", courseRouter);
app.use("/update", updateRouter);
app.use("/invite", inviteRouter);
app.use("/log", logRouter);

// ------------------- SERVE FRONTEND -------------------
app.use(express.static(path.join(__dirname, "dist")));

app.get(/^(?!\/auth).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Runs every day at midnight
cron.schedule("0 0 * * *", async () => {
  const now = new Date();
  const result = await School.updateMany(
    { paid: true, expiresAt: { $lte: now } },
    { $set: { paid: false } }
  );
  console.log(`Marked ${result.modifiedCount} schools as unpaid`);
});

async function startServer() {
  const isConnected = await connectToDatabase();

  if (!isConnected) {
    console.error("Failed to connect to MongoDB. Server will not start.");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
