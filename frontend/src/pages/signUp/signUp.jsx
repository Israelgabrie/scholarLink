import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { signUpUser } from "../../services/signUp";
import appLogoImage from "../../../public/img/appLogoImage.png";


export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    schoolName: "",
    schoolAddress: "",
    currentSession: "",
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const validateForm = () => {
    // Check if all fields are filled
    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter your email address");
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return false;
    }
    if (!formData.schoolName.trim()) {
      toast.error("Please enter your school name");
      return false;
    }
    if (!formData.schoolAddress.trim()) {
      toast.error("Please enter your school address");
      return false;
    }
    if (!formData.currentSession.trim()) {
      toast.error("Please enter the current session");
      return false;
    }
    if (!formData.password) {
      toast.error("Please enter a password");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (!formData.confirmPassword) {
      toast.error("Please confirm your password");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await signUpUser(formData);
      console.log("Sign up response:", response);

      if (response.success) {
        localStorage.setItem("authMail", formData.email);
        toast.success(
          response?.message ||
            "Account created successfully! Please verify your email."
        );
        navigate("/otp");
      } else {
        toast.error(
          response?.message || "Something went wrong. Please try again."
        );
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error(
        error?.message || "An error occurred during sign up. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Side - Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 fixed left-0 top-0 h-screen"
        style={{ backgroundColor: "#0A0E27" }}
      >
        <div className="max-w-md text-center">
          <div className="h-32 w-32 mx-auto  rounded-full flex items-center justify-center">
            <img
              src={appLogoImage}
              alt="ScholarLink Logo"
              className="h-24 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mt-8 mb-4">
            Manage Your Academic Journey
          </h1>
          <p className="text-gray-300 text-lg">
            Join thousands of students managing their academic records and
            progress with ease.
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-start text-left">
              <svg
                className="w-6 h-6 text-blue-400 mr-3 mt-1 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-white font-semibold">
                  Real-time Record Tracking
                </h3>
                <p className="text-gray-400 text-sm">
                  Monitor your academic records and performance instantly
                </p>
              </div>
            </div>
            <div className="flex items-start text-left">
              <svg
                className="w-6 h-6 text-blue-400 mr-3 mt-1 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-white font-semibold">Secure & Private</h3>
                <p className="text-gray-400 text-sm">
                  Your academic data is encrypted and protected
                </p>
              </div>
            </div>
            <div className="flex items-start text-left">
              <svg
                className="w-6 h-6 text-blue-400 mr-3 mt-1 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-white font-semibold">Easy to Use</h3>
                <p className="text-gray-400 text-sm">
                  Simple interface designed for students
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 lg:ml-auto overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
        <div className="w-full max-w-none md:max-w-4xl lg:max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Get started with ScholarLink
              </h2>
              <p className="text-gray-600 text-sm">
                Everything you need to stay on top of your academics.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="+234 800 000 0000"
                />
              </div>

              <div>
                <label
                  htmlFor="schoolName"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  School Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="schoolName"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="University of Lagos"
                />
              </div>

              <div>
                <label
                  htmlFor="schoolAddress"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  School Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="schoolAddress"
                  value={formData.schoolAddress}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Akoka, Yaba, Lagos"
                />
              </div>

              <div>
                <label
                  htmlFor="currentSession"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Current Session <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="currentSession"
                  value={formData.currentSession}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="2024/2025"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {!showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 6 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full text-white py-2.5 rounded-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#006ef5" }}
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
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>

            <div className="flex flex-row justify-center gap-2 mt-5 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <div
                type="button"
                onClick={() => navigate("/sign-in")}
                disabled={isLoading}
                className="font-medium hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: "#006ef5" }}
              >
                Sign in
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
