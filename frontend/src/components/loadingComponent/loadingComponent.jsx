import React from "react";
import appLogoImage from "../../../public/img/appLogoImage.png";

export default function LoadingComponent() {
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-[#006ef5] via-[#0052cc] to-[#003d99] flex items-center justify-center">
      <div className="text-center">
        {/* SIMPLE CENTERED SPINNER */}
        <div className="inline-block relative mb-8">
          <div className="w-32 h-32 border-8 border-white border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={appLogoImage}
              alt="ScholarLink"
              className="w-16 h-16 object-contain"
            />
          </div>
        </div>

        {/* TEXT */}
        <h1 className="text-4xl font-bold text-white mb-2">ScholarLink</h1>
        <p className="text-blue-100 text-sm mb-8">School Management System</p>
        
        {/* DOTS */}
        <div className="flex justify-center gap-2 mb-4">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
        </div>
        
        <p className="text-white text-sm">Loading your workspace...</p>
      </div>
    </div>
  );
}