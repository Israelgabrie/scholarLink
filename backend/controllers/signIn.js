const User = require("../schemas/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function signIn(req, res) {
  try {
    // ✅ SAFE destructuring
    const { email, password, rememberMe } = req.body || {};
    const tokenFromCookie = req.cookies?.authToken;

    console.log(tokenFromCookie);

    let user;

    // -------------------
    // 1️⃣ LOGIN WITH EMAIL + PASSWORD
    // -------------------
    if (email && password) {
      const rawUser = await User.findOne({ email: email.toLowerCase() });
      if (!rawUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const isPasswordValid = bcrypt.compareSync(password, rawUser.password);
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid password" });
      }

      user = await User.findById(rawUser._id)
        .select("-password")
        .populate("school");

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: rememberMe ? "24h" : "1h" }
      );

      res.cookie("authToken", token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        sameSite: "lax", // ✅ REQUIRED for cross-domain (Render)
        maxAge: rememberMe ? 86400000 : 3600000,
      });

      return res.status(200).json({
        success: true,
        message: "Signed in successfully",
        user,
      });
    }

    // -------------------
    // 2️⃣ AUTO LOGIN VIA COOKIE
    // -------------------
    if (tokenFromCookie) {
      let decoded;

      try {
        decoded = jwt.verify(tokenFromCookie, process.env.JWT_SECRET);
      } catch {
        return res
          .status(401)
          .json({ success: false, message: "Invalid or expired session" });
      }

      user = await User.findById(decoded.id)
        .select("-password")
        .populate("school");

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      if (!user.verified) {
        return res.status(403).json({
          success: false,
          message: "Please verify your account first",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Logged in via cookie",
        user,
      });
    }

    // -------------------
    // 3️⃣ NO LOGIN DATA
    // -------------------
    return res.status(400).json({
      success: false,
      message: "No login credentials or session found",
    });
  } catch (error) {
    console.error("Error in signIn:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = { signIn };
