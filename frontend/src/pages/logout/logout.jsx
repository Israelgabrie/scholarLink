import React, { useEffect, useState } from "react";
import { LogOut, CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { logOutUser } from "../../services/logout";

export default function Logout() {
  const [isLoggingOut, setIsLoggingOut] = useState(true);
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        setIsLoggingOut(true);

        // Call logout API
        const response = await logOutUser();
        
        console.log("Logout Response:", response);

        if (response?.success) {
          setLogoutSuccess(true);
          toast.success(response?.message || "Logged out successfully!");

          // Clear local storage
          localStorage.clear();

          // Wait for animation then redirect
          setTimeout(() => {
            navigate("/sign-in");
          }, 2000);
        } else {
          toast.error(response?.message || "Failed to logout");
          
          // Still clear local storage and redirect on failure
          localStorage.clear();
          setTimeout(() => {
            navigate("/sign-in");
          }, 1500);
        }
      } catch (error) {
        console.error("Logout Error:", error);
        toast.error(error?.message || "Something went wrong");
        
        // Clear local storage even on error
        localStorage.clear();
        setTimeout(() => {
          navigate("/sign-in");
        }, 1500);
      } finally {
        setIsLoggingOut(false);
      }
    };

    handleLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="relative">
        {/* Animated circles background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 bg-[#006ef5] opacity-5 rounded-full animate-ping" 
               style={{ animationDuration: '2s' }}></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 bg-[#006ef5] opacity-10 rounded-full animate-pulse" 
               style={{ animationDuration: '1.5s' }}></div>
        </div>

        {/* Main content card */}
        <div className="relative bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center min-w-[300px] md:min-w-[400px] border border-gray-100">
          {/* Icon container with animation */}
          <div className="mb-6 flex justify-center">
            <div className={`relative transition-all duration-500 ${
              logoutSuccess ? 'scale-110' : 'scale-100'
            }`}>
              {isLoggingOut ? (
                <div className="relative">
                  <div className="w-20 h-20 bg-[#006ef5] bg-opacity-10 rounded-full flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-[#006ef5] animate-spin" />
                  </div>
                  {/* Rotating ring */}
                  <div className="absolute inset-0 border-4 border-transparent border-t-[#006ef5] rounded-full animate-spin"></div>
                </div>
              ) : logoutSuccess ? (
                <div className="relative animate-bounce">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  {/* Success pulse effect */}
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                </div>
              ) : (
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <LogOut className="w-10 h-10 text-red-600" />
                </div>
              )}
            </div>
          </div>

          {/* Text content with fade animation */}
          <div className={`transition-all duration-300 ${
            logoutSuccess ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-1'
          }`}>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
              {isLoggingOut ? (
                "Logging Out..."
              ) : logoutSuccess ? (
                "Logged Out Successfully!"
              ) : (
                "Logout Complete"
              )}
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              {isLoggingOut ? (
                "Please wait while we securely log you out"
              ) : logoutSuccess ? (
                "You have been successfully logged out. Redirecting..."
              ) : (
                "Redirecting to sign-in page..."
              )}
            </p>
          </div>

          {/* Progress indicator dots */}
          {isLoggingOut && (
            <div className="flex justify-center gap-2 mt-6">
              <div className="w-2 h-2 bg-[#006ef5] rounded-full animate-bounce" 
                   style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-[#006ef5] rounded-full animate-bounce" 
                   style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-[#006ef5] rounded-full animate-bounce" 
                   style={{ animationDelay: '300ms' }}></div>
            </div>
          )}

          {/* Bottom accent line */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <LogOut className="w-4 h-4" />
              <span>Clearing session data...</span>
            </div>
          </div>
        </div>

        {/* Floating particles effect */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-10 w-2 h-2 bg-[#006ef5] rounded-full opacity-20 animate-ping" 
               style={{ animationDuration: '3s' }}></div>
          <div className="absolute top-20 right-20 w-3 h-3 bg-[#006ef5] rounded-full opacity-20 animate-ping" 
               style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-20 w-2 h-2 bg-[#006ef5] rounded-full opacity-20 animate-ping" 
               style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-10 right-10 w-3 h-3 bg-[#006ef5] rounded-full opacity-20 animate-ping" 
               style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}></div>
        </div>
      </div>
    </div>
  );
}