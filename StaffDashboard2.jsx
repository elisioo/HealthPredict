import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

const STATS = [
  { label: 'Total Patients', value: '1,284', change: '+8.2%', up: true, icon: 'fa-users', color: 'blue', border: 'border-blue-500' },
  { label: "Today's Predictions", value: '47', change: '+12.5%', up: true, icon: 'fa-brain', color: 'purple', border: 'border-purple-500' },
  { label: 'High Risk Cases', value: '23', change: '-3.1%', up: false, icon: 'fa-triangle-exclamation', color: 'red', border: 'border-red-500' },
  { label: 'Model Accuracy', value: '94.7%', change: '+0.3%', up: true, icon: 'fa-chart-line', color: 'green', border: 'border-green-500' },
];

const PATIENTS = [
  { name: 'Emma Wilson', id: 'PT-0091', risk: 'High Risk', riskCls: 'bg-red-100 text-red-700', prob: '87.2%', probCls: 'text-red-600', date: 'Jan 15, 2025', status: 'Reviewed' },
  { name: 'James Martinez', id: 'PT-0090', risk: 'Low Risk', riskCls: 'bg-green-100 text-green-700', prob: '12.4%', probCls: 'text-green-600', date: 'Jan 15, 2025', status: 'Pending' },
  { name: 'Lisa Thompson', id: 'PT-0089', risk: 'Moderate', riskCls: 'bg-yellow-100 text-yellow-700', prob: '54.8%', probCls: 'text-yellow-600', date: 'Jan 14, 2025', status: 'Reviewed' },
  { name: 'Robert Kim', id: 'PT-0088', risk: 'High Risk', riskCls: 'bg-red-100 text-red-700', prob: '76.3%', probCls: 'text-red-600', date: 'Jan 14, 2025', status: 'Pending' },
];

const colorMap = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', badge: 'bg-blue-50 text-blue-700' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600', badge: 'bg-purple-50 text-purple-700' },
  red: { bg: 'bg-red-100', text: 'text-red-600', badge: 'bg-red-50 text-red-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600', badge: 'bg-green-50 text-green-700' },
};

export default function StaffDashboard2({ onNavigate }) {
  const [search, setSearch] = useState('');

  const filtered = PATIENTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search)
  );

  return (
    <div className="bg-slate-50 min-h-screen">
      <Sidebar active="Dashboard" onNavigate={onNavigate} />

      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-20 bg-white/80 backdrop-blur sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between border-b border-slate-200 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Dashboard Overview</h1>
            <p className="text-xs text-slate-400">Welcome back, Dr. Sarah</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center relative">
              <i className="fa-solid fa-magnifying-glass absolute left-4 text-slate-400 text-sm"></i>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                type="text"
                placeholder="Search patients..."
                className="w-72 h-10 pl-10 pr-4 rounded-full bg-slate-100 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
              />
            </div>
            <button className="w-10 h-10 rounded-full bg-white border border-slate-100 text-slate-500 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center relative shadow-sm">
              <i className="fa-regular fa-bell"></i>
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Stat Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ label, value, change, up, icon, color, border }) => {
              const c = colorMap[color];
              return (
                <div key={label} className={`bg-white rounded-2xl p-6 border-l-4 ${border} shadow-sm hover:shadow-md transition-all`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 ${c.bg} ${c.text} rounded-lg`}>
                      <i className={`fa-solid ${icon}`}></i>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{value}</p>
                  <p className="text-sm text-slate-500 mt-1">{label}</p>
                </div>
              );
            })}
          </section>

          {/* Recent Predictions Table */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Recent Predictions</h2>
              <button
                onClick={() => onNavigate('patient-records')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <tr>
                    {['Patient', 'Risk Level', 'Probability', 'Date', 'Status', 'Action'].map(h => (
                      <th key={h} className="px-6 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                            {p.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${p.riskCls}`}>{p.risk}</span>
                      </td>
                      <td className={`px-6 py-4 text-sm font-semibold ${p.probCls}`}>{p.prob}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{p.date}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.status === 'Reviewed' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => onNavigate('result')}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: 'fa-plus', label: 'New Prediction', desc: 'Run a diabetes risk assessment', page: 'prediction', color: 'blue' },
              { icon: 'fa-folder-open', label: 'Patient Records', desc: 'Browse all patient data', page: 'patient-records', color: 'purple' },
              { icon: 'fa-chart-bar', label: 'Analytics', desc: 'View reports & insights', page: 'reports', color: 'green' },
            ].map(({ icon, label, desc, page, color }) => {
              const c = colorMap[color];
              return (
                <button
                  key={label}
                  onClick={() => onNavigate(page)}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all text-left group"
                >
                  <div className={`w-12 h-12 ${c.bg} ${c.text} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <i className={`fa-solid ${icon} text-xl`}></i>
                  </div>
                  <p className="font-semibold text-slate-800 mb-1">{label}</p>
                  <p className="text-sm text-slate-500">{desc}</p>
                </button>
              );
            })}
          </section>
        </main>
      </div>
    </div>
  );
}
