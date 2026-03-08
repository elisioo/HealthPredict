import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({
  navItems,
  title = "Dashboard Overview",
  subtitle,
  children,
  brandTitle,
  brandSubtitle,
  headerActions,
  searchPlaceholder = "Search patients, reports...",
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const sidebarWidthClass = collapsed ? "lg:ml-20" : "lg:ml-[18rem]";

  return (
    <div className="bg-slate-50 min-h-screen overflow-x-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 h-full transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
        style={{ width: collapsed ? "5rem" : "18rem" }}
      >
        <Sidebar
          navItems={navItems}
          brandTitle={brandTitle}
          brandSubtitle={brandSubtitle}
          className="shadow-lg lg:shadow-none"
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          onCloseMobile={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main */}
      <div
        className={`${sidebarWidthClass} min-h-screen flex flex-col transition-[margin] duration-300`}
      >
        <header className="h-20 bg-white/80 backdrop-blur sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center shadow-sm"
            >
              <i className="fa-solid fa-bars"></i>
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{title}</h1>
              {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center relative">
              <i className="fa-solid fa-magnifying-glass absolute left-4 text-slate-400 text-sm"></i>
              <input
                type="text"
                placeholder={searchPlaceholder}
                className="w-64 lg:w-80 h-10 pl-10 pr-4 rounded-full bg-slate-100/50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
              />
            </div>
            {headerActions ? (
              headerActions
            ) : (
              <>
                <button className="w-10 h-10 rounded-full bg-white border border-slate-100 text-slate-500 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center relative shadow-sm">
                  <i className="fa-regular fa-bell"></i>
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
              </>
            )}
            {/* User info + logout */}
            {user && (
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-semibold text-slate-700 leading-none">
                    {user.fullName || user.full_name}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize mt-0.5">
                    {user.role === "health_user" ? "Health User" : user.role}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <i className="fa-solid fa-user text-primary text-xs"></i>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 flex items-center justify-center shadow-sm transition-colors"
                >
                  <i className="fa-solid fa-right-from-bracket text-xs"></i>
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">{children}</main>
      </div>
    </div>
  );
}
