// Navbar.jsx
"use client";

import { Menu, Bell, User, Search, Building2, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../contexts/userContext";

export default function Navbar({ onToggleSidebar, onNotificationClick, onSearch }) {
  const { user, loading: userLoading, error: userError } = useUser();
  const [showSearch, setShowSearch] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [imageErrors, setImageErrors] = useState({
    schoolLogo: false,
    userAvatar: false,
  });
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleImageError = (type) => {
    setImageErrors((prev) => ({ ...prev, [type]: true }));
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowUserDropdown(false);
    navigate("/logout");
  };

  if (userLoading) {
    return (
      <nav className="bg-white w-full shadow-md h-16 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-[#006ef5] border-t-transparent rounded-full animate-spin"></div>
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
    <>
      <style>
        {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .dropdown-enter {
            animation: slideDown 0.2s ease-out;
          }
        `}
      </style>

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
                  onError={() => handleImageError("schoolLogo")}
                  className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#006ef5] to-[#0052cc] flex items-center justify-center border border-gray-200 shadow-sm">
                  <Building2 className="h-6 w-6 text-white" />
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
                    focus:ring-2 focus:ring-[#006ef5] focus:border-transparent
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

              {/* USER DROPDOWN */}
              <div className="relative" ref={dropdownRef}>
                <div
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 pl-1 cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors"
                >
                  {user?.profileImage && !imageErrors.userAvatar ? (
                    <img
                      src={user.profileImage}
                      alt={user.fullName}
                      onError={() => handleImageError("userAvatar")}
                      className="h-9 w-9 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full flex items-center justify-center border-2 border-gray-200 shadow-sm bg-[#2E5C8A]">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}

                  <div className="hidden sm:flex flex-col">
                    <span className="text-sm font-medium text-gray-700">
                      {user?.fullName || "Guest User"}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {user?.role || "User"}
                    </span>
                  </div>
                </div>

                {/* DROPDOWN MENU */}
                {showUserDropdown && (
                  <div className="dropdown-enter absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}