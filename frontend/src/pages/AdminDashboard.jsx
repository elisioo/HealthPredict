import React, { useState } from 'react';

const users = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah.j@email.com', role: 'Patient', status: 'Active', lastActive: '2 hours ago', predictions: 12, avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=EFF6FF&color=2563EB' },
  { id: 2, name: 'Dr. Michael Chen', email: 'm.chen@hospital.com', role: 'Healthcare Staff', status: 'Active', lastActive: '1 day ago', predictions: 247, avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=F3E8FF&color=7C3AED' },
  { id: 3, name: 'James Wilson', email: 'james.w@email.com', role: 'Patient', status: 'Inactive', lastActive: '3 weeks ago', predictions: 5, avatar: 'https://ui-avatars.com/api/?name=James+Wilson&background=F3F4F6&color=6B7280' },
  { id: 4, name: 'Emily Davis', email: 'e.davis@email.com', role: 'Patient', status: 'Active', lastActive: '5 mins ago', predictions: 28, avatar: 'https://ui-avatars.com/api/?name=Emily+Davis&background=FFF7ED&color=EA580C' },
];

const stats = [
  { label: 'Total Predictions', value: '24,567', icon: 'fa-chart-line', bg: 'bg-blue-50', iconColor: 'text-primary', badge: '+12.5%', badgeBg: 'bg-green-50 text-green-600' },
  { label: 'High Risk Cases', value: '18.3%', icon: 'fa-triangle-exclamation', bg: 'bg-red-50', iconColor: 'text-red-500', badge: 'Critical', badgeBg: 'bg-red-50 text-red-600' },
  { label: 'Registered Users', value: '1,247', icon: 'fa-users', bg: 'bg-purple-50', iconColor: 'text-purple-500', badge: 'Active', badgeBg: 'bg-purple-50 text-purple-600' },
  { label: 'Model Accuracy', value: '94.7%', icon: 'fa-brain', bg: 'bg-green-50', iconColor: 'text-green-500', badge: 'Optimal', badgeBg: 'bg-green-50 text-green-600' },
];

const navItems = [
  { icon: 'fa-chart-line', label: 'Dashboard', active: true },
  { icon: 'fa-users', label: 'Manage Users', active: false },
  { icon: 'fa-brain', label: 'ML Model', active: false },
  { icon: 'fa-chart-pie', label: 'Predictions', active: false },
  { icon: 'fa-file-lines', label: 'System Logs', active: false },
];

// Simple Bar Chart using SVG
function BarChart() {
  const data = [
    { day: 'Mon', value: 42 },
    { day: 'Tue', value: 68 },
    { day: 'Wed', value: 55 },
    { day: 'Thu', value: 80 },
    { day: 'Fri', value: 73 },
    { day: 'Sat', value: 35 },
    { day: 'Sun', value: 48 },
  ];
  const maxVal = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end justify-between gap-2 h-48 px-2">
      {data.map((d) => (
        <div key={d.day} className="flex flex-col items-center flex-1 gap-1">
          <div className="w-full flex items-end justify-center" style={{ height: '160px' }}>
            <div
              className="w-full bg-primary rounded-t-lg opacity-80 hover:opacity-100 transition-all"
              style={{ height: `${(d.value / maxVal) * 100}%` }}
              title={d.value}
            ></div>
          </div>
          <span className="text-xs text-gray-500">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

// Risk Distribution
function RiskDistribution() {
  const risks = [
    { label: 'Low Risk', pct: 61.7, color: 'bg-green-500' },
    { label: 'Medium Risk', pct: 20, color: 'bg-yellow-500' },
    { label: 'High Risk', pct: 18.3, color: 'bg-red-500' },
  ];
  return (
    <div className="space-y-5 mt-4">
      {risks.map((r) => (
        <div key={r.label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700 font-medium">{r.label}</span>
            <span className="text-gray-500">{r.pct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className={`${r.color} h-2.5 rounded-full`} style={{ width: `${r.pct}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminDashboard({ onNavigate }) {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-white font-sans">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-heartbeat text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">HealthPredict</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveNav(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium text-left ${
                activeNav === item.label
                  ? 'bg-blue-50 text-primary'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-user text-primary"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">admin@healthpredict.com</p>
            </div>
            <button
              onClick={() => onNavigate('login')}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button className="lg:hidden text-gray-600 text-xl">
              <i className="fa-solid fa-bars"></i>
            </button>
            <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">System Analytics</h2>
            <div className="flex items-center gap-3">
              <button className="relative w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                <i className="fa-solid fa-bell"></i>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                <i className="fa-solid fa-gear"></i>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8">

            {/* Stats Overview */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              {stats.map((s) => (
                <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center`}>
                      <i className={`fa-solid ${s.icon} ${s.iconColor} text-xl`}></i>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg ${s.badgeBg}`}>
                      {s.badge}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{s.value}</h3>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              ))}
            </section>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Prediction Trends */}
              <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Prediction Trends</h3>
                  <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                  </select>
                </div>
                <BarChart />
              </section>

              {/* Risk Distribution */}
              <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Risk Distribution</h3>
                  <button className="text-sm text-primary hover:text-primary-dark font-medium">View Details</button>
                </div>
                <p className="text-sm text-gray-500 mb-2">Based on {(24567).toLocaleString()} total predictions</p>
                <RiskDistribution />

                <div className="grid grid-cols-3 gap-3 mt-6">
                  {[
                    { label: 'Low', value: '15,177', color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Medium', value: '4,913', color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    { label: 'High', value: '4,477', color: 'text-red-600', bg: 'bg-red-50' },
                  ].map((item) => (
                    <div key={item.label} className={`${item.bg} rounded-xl p-3 text-center`}>
                      <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                      <p className="text-xs text-gray-500">{item.label} Risk</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* User Management */}
            <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 sm:flex-initial">
                    <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search users..."
                      className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <button className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-dark transition-all flex items-center justify-center gap-2">
                    <i className="fa-solid fa-user-plus"></i>
                    <span>Add User</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {['User', 'Role', 'Status', 'Last Active', 'Predictions', 'Actions'].map((h) => (
                        <th
                          key={h}
                          className={`py-3 px-4 text-xs font-semibold text-gray-600 uppercase ${h === 'Actions' ? 'text-right' : 'text-left'}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl object-cover" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">{user.role}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`text-xs font-medium px-3 py-1 rounded-lg ${
                              user.status === 'Active'
                                ? 'bg-green-50 text-green-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">{user.lastActive}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-medium text-gray-900">{user.predictions}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                              <i className="fa-solid fa-pen-to-square text-sm"></i>
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-all">
                              <i className="fa-solid fa-trash text-sm"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
