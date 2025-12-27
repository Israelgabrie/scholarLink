import React, { useState } from "react";
import { Settings, User, Building2, MapPin, Phone, Image, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  // Personal Information
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  // School Information
  const [schoolName, setSchoolName] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [schoolImage, setSchoolImage] = useState(null);
  const [schoolImagePreview, setSchoolImagePreview] = useState(null);
  const [schoolSession, setSchoolSession] = useState("");

  // Loading states
  const [isUpdatingPersonal, setIsUpdatingPersonal] = useState(false);
  const [isUpdatingSchool, setIsUpdatingSchool] = useState(false);

  // Handle profile picture change
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle school image change
  const handleSchoolImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSchoolImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle personal info update
  const handleUpdatePersonalInfo = (e) => {
    e.preventDefault();
    setIsUpdatingPersonal(true);

    const personalData = {
      fullName,
      phoneNumber,
      profilePicture,
    };

    console.log("Updating personal info:", personalData);

    setTimeout(() => {
      setIsUpdatingPersonal(false);
      toast.success("Personal information updated!");
    }, 1000);
  };

  // Handle school info update
  const handleUpdateSchoolInfo = (e) => {
    e.preventDefault();
    setIsUpdatingSchool(true);

    const schoolData = {
      schoolName,
      schoolAddress,
      schoolImage,
      schoolSession,
    };

    console.log("Updating school info:", schoolData);

    setTimeout(() => {
      setIsUpdatingSchool(false);
      toast.success("School information updated!");
    }, 1000);
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

          <form onSubmit={handleUpdatePersonalInfo}>
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
                {profilePreview && (
                  <img
                    src={profilePreview}
                    alt="Profile Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                  />
                )}
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </label>
              </div>
              {profilePicture && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {profilePicture.name}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUpdatingPersonal}
              className="w-full bg-[#006ef5] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#0052cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingPersonal ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </div>
              ) : (
                "Update Personal Info"
              )}
            </button>
          </form>
        </div>

        {/* School Information Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#006ef5]" />
            School Information
          </h2>

          <form onSubmit={handleUpdateSchoolInfo}>
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

            {/* School Session */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Current Session
              </label>
              <input
                type="text"
                value={schoolSession}
                onChange={(e) => setSchoolSession(e.target.value)}
                placeholder="e.g., 2024/2025"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ef5] focus:border-transparent outline-none transition-all"
              />
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
                  Selected: {schoolImage.name}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUpdatingSchool}
              className="w-full bg-[#006ef5] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#0052cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingSchool ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </div>
              ) : (
                "Update School Info"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}