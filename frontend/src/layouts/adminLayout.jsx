"use client";

// ============================================
// FILE: Layout.jsx
// PURE TEMPLATE-DRIVEN LAYOUT
// ============================================

import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import Sidebar from "../components/admin/navigation/sidebar";
import Navbar from "../components/admin/navigation/navbar";
import { useUser } from "../contexts/userContext";
import { signInUser } from "../services/signIn";
import toast from "react-hot-toast";
import LoadingScreen from "../pages/loadingScreen/loadingScreen";

/* =======================
   COMPONENT
======================= */

export default function AdminLayout({ template = {} }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    async function checkUser() {
      if (!user?._id) {
        try {
          const response = await signInUser();

          if (response?.success && response?.user?._id) {
            if (response?.user?.role == "admin") {
              setUser(response.user);
            } else {
              toast("Unauthorized User");
              navigate("/sign-in");
            }
          } else {
            toast.error("Please sign in to continue");
            navigate("/sign-in");
          }
        } catch (error) {
          console.error("Auth check error:", error);
          toast.error("Authentication failed");
          navigate("/sign-in");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }

    checkUser();
  }, [user, navigate, setUser]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden">
      {/* HEADER */}
      <header className="w-full z-30">
        <Navbar
          template={{
            title: "Admin Dashboard",
            user: {
              name: user?.name || "Admin User",
              email: user?.email || "",
              fallbackIconBg: "#006ef5",
            },
            ...template.navbar,
            actions: {
              ...template.navbar?.actions,
              onToggleSidebar: handleToggleSidebar,
            },
          }}
        />
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        <main className="flex-1 overflow-auto px-2 sm:px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
