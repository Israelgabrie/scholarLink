import React, { useState } from "react";
import { Eye, EyeOff, Upload, User } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import appLogoImage from "../../../public/img/appLogoImage.png";
import toast from "react-hot-toast";
import { addUser } from "../../services/invite";

export default function CreateAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing invite token");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      // Create FormData to send file and other data
      const formData = new FormData();
      formData.append("token", token);
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);

      // Only append userImage if one was selected
      if (profileImage) {
        formData.append("userImage", profileImage);
      }

      const response = await addUser(formData);
      // Handle success/error based on response
      if (response?.success) {
        toast.success(response?.message || "Account created successfully!");
        // Uncomment when ready to navigate
        navigate("/sign-in");
      } else {
        toast.error(response?.message || "Failed to create account");
      }
    } catch (error) {
      console.error("Create account error:", error);
      toast.error(error?.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <img
              src={appLogoImage}
              alt="ScholarLink Logo"
              className="h-24 w-auto"
            />
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-3">
            Invalid Invitation
          </h2>
          <p className="text-gray-600 mb-6">
            The invitation link is invalid or has expired. Please contact your
            administrator for a new invitation.
          </p>
          <button
            onClick={() => navigate("/sign-in")}
            className="px-6 py-2.5 bg-[#006ef5] text-white rounded-lg font-semibold hover:bg-[#0052cc] transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
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
            Complete Your Registration
          </h2>
          <p className="text-gray-500 text-sm">
            Set up your password and profile picture
          </p>
        </div>

        {/* Registration Form */}
        <div className="space-y-5">
          {/* Profile Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture (Optional)
            </label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile Preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-300">
                  <User className="w-10 h-10 text-gray-400" />
                </div>
              )}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Choose Photo
                </div>
              </label>
            </div>
            {profileImage && (
              <p className="text-xs text-gray-600 mt-2">
                Selected: {profileImage.name}
              </p>
            )}
          </div>

          {/* Password */}
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

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Confirm your password"
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
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full text-white py-2.5 rounded-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#006ef5" }}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </div>

        {/* Footer */}
        <div className="flex flex-row justify-center gap-2 mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <div
            className="font-medium hover:underline cursor-pointer"
            style={{ color: "#006ef5" }}
            onClick={() => navigate("/sign-in")}
          >
            Sign in
          </div>
        </div>
      </div>
    </div>
  );
}
