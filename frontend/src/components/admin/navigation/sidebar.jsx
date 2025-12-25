"use client";

// ============================================
// FILE 1: Sidebar.jsx
// Copy this entire code into your Sidebar.jsx file
// ============================================

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Settings,
  ShieldCheck,
  FileBarChart,
  UserPlus,
  Mail,
  Lock,
  ChevronDown,
  X,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useUser } from "../../../contexts/userContext";

export default function Sidebar({ isOpen, setIsOpen }) {
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const location = useLocation();
  const {user} = useUser()

  useEffect(()=>{
    console.log(user)
  },[user])

  const menu = [
    {
      name: "Admin Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
      submenu: null,
    },
    {
      name: "User Management",
      icon: Users,
      path: "/admin/users",
      submenu: [
        { name: "All Users", path: "/admin/users/all", icon: Users },
        { name: "Add User", path: "/admin/users/add", icon: UserPlus },
      ],
    },
    {
      name: "Security",
      icon: ShieldCheck,
      path: "/admin/security",
      submenu: null,
    },
    {
      name: "Analytics",
      icon: FileBarChart,
      path: "/admin/analytics",
      submenu: null,
    },
    {
      name: "Communications",
      icon: Mail,
      path: "/admin/comms",
      submenu: null,
    },
    {
      name: "System Logs",
      icon: Lock,
      path: "/admin/logs",
      submenu: null,
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/admin/settings",
      submenu: null,
    },
  ];

  useEffect(() => {
    menu.forEach((item) => {
      if (
        item.submenu &&
        item.submenu.some((sub) => sub.path === location.pathname)
      ) {
        setOpenSubmenu(item.name);
      }
    });
  }, [location.pathname]);

  const handleItemClick = (item) => {
    if (item.submenu) {
      setOpenSubmenu(openSubmenu === item.name ? null : item.name);
    } else {
      if (window.innerWidth < 1024) setIsOpen(false);
    }
  };

  const isParentActive = (item) => {
    if (!item.submenu) return false;
    return item.submenu.some((sub) => sub.path === location.pathname);
  };

  const isActive = (path) => {
    if (!path) return false;
    if (location.pathname === "/" && path === "/admin/dashboard") return true;
    return location.pathname === path;
  };

  return (
    <>
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          .animated-gradient {
            background: linear-gradient(135deg, #001a33, #003d66, #005199, #006ef5, #005199, #003d66, #001a33);
            background-size: 400% 400%;
            animation: gradientShift 6s ease infinite;
          }
        `}
      </style>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`animated-gradient fixed lg:relative left-0 top-0 h-full w-64 text-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
        style={{
          boxShadow:
            "4px 0 24px rgba(0, 0, 0, 0.3), 8px 0 48px rgba(0, 110, 245, 0.15)",
        }}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 lg:hidden text-white hover:bg-white/10 p-2 rounded-lg transition"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="h-full p-3 pt-10 overflow-y-auto">
          <div className="space-y-3">
            {menu.map((item) => {
              const Icon = item.icon;
              const parentActive = isParentActive(item);

              return (
                <div key={item.name}>
                  {item.submenu ? (
                    <div
                      onClick={() => handleItemClick(item)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                        parentActive ||
                        (openSubmenu === item.name && parentActive)
                          ? "bg-white text-[#006ef5] shadow-lg"
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {item.name}
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 flex-shrink-0 transition-transform duration-300 ${
                          openSubmenu === item.name ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  ) : (
                    <NavLink
                      to={item.path}
                      onClick={() => handleItemClick(item)}
                      className={({ isActive: navIsActive }) =>
                        `w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                          navIsActive || isActive(item.path)
                            ? "bg-white text-[#006ef5] shadow-lg"
                            : "text-white hover:bg-white/10"
                        }`
                      }
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {item.name}
                        </span>
                      </div>
                    </NavLink>
                  )}

                  {item.submenu && (
                    <div
                      className={`ml-4 overflow-hidden transition-all duration-300 ease-in-out ${
                        openSubmenu === item.name
                          ? "max-h-40 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="mt-1 space-y-1">
                        {item.submenu.map((sub) => {
                          const SubIcon = sub.icon;
                          return (
                            <NavLink
                              key={sub.name}
                              to={sub.path}
                              onClick={() =>
                                window.innerWidth < 1024 && setIsOpen(false)
                              }
                              className={({ isActive: navIsActive }) =>
                                `w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                                  navIsActive
                                    ? "text-white bg-white/20"
                                    : "text-white/80 hover:bg-white/10"
                                }`
                              }
                            >
                              <SubIcon className="h-4 w-4 flex-shrink-0" />
                              <span>{sub.name}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
