import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import appLogoImage from "../../../public/img/appLogoImage.png";
import { useNavigate } from "react-router-dom";
import { checkMail } from "../../services/userMail";
import toast from "react-hot-toast";
import { sendOtp } from "../../services/otp";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const forgotPasswordData = {
      email: email,
    };

    console.log("Forgot Password Data:", forgotPasswordData);

    try {
      const response = await checkMail(forgotPasswordData);
      console.log("Full Response:", response);

      if (response.success && response.exists) {
        console.log("Email exists, sending OTP...");
        
        const otpResponse = await sendOtp({ email: email });
        console.log("OTP Response:", otpResponse);
        
        if (otpResponse.success) {
          toast.success("OTP sent to your email");
          localStorage.setItem("resetMail", email);
          navigate("/reset-password");
        } else {
          toast.error(otpResponse?.message || "Failed to send OTP");
        }
      } else if (response.success && !response.exists) {
        toast.error("Email not found in our system");
      } else {
        toast.error(response?.message || "Failed to verify email");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-7">
        {/* Back Button */}
        <div
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-[#006ef5] transition-colors mb-5 cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back to Login</span>
        </div>

        {/* Logo and Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <img
              src={appLogoImage}
              alt="ScholarLink Logo"
              className="h-24 w-auto"
            />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-1.5">
            Forgot Password?
          </h2>
          <p className="text-gray-500 text-sm">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {/* Forgot Password Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="e.g., student@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="w-full text-white py-2.5 rounded-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#006ef5" }}
            disabled={isLoading}
          >
            {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <span
              onClick={() => navigate("/sign-in")}
              className="font-medium hover:underline cursor-pointer"
              style={{ color: "#006ef5" }}
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}