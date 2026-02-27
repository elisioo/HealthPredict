import React, { useState } from "react";
import Sidebar from "./Sidebar";

export default function DashboardLayout({
  navItems,
  activePage,
  onNavigate,
  title = "Dashboard Overview",
  subtitle,
  children,
  brandTitle,
  brandSubtitle,
  headerActions,
  searchPlaceholder = "Search patients, reports...",
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigate = (page) => {
    if (onNavigate) onNavigate(page);
    setSidebarOpen(false);
  };

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
      >
        <Sidebar
          navItems={navItems}
          activePage={activePage}
          onNavigate={handleNavigate}
          brandTitle={brandTitle}
          brandSubtitle={brandSubtitle}
          className="shadow-lg lg:shadow-none"
        />
      </div>

      {/* Main */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
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
                <button className="w-10 h-10 rounded-full bg-white border border-slate-100 text-slate-500 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center shadow-sm">
                  <i className="fa-regular fa-moon"></i>
                </button>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">{children}</main>
      </div>
    </div>
  );
}
