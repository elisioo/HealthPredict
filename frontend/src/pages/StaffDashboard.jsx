import React, { useState } from 'react';

const recentPredictions = [
  { id: 1, name: 'Emma Wilson', patientId: 'P001234', risk: 'High Risk', riskBg: 'bg-red-100 text-red-800', date: 'Jan 15, 2024', avatar: 'https://ui-avatars.com/api/?name=Emma+Wilson&background=FEE2E2&color=DC2626' },
  { id: 2, name: 'John Martinez', patientId: 'P001235', risk: 'Low Risk', riskBg: 'bg-green-100 text-green-800', date: 'Jan 14, 2024', avatar: 'https://ui-avatars.com/api/?name=John+Martinez&background=DCFCE7&color=16A34A' },
  { id: 3, name: 'Lisa Thompson', patientId: 'P001236', risk: 'Medium Risk', riskBg: 'bg-yellow-100 text-yellow-800', date: 'Jan 13, 2024', avatar: 'https://ui-avatars.com/api/?name=Lisa+Thompson&background=FEF9C3&color=CA8A04' },
  { id: 4, name: 'Robert Kim', patientId: 'P001237', risk: 'High Risk', riskBg: 'bg-red-100 text-red-800', date: 'Jan 13, 2024', avatar: 'https://ui-avatars.com/api/?name=Robert+Kim&background=FEE2E2&color=DC2626' },
  { id: 5, name: 'Amanda Foster', patientId: 'P001238', risk: 'Low Risk', riskBg: 'bg-green-100 text-green-800', date: 'Jan 12, 2024', avatar: 'https://ui-avatars.com/api/?name=Amanda+Foster&background=DCFCE7&color=16A34A' },
];

const navItems = [
  { icon: 'fa-chart-line', label: 'Dashboard' },
  { icon: 'fa-user-injured', label: 'Patients' },
  { icon: 'fa-brain', label: 'Predictions' },
  { icon: 'fa-file-medical-alt', label: 'Reports' },
  { icon: 'fa-cog', label: 'Settings' },
];

const quickActions = [
  { icon: 'fa-search', label: 'Search Patient', desc: 'Find patient records', bg: 'bg-blue-100', iconColor: 'text-primary' },
  { icon: 'fa-plus', label: 'New Prediction', desc: 'Create risk assessment', bg: 'bg-green-100', iconColor: 'text-green-600' },
  { icon: 'fa-folder-open', label: 'All Records', desc: 'View patient data', bg: 'bg-purple-100', iconColor: 'text-purple-600' },
  { icon: 'fa-download', label: 'Export Reports', desc: 'Download analytics', bg: 'bg-orange-100', iconColor: 'text-orange-600' },
];

function StaffDashboard({ onNavigate }) {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="bg-white font-sans min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-xl">
                <i className="fa-solid fa-heart-pulse text-primary text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">HealthPredict</h1>
                <p className="text-xs text-gray-500">Staff Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center text-sm text-gray-600">
                <i className="fa-solid fa-user-doctor mr-2 text-primary"></i>
                <span>Dr. Sarah Johnson</span>
              </div>
              <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-colors">
                <i className="fa-solid fa-bell text-gray-600"></i>
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-colors"
                title="Logout"
              >
                <i className="fa-solid fa-sign-out-alt text-gray-600"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-64px)] bg-gray-50">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:w-64 bg-white border-r border-gray-200 shadow-sm flex-col">
          <div className="py-6">
            <nav className="px-6 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setActiveNav(item.label)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors text-left ${
                    activeNav === item.label
                      ? 'text-primary bg-primary/5'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <i className={`fa-solid ${item.icon} mr-3`}></i>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Dashboard Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Staff Dashboard</h2>
              <p className="text-gray-600">Manage patient records and diabetes risk predictions</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => action.label === 'New Prediction' && onNavigate('prediction')}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer text-left"
                >
                  <div className="flex items-center">
                    <div className={`${action.bg} p-3 rounded-xl`}>
                      <i className={`fa-solid ${action.icon} ${action.iconColor} text-xl`}></i>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-medium text-gray-900">{action.label}</h3>
                      <p className="text-sm text-gray-500">{action.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Search Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Patient Search</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter patient ID or name..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                  />
                </div>
                <button className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors font-medium flex items-center justify-center gap-2">
                  <i className="fa-solid fa-search"></i>
                  Search
                </button>
              </div>
            </div>

            {/* Recent Predictions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Predictions</h3>
                <button className="text-primary hover:text-primary-dark text-sm font-medium">View All</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Patient', 'Risk Level', 'Date', 'Action'].map((h) => (
                        <th key={h} className="text-left py-3 px-4 font-medium text-gray-600 text-sm">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentPredictions.map((p) => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full mr-3 object-cover" />
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{p.name}</div>
                              <div className="text-xs text-gray-500">ID: {p.patientId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${p.riskBg}`}>
                            {p.risk}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">{p.date}</td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => onNavigate('result')}
                            className="text-primary hover:text-primary-dark text-sm font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Patients Today', value: '18', icon: 'fa-user-injured', bg: 'bg-blue-50', color: 'text-primary' },
                { label: 'High Risk Alerts', value: '4', icon: 'fa-triangle-exclamation', bg: 'bg-red-50', color: 'text-red-500' },
                { label: 'Pending Reviews', value: '7', icon: 'fa-clock', bg: 'bg-yellow-50', color: 'text-yellow-600' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                      <i className={`fa-solid ${stat.icon} ${stat.color}`}></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default StaffDashboard;
