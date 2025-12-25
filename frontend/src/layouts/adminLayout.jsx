"use client"

// ============================================
// FILE: Layout.jsx
// PURE TEMPLATE-DRIVEN LAYOUT
// ============================================

import { useState } from "react"
import { Outlet } from "react-router-dom"

import Sidebar from "../components/admin/navigation/sidebar"
import Navbar from "../components/admin/navigation/navbar"
// import LoadingComponent from "../components/loadingComponent/LoadingComponent";

/* =======================
   COMPONENT
======================= */

export default function AdminLayout({ template = {} }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev)
  }

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden">
      {/* HEADER */}
      <header className="w-full z-30">
        <Navbar
          template={{
            title: "Admin Dashboard",
            user: {
              name: "Admin User",
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
  )
}
