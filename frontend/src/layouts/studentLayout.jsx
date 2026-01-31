import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import StudentSidebar from "../components/student/navigation/sidebar";
import StudentNavbar from "../components/student/navigation/navbar";
import { useUser } from "../contexts/userContext";
import { signInUser } from "../services/signIn";
import toast from "react-hot-toast";
import LoadingScreen from "../pages/loadingScreen/loadingScreen";

/* =======================
   COMPONENT
======================= */

export default function StudentLayout({ template = {} }) {
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
              case "student":
                // stay on student layout
                break;
              case "teacher":
                navigate("/teacher");
                break;
              case "admin":
                navigate("/admin");
                break;
              default:
                toast("Unauthorized User");
                navigate("/sign-in");
            }
          } else {
            toast.dismiss();
            toast.error("Please sign in to continue");
            navigate("/sign-in");
          }
        } catch (error) {
          toast.dismiss();
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
        <StudentNavbar onToggleSidebar={handleToggleSidebar} />
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        <StudentSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        <main className="flex-1 overflow-auto px-2 sm:px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
