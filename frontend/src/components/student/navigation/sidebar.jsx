
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  FileText,
  Award,
  User,
  Bell,
  CreditCard,
  MessageSquare,
  GraduationCap,
  ClipboardList,
  X,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useUser } from "../../../contexts/userContext";

export default function StudentSidebar({ isOpen, setIsOpen }) {
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const location = useLocation();
  const { user } = useUser();

  useEffect(() => {
    console.log(user);
  }, [user]);

  const menu = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/student/dashboard",
      submenu: null,
    },
    {
      name: "My Courses",
      icon: BookOpen,
      path: "/student/courses",
      submenu: null,
    },
    {
      name: "Course Reg",
      icon: Calendar,
      path: "/student/course-registration",
      submenu: null,
    },
    {
      name: "Assignments",
      icon: ClipboardList,
      path: "/student/assignments",
      submenu: null,
    },
    {
      name: "Grades",
      icon: Award,
      path: "/student/grades",
      submenu: null,
    },
    {
      name: "Attendance",
      icon: FileText,
      path: "/student/attendance",
      submenu: null,
    },
    {
      name: "Library",
      icon: GraduationCap,
      path: "/student/library",
      submenu: null,
    },
    {
      name: "Messages",
      icon: MessageSquare,
      path: "/student/messages",
      submenu: null,
    },
    {
      name: "Payments",
      icon: CreditCard,
      path: "/student/payments",
      submenu: null,
    },
    {
      name: "Notifications",
      icon: Bell,
      path: "/student/notifications",
      submenu: null,
    },
    {
      name: "Profile",
      icon: User,
      path: "/student/profile",
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
    if (location.pathname === "/" && path === "/student/dashboard") return true;
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

          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            transition: background 0.2s;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
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

        <div className="h-full p-4 pt-12 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            {menu.map((item) => {
              const Icon = item.icon;
              const parentActive = isParentActive(item);

              return (
                <div key={item.name}>
                  <NavLink
                    to={item.path}
                    onClick={() => handleItemClick(item)}
                    className={({ isActive: navIsActive }) =>
                      `w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}