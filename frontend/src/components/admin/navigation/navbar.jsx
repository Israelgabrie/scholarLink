"use client";

import { Menu, Bell, User, Search } from "lucide-react";
import { useState } from "react";
import appLogoImage from "../../../../public/img/appLogoImage.png";
import { useUser } from "../../../contexts/userContext";

export default function Navbar({ template = {} }) {
  const { user, loading: userLoading, error: userError } = useUser();
  const [showSearch, setShowSearch] = useState(false);

  // ✅ ALWAYS have a safe mergedTemplate fallback
  const mergedTemplate = {
    title: "Dashboard",
    school: {
      name: user?.school?.name || "ScholarLink International School",
      session: user?.school?.currentSession || "2024 / 2025 Academic Session",
      logoUrl: user?.school?.profileImage || null,
    },
    date: {
      locale: "en-US",
      format: {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      },
    },
    user: {
      name: user?.fullName || "John Doe",
      role: user?.role || "Administrator",
      avatarUrl: user?.profileImage || null,
      fallbackIconBg: "#2E5C8A",
    },
    actions: {
      onToggleSidebar: template.actions?.onToggleSidebar || (() => {}),
      onNotificationClick: template.actions?.onNotificationClick || (() => {}),
      onSearch: template.actions?.onSearch || (() => {}),
    },
    ...template,
  };

  const today = new Date().toLocaleDateString(
    mergedTemplate.date.locale,
    mergedTemplate.date.format
  );

  const logoSrc = mergedTemplate.school.logoUrl || appLogoImage;

  if (userLoading) {
    return (
      <nav className="bg-white w-full shadow-md h-16 flex items-center justify-center">
        Loading...
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
              onClick={mergedTemplate.actions.onToggleSidebar}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="h-6 w-6" />
            </button>

            <img
              src={logoSrc}
              alt="School Logo"
              className="h-9 w-auto object-contain"
            />

            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-gray-900">
                {mergedTemplate.title}
              </h1>
              <p className="text-xs text-gray-500">{today}</p>
            </div>
          </div>

          {/* CENTER */}
          <div className="hidden md:flex flex-col text-center">
            <span className="text-sm font-semibold text-gray-800">
              {mergedTemplate.school.name}
            </span>
            <span className="text-xs text-gray-500">
              {mergedTemplate.school.session}
            </span>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">

            {/* SEARCH */}
            <div className="relative flex items-center">
              <button
                onClick={() => setShowSearch((prev) => !prev)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Search className="h-5 w-5" />
              </button>

              <input
                type="text"
                placeholder="Search..."
                onBlur={() => setShowSearch(false)}
                onChange={(e) =>
                  mergedTemplate.actions.onSearch(e.target.value)
                }
                className={`
                  absolute right-10
                  h-9 px-3
                  border rounded-lg
                  text-sm outline-none
                  transition-all duration-300 ease-in-out
                  bg-white
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
              onClick={mergedTemplate.actions.onNotificationClick}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Bell className="h-5 w-5" />
            </button>

            {/* USER */}
            <div className="flex items-center gap-2 pl-1">
              {mergedTemplate.user.avatarUrl ? (
                <img
                  src={mergedTemplate.user.avatarUrl}
                  alt="User"
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: mergedTemplate.user.fallbackIconBg,
                  }}
                >
                  <User className="h-4 w-4 text-white" />
                </div>
              )}

              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-medium text-gray-700">
                  {mergedTemplate.user.name}
                </span>
                <span className="text-xs text-gray-500">
                  {mergedTemplate.user.role}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}
