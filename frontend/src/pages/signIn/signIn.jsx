import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import appLogoImage from "../../../public/img/appLogoImage.png";
import { signInUser } from "../../services/signIn";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { sendOtp } from "../../services/otp";
import { useUser } from "../../contexts/userContext";

export default function ScholarLinkLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const loginData = { email, password, rememberMe };
    console.log("Login Data:", loginData);

    try {
      const response = await signInUser(loginData);
      console.log("Login Response:", response);

      if (!response) {
        toast.error("No response from server. Try again later.");
        return;
      }

      if (response.success) {
        const user = response.user;

        if (!user) {
          toast.error("User data missing from response.");
          return;
        }

        if (!user.verified) {
          toast("Account not verified");

          const otpResponse = await sendOtp({ email });
          if (otpResponse?.success) {
            localStorage.setItem("authMail", email);
            toast.success("OTP sent to your email");
            navigate("/otp");
          } else {
            toast.error(otpResponse?.message || "Failed to resend OTP.");
          }
          return;
        }

        // Set user for all roles
        setUser(user);

        // Redirect based on role
        switch (user.role) {
          case "teacher":
            navigate("/teacher");
            break;
          case "student":
            navigate("/student");
            break;
          case "admin":
            toast.success("Login successful! Redirecting...");
            navigate("/admin");
            break;
          default:
            toast("Layout not available yet");
        }
      } else {
        toast.error(response.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center p-2 sm:p-4 bg-white">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-5 sm:p-7 mt-8 sm:mt-12">
        {/* Logo and Header */}
        <div className="text-center mb-5">
          <div className="flex items-center justify-center mb-3">
            <img
              src={appLogoImage}
              alt="ScholarLink Logo"
              className="h-24 w-auto"
            />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-1.5">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-sm">Sign in with your email</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Email
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

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Enter your password"
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

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                style={{ accentColor: "#006ef5" }}
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <div
              type="button"
              className="text-sm font-medium hover:underline cursor-pointer"
              style={{ color: "#006ef5" }}
              disabled={isLoading}
              onClick={() => {
                navigate("/forgot-password");
              }}
            >
              Forgot password?
            </div>
          </div>

          <button
            type="submit"
            className="w-full text-white py-2.5 rounded-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#006ef5" }}
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="flex flex-row justify-center gap-2 mt-5 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <div
            type="button"
            className="font-medium hover:underline cursor-pointer"
            style={{ color: "#006ef5" }}
            disabled={isLoading}
            onClick={() => {
              navigate("/sign-up");
            }}
          >
            Sign up
          </div>
        </div>
      </div>
    </div>
  );
}
