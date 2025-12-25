// Load env variables at the very top
require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectToDatabase = require("./config/db.js");
const { authRouter } = require("./routes/authRoutes.js");
// Add other routers here if needed
// const otpRouter = require("./routes/otpRouter.js");

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------- MIDDLEWARE -------------------

// Enable CORS for dev frontend (adjust origins as needed)
app.use(
  cors({
    origin: [
      "http://localhost:5173", // React dev server
      // Add other dev IPs if testing on LAN
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
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

// ------------------- SERVE FRONTEND -------------------

// Only serve React build in production

// ------------------- API ROUTES -------------------
app.use("/auth", authRouter);

// ------------------- SERVE FRONTEND -------------------
app.use(express.static(path.join(__dirname, "dist")));

app.get(/^(?!\/auth).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
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
