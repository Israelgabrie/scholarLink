"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import AppImageSvg from "./../../svgs/appImageSvg"
import { sendOtp, validateOtp } from "../../services/otp";
import { toast } from "react-hot-toast";
import appLogoImage from "../../../public/img/appLogoImage.png";

export default function OTPVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const authMail = localStorage.getItem("authMail");
    if (!authMail) {
      navigate("/sign-in");
    } else {
      setEmail(authMail);
    }
  }, [navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }
    setOtp(newOtp);
    const nextEmptyIndex = newOtp.findIndex((digit) => !digit);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }
    setIsLoading(true);
    try {
      const response = await validateOtp({ email, otpCode: otpValue });
      if (response.success) {
        toast.success(response?.message || "Account verified successfully!");
        localStorage.removeItem("authMail");
        navigate("/sign-in");
      } else {
        toast.error(response?.message || "Invalid OTP. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      toast.error(error?.message || "An error occurred during verification.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) {
      toast.error(`Please wait ${formatTime(countdown)} before resending`);
      return;
    }
    setIsLoading(true);
    try {
      const response = await sendOtp({ email });
      if (response.success) {
        toast.success(response?.message || "OTP resent successfully!");
        setCountdown(120);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        toast.error(response?.message || "Failed to resend OTP.");
      }
    } catch (error) {
      toast.error(error?.message || "An error occurred while resending OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#F9FAFB" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <img
            src={appLogoImage}
            alt="ScholarLink Logo"
            className="h-24 w-auto"
          />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Verify Your Account
          </h2>
          <p className="text-gray-600 text-sm">
            We've sent a 6-digit verification code to your email
          </p>
          <p className="text-gray-500 text-xs mt-1 font-medium">{email}</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading}
                className="w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                style={{ borderColor: digit ? "#2E5C8A" : "#D1D5DB" }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full text-white py-3 rounded-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-4"
          style={{
            backgroundColor: isLoading ? "#9CA3AF" : "#006EF5",
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Verifying...
            </>
          ) : (
            "Verify Account"
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading || !canResend}
              className="font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition"
              style={{ color: canResend ? "#FFB800" : "#9CA3AF" }}
            >
              {canResend ? "Resend" : `Resend in ${formatTime(countdown)}`}
            </button>
          </p>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          {countdown > 0
            ? `Code expires in ${formatTime(countdown)}`
            : "Code expired. Please resend."}
        </div>
      </div>
    </div>
  );
}
