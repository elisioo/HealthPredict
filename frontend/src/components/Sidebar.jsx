import React from "react";

const NAV = [
  { icon: "fa-house", label: "Dashboard", page: "staff-dashboard" },
  { icon: "fa-plus-circle", label: "New Prediction", page: "prediction" },
  {
    icon: "fa-folder-open",
    label: "Patient Records",
    page: "patient-records",
    badge: "12",
  },
  { icon: "fa-chart-pie", label: "Analytics Reports", page: "reports" },
  { icon: "fa-user-doctor", label: "Medical Team", page: null },
];

export default function Sidebar({
  navItems = NAV,
  activePage,
  activeLabel,
  onNavigate,
  className = "",
  brandTitle = "Glucogu",
  brandIcon = "fa-heart-pulse",
  brandLogoSrc = "/assets/logo.png",
  brandSubtitle,
  footerUser = { name: "Dr. Sarah Cole", role: "Endocrinologist" },
  onLogout,
  collapsed = false,
  onToggleCollapse,
  onCloseMobile,
}) {
  const handleClick = (page) => {
    if (page && onNavigate) onNavigate(page);
  };

  return (
    <aside
      className={`h-full ${collapsed ? "w-20" : "w-72"} bg-white border-r border-slate-200 flex flex-col transition-[width] duration-300 ${className}`}
    >
      {/* Header */}
      <div className="h-20 flex items-center px-4 border-b border-slate-100 gap-3 relative">
        <div
          className={`w-10 h-10 rounded-xl border border-blue-500 flex items-center justify-center text-blue-600 bg-transparent flex-shrink-0 overflow-hidden ${collapsed ? "ml-1" : ""}`}
        >
          {brandLogoSrc ? (
            <img
              src={brandLogoSrc}
              alt={`${brandTitle} logo`}
              className="w-full h-full object-cover"
            />
          ) : (
            <i className={`fa-solid ${brandIcon} text-lg`}></i>
          )}
        </div>
        {!collapsed && (
          <div>
            <span className="block font-bold text-lg text-slate-800 tracking-tight">
              {brandTitle}
            </span>
            {brandSubtitle && (
              <span className="block text-xs text-slate-400">
                {brandSubtitle}
              </span>
            )}
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => (onCloseMobile ? onCloseMobile() : null)}
            className="lg:hidden w-8 h-8 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Close sidebar"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          <button
            onClick={() => (onToggleCollapse ? onToggleCollapse() : null)}
            className="hidden lg:inline-flex w-8 h-8 rounded-md text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors items-center justify-center"
            aria-label="Toggle sidebar"
          >
            <img
              src="/assets/sidebar.png"
              alt="Toggle sidebar"
              className="w-4 h-4 object-contain"
            />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav
        className={`flex-1 py-6 ${collapsed ? "px-2" : "px-4"} space-y-1 overflow-y-auto`}
      >
        {navItems.map(({ icon, label, page, badge }) => {
          const isActive = activePage
            ? activePage === page
            : activeLabel === label;
          return (
            <button
              key={label}
              onClick={() => handleClick(page)}
              className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-xl text-left transition-all relative ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-slate-500 hover:text-blue-600 hover:bg-slate-50"
              }`}
            >
              {isActive && (
                <div
                  className={`absolute left-0 top-1/2 -translate-y-1/2 ${collapsed ? "w-0.5" : "w-1"} h-8 bg-blue-600 rounded-r-full`}
                />
              )}
              <i
                className={`fa-solid ${icon} text-lg ${collapsed ? "w-full text-center" : "w-6 text-center"}`}
              ></i>
              {!collapsed && <span className="truncate">{label}</span>}
              {!collapsed && badge && (
                <span className="ml-auto bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className={`p-4 border-t border-slate-100 ${collapsed ? "space-y-0" : "space-y-1"}`}
      >
        <button
          className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-3"} px-4 py-3 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-all`}
        >
          <i className="fa-solid fa-gear text-lg w-6 text-center"></i>
          {!collapsed && <span>Settings</span>}
        </button>
        <div
          className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} p-3 rounded-xl bg-slate-50 border border-slate-100`}
        >
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center relative flex-shrink-0">
            <i className="fa-solid fa-user-doctor text-blue-600 text-sm"></i>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold text-slate-700 truncate">
                {footerUser?.name}
              </p>
              <p className="text-xs text-slate-400">{footerUser?.role}</p>
            </div>
          )}
          <button
            onClick={() =>
              onLogout ? onLogout() : onNavigate && onNavigate("login")
            }
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}
