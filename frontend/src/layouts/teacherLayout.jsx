"use client";

import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import TeacherSidebar from "../components/teacher/navigation/sidebar";
import TeacherNavbar from "../components/teacher/navigation/navbar";
import { useUser } from "../contexts/userContext";
import { signInUser } from "../services/signIn";
import toast from "react-hot-toast";
import LoadingScreen from "../pages/loadingScreen/loadingScreen";

export default function TeacherLayout({ template = {} }) {
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
            const currentUser = response.user;
            setUser(currentUser);

            // Redirect based on role
            switch (currentUser.role) {
              case "teacher":
                // stay on teacher layout
                break;
              case "student":
                navigate("/student");
                break;
              case "admin":
                navigate("/admin");
                break;
              default:
                toast.error("Unauthorized User");
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
        <TeacherNavbar
          onToggleSidebar={handleToggleSidebar}
          template={{
            title: "Teacher Dashboard",
            user: {
              name: user?.name || "Teacher",
              email: user?.email || "",
              fallbackIconBg: "#6600cc",
            },
            ...template.navbar,
          }}
        />
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        <TeacherSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        <main className="flex-1 overflow-auto px-2 sm:px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
