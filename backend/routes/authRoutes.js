const { signUp } = require("../controllers/signUp");
const { sendOtpEmail, validateOtp } = require("../controllers/otp");
const { signIn } = require("../controllers/signIn");
const { checkEmail } = require("../controllers/chackMail");
const { changePassword } = require("../controllers/changePassword");


const authRouter = require("express").Router();

authRouter.post("/sign-up", (req, res) => {
  try {
    signUp(req, res);
  } catch (error) {
    res.send({ message: error?.message, success: false });
  }
});

authRouter.post("/resend-otp", (req, res) => {
  try {
    sendOtpEmail(req, res);
  } catch (error) {
    res.send({ message: error?.message, success: false });
  }
});


authRouter.post("/check-otp", (req, res) => {
  try {
    validateOtp(req, res);
  } catch (error) {
    res.send({ message: error?.message, success: false });
  }
});

authRouter.post("/sign-in", (req, res) => {
  try {
    signIn(req, res);
  } catch (error) {
    res.send({ message: error?.message, success: false });
  }
});

authRouter.post("/check-mail", (req, res) => {
  try {
    checkEmail(req, res);
  } catch (error) {
    res.send({ message: error?.message, success: false });
  }
});

authRouter.post("/reset-password", (req, res) => {
  try {
    changePassword(req, res);
  } catch (error) {
    res.send({ message: error?.message, success: false });
  }
});

module.exports = { authRouter };
