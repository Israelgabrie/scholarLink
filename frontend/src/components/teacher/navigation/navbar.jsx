// ============================================
// FILE 2: TeacherNavbar.jsx
// Copy this entire code into your TeacherNavbar.jsx file
// ============================================

"use client";

import { Menu, Bell, User, Search, GraduationCap } from "lucide-react";
import { useState } from "react";
import { useUser } from "../../../contexts/userContext";

export default function TeacherNavbar({ onToggleSidebar, onNotificationClick, onSearch }) {
  const { user, loading: userLoading, error: userError } = useUser();
  const [showSearch, setShowSearch] = useState(false);
  const [imageErrors, setImageErrors] = useState({
    schoolLogo: false,
    userAvatar: false,
  });

  const handleImageError = (type) => {
    setImageErrors((prev) => ({ ...prev, [type]: true }));
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (userLoading) {
    return (
      <nav className="bg-white w-full shadow-md h-16 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-[#6600cc] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </nav>
    );
  }

  if (userError) {
    return (
      <nav className="bg-red-100 w-full shadow-md h-16 flex items-center justify-center text-red-600">
        {userError}
      </nav>
    );
  }

  return (
    <nav className="bg-white w-full shadow-md">
      <div className="px-3 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* School Logo */}
            {user?.school?.profileImage && !imageErrors.schoolLogo ? (
              <img
                src={user.school.profileImage}
                alt="School Logo"
                onError={() => handleImageError('schoolLogo')}
                className="h-10 w-10 rounded-lg object-cover border border-gray-200"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#6600cc] to-[#4a0099] flex items-center justify-center border border-gray-200 shadow-sm">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
            )}

            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-gray-900">Teacher Dashboard</h1>
              <p className="text-xs text-gray-500">{today}</p>
            </div>
          </div>

          {/* CENTER */}
          <div className="hidden md:flex flex-col text-center">
            <span className="text-sm font-semibold text-gray-800">
              {user?.school?.name || "Not Available"}
            </span>
            <span className="text-xs text-gray-500">
              {user?.school?.currentSession || "Not Available"}
            </span>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">
            {/* SEARCH */}
            <div className="relative flex items-center">
              <button
                onClick={() => setShowSearch((prev) => !prev)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>

              <input
                type="text"
                placeholder="Search..."
                onBlur={() => setShowSearch(false)}
                onChange={(e) => onSearch?.(e.target.value)}
                className={`
                  absolute right-10
                  h-9 px-3
                  border border-gray-300 rounded-lg
                  text-sm outline-none
                  transition-all duration-300 ease-in-out
                  bg-white
                  focus:ring-2 focus:ring-[#6600cc] focus:border-transparent
                  ${
                    showSearch
                      ? "w-48 opacity-100"
                      : "w-0 opacity-0 pointer-events-none"
                  }
                `}
              />
            </div>

            {/* NOTIFICATIONS */}
            <button
              onClick={onNotificationClick}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <Bell className="h-5 w-5" />
            </button>

            {/* USER */}
            <div className="flex items-center gap-2 pl-1">
              {user?.profileImage && !imageErrors.userAvatar ? (
                <img
                  src={user.profileImage}
                  alt={user?.fullName}
                  onError={() => handleImageError('userAvatar')}
                  className="h-9 w-9 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                />
              ) : (
                <div className="h-9 w-9 rounded-full flex items-center justify-center border-2 border-gray-200 shadow-sm bg-[#6600cc]">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}

              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-medium text-gray-700">
                  {user?.fullName || "Teacher"}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {user?.role || "Teacher"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}