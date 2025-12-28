import React, { useState } from "react";
import {
  Settings,
  User,
  Building2,
  MapPin,
  Phone,
  Image,
  Calendar,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "../../../contexts/userContext";
import { updateAdminUser } from "../../../services/updateUser";

export default function SettingsPage() {
  const { user, setUser } = useUser();

  // Personal Information - Auto-populated
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [userImage, setUserImage] = useState(null);
  const [userImagePreview, setUserImagePreview] = useState(
    user?.profileImage || null
  );

  // School Information - Auto-populated
  const [schoolName, setSchoolName] = useState(user?.school?.name || "");
  const [schoolAddress, setSchoolAddress] = useState(
    user?.school?.address || ""
  );
  const [currentSession, setCurrentSession] = useState(
    user?.school?.currentSession || ""
  );
  const [allowCourseRegistration, setAllowCourseRegistration] = useState(
    user?.school?.allowCourseRegistration ?? false
  );
  const [schoolImage, setSchoolImage] = useState(null);
  const [schoolImagePreview, setSchoolImagePreview] = useState(
    user?.school?.profileImage || null
  );

  // Loading state
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if allowCourseRegistration feature is available for this user
  const hasRegistrationFeature = user?.school?.hasOwnProperty(
    "allowCourseRegistration"
  );

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

  // Handle school image change
  const handleSchoolImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSchoolImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolImagePreview(reader.result);
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
      formData.append("schoolName", schoolName);
      formData.append("schoolAddress", schoolAddress);
      formData.append("currentSession", currentSession);
      formData.append(
        "allowCourseRegistration",
        allowCourseRegistration.toString()
      );

      if (userImage) {
        formData.append("userImage", userImage);
      }

      if (schoolImage) {
        formData.append("schoolImage", schoolImage);
      }

      const response = await updateAdminUser(formData);

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
          "An error occurred while updating settings"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium mb-2 flex items-center gap-2 text-[#006ef5]">
          <Settings color="#006ef5" className="mt-1" />
          Settings
        </h1>
        <p className="text-gray-600">Manage your account and school settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
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
            <p className="text-xs text-gray-400 mt-1">
              Email cannot be changed
            </p>
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
        </div>

        {/* School Information Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#006ef5]" />
            School Information
          </h2>

          {/* School Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School Name
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="Enter school name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* School Address */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              School Address
            </label>
            <textarea
              value={schoolAddress}
              onChange={(e) => setSchoolAddress(e.target.value)}
              placeholder="Enter school address"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          {/* Current Session */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Current Session
            </label>
            <input
              type="text"
              value={currentSession}
              onChange={(e) => setCurrentSession(e.target.value)}
              placeholder="e.g., 2024/2025"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Allow Course Registration Toggle */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allow Course Registration
            </label>
            <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-gray-50">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  Enable Course Registration
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {hasRegistrationFeature
                    ? "Allow students to register for courses"
                    : "This feature is not available for your account"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (hasRegistrationFeature) {
                    setAllowCourseRegistration(!allowCourseRegistration);
                  }
                }}
                disabled={!hasRegistrationFeature}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#006ef5] focus:ring-offset-2 ${
                  !hasRegistrationFeature
                    ? "bg-gray-300 cursor-not-allowed opacity-50"
                    : allowCourseRegistration
                    ? "bg-[#006ef5]"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                    allowCourseRegistration ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            {!hasRegistrationFeature && (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-amber-600 rounded-full"></span>
                Contact support to enable this feature
              </p>
            )}
          </div>

          {/* School Image */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Image className="w-4 h-4 inline mr-1" />
              School Logo/Image
            </label>
            <div className="flex items-center gap-4">
              {schoolImagePreview && (
                <img
                  src={schoolImagePreview}
                  alt="School Preview"
                  className="w-20 h-20 rounded-lg object-cover border-2 border-gray-300"
                />
              )}
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSchoolImageChange}
                  className="hidden"
                />
              </label>
            </div>
            {schoolImage && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {schoolImage?.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6">
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
