import React from "react";
import appLogoImage from "../../../public/img/appLogoImage.png";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#001a33] via-[#003d66] to-[#006ef5] flex items-center justify-center overflow-hidden">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#006ef5] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-[#0088ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-[#005199] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Logo Container with Pulse Animation */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-[#006ef5] rounded-full blur-2xl opacity-30 animate-pulse"></div>
          <div className="relative m-auto flex flex-row item-center justify-center rounded-3xl p-8 shadow-2xl animate-float">
            {/* Replace this with your actual logo */}
            <img
              src={appLogoImage}
              alt="ScholarLink Logo"
              className="h-24 w-auto"
            />
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
          ScholarLink
        </h1>
        <p className="text-lg text-blue-100 mb-8 animate-fade-in animation-delay-500">
          Connecting scholars, empowering futures
        </p>

        {/* Loading Dots Animation */}
        <div className="flex justify-center items-center space-x-2 mb-4">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce animation-delay-200"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce animation-delay-400"></div>
        </div>

        {/* Loading Bar */}
        <div className="w-64 h-1.5 bg-white/20 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-white via-blue-200 to-white animate-loading-bar"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
