import React, { useState } from "react";
import { Settings, User, Phone, Image } from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "../../../contexts/userContext";
import { updateTeacherUser } from "../../../services/updateUser";

export default function TeacherSettingsPage() {
  const { user, setUser } = useUser();

  // Personal Information
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [userImage, setUserImage] = useState(null);
  const [userImagePreview, setUserImagePreview] = useState(
    user?.profileImage || null,
  );

  // Loading state
  const [isUpdating, setIsUpdating] = useState(false);

  // Handle user image change
  const handleUserImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const formData = new FormData();
      formData.append("userId", user?._id || "");
      formData.append("fullName", fullName);
      formData.append("phoneNumber", phoneNumber);

      if (userImage) {
        formData.append("profileImage", userImage);
      }

      const response = await updateTeacherUser(formData);
      console.log(response)

      if (response?.success) {
        // Update user context with new data
        if (response?.user) {
          setUser(response.user);
        }

        toast.success(response?.message || "Settings updated successfully!");
      } else {
        toast.error(response?.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(
        error?.response?.data?.message ||
          "An error occurred while updating settings",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium mb-2 flex items-center gap-2 text-[#006ef5]">
          <Settings color="#006ef5" className="mt-1" />
          Settings
        </h1>
        <p className="text-gray-600">Manage your personal information</p>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-[#006ef5]" />
          Personal Information
        </h2>

        {/* Email (Non-editable) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
        </div>

        {/* Role (Non-editable) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <input
            type="text"
            value={user?.role || ""}
            disabled
            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed outline-none capitalize"
          />
          <p className="text-xs text-gray-400 mt-1">Role cannot be changed</p>
        </div>

        {/* Full Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Phone Number */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Profile Picture */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Image className="w-4 h-4 inline mr-1" />
            Profile Picture
          </label>
          <div className="flex items-center gap-4">
            {userImagePreview && (
              <img
                src={userImagePreview}
                alt="Profile Preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
              />
            )}
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors">
              Choose File
              <input
                type="file"
                accept="image/*"
                onChange={handleUserImageChange}
                className="hidden"
              />
            </label>
          </div>
          {userImage && (
            <p className="text-sm text-gray-600 mt-2">
              Selected: {userImage?.name}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleUpdateSettings}
          disabled={isUpdating}
          className="w-full bg-[#006ef5] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0052cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Updating Settings...
            </div>
          ) : (
            "Update Settings"
          )}
        </button>
      </div>
    </div>
  );
}