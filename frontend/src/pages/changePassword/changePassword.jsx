import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import appLogoImage from "../../../public/img/appLogoImage.png";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../../services/resetPassword";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("resetMail");
    if (!email) {
      toast.dismiss();
      toast.error("Please start the password reset process first");
      navigate("/forgot-password");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    const email = localStorage.getItem("resetMail");

    const resetPasswordData = {
      email: email,
      otpCode: otpCode,
      password: password,
      confirmPassword: confirmPassword,
    };

    console.log("Reset Password Data:", resetPasswordData);

    try {
      const response = await resetPassword(resetPasswordData);
      console.log(response);

      if (response.success) {
        toast.success("Password reset successful!");
        localStorage.removeItem("resetMail");
        navigate("/sign-in");
      } else {
        toast.error(response?.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-7">
        {/* Logo and Header */}
        <div className="text-center mb-5">
          <div className="flex items-center justify-center mb-2">
            <img
              src={appLogoImage}
              alt="ScholarLink Logo"
              className="h-20 w-auto"
            />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            Reset Password
          </h2>
          <p className="text-gray-500 text-sm">
            Enter OTP code and create a new password
          </p>
        </div>

        {/* Reset Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="otpCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              OTP Code
            </label>
            <input
              type="text"
              id="otpCode"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Enter 6-digit code"
              maxLength="6"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Enter new password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                {!showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Confirm new password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                {!showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full text-white py-2.5 rounded-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            style={{ backgroundColor: "#006ef5" }}
            disabled={isLoading}
          >
            {isLoading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>

        {/* Footer */}
        <div className="flex flex-row justify-center gap-2 mt-4 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <button
            type="button"
            onClick={() => navigate("/sign-in")}
            className="font-medium hover:underline"
            style={{ color: "#006ef5" }}
            disabled={isLoading}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
