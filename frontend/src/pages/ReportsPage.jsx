import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

const SUMMARY = [
  { label: 'Total Patients Screened', value: '2,847', change: '+12%', up: true, icon: 'fa-users', bg: 'bg-blue-100', text: 'text-blue-600' },
  { label: 'High Risk Percentage', value: '18.4%', change: '+5%', up: false, icon: 'fa-exclamation-triangle', bg: 'bg-red-100', text: 'text-red-600' },
  { label: 'Average Risk Score', value: '42.6', change: '0%', up: null, icon: 'fa-chart-line', bg: 'bg-purple-100', text: 'text-purple-600' },
  { label: 'Monthly Predictions', value: '324', change: '+8%', up: true, icon: 'fa-calendar-check', bg: 'bg-green-100', text: 'text-green-600' },
];

// Simple SVG bar chart
function BarChart({ data, color = '#2563EB' }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-2 h-52 pt-4">
      {data.map(d => (
        <div key={d.label} className="flex flex-col items-center flex-1 gap-1">
          <span className="text-xs text-gray-500 font-medium">{d.value}</span>
          <div className="w-full flex items-end justify-center" style={{ height: '160px' }}>
            <div
              className="w-full rounded-t-lg transition-all hover:opacity-80"
              style={{ height: `${(d.value / max) * 100}%`, backgroundColor: color }}
            />
          </div>
          <span className="text-xs text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// Donut chart using SVG
function DonutChart() {
  const segments = [
    { label: 'Low Risk', pct: 61.6, color: '#22c55e' },
    { label: 'Moderate', pct: 20, color: '#eab308' },
    { label: 'High Risk', pct: 18.4, color: '#ef4444' },
  ];
  const r = 60, cx = 80, cy = 80, circumference = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex flex-col items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {segments.map(s => {
          const dash = (s.pct / 100) * circumference;
          const el = (
            <circle
              key={s.label}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="20"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
          offset += dash;
          return el;
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1e293b">2,847</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#94a3b8">total</text>
      </svg>
      <div className="flex gap-4 flex-wrap justify-center">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }}></div>
            <span className="text-xs text-gray-600">{s.label} ({s.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const trendData = [
  { label: 'Jul', value: 210 },
  { label: 'Aug', value: 245 },
  { label: 'Sep', value: 280 },
  { label: 'Oct', value: 260 },
  { label: 'Nov', value: 305 },
  { label: 'Dec', value: 290 },
  { label: 'Jan', value: 324 },
];

const RECENT_REPORTS = [
  { name: 'Monthly Risk Assessment Report', date: 'Jan 15, 2025', type: 'PDF', size: '2.4 MB' },
  { name: 'Q4 2024 Analytics Summary', date: 'Jan 1, 2025', type: 'Excel', size: '1.8 MB' },
  { name: 'High Risk Patient Overview', date: 'Dec 28, 2024', type: 'PDF', size: '3.1 MB' },
  { name: 'Model Performance Report', date: 'Dec 15, 2024', type: 'PDF', size: '1.2 MB' },
];

export default function ReportsPage({ onNavigate }) {
  const [period, setPeriod] = useState('Last 7 Months');

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen">
      <Sidebar active="Analytics Reports" onNavigate={onNavigate} />

      <div className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur border-b border-blue-100 sticky top-0 z-30 shadow-sm">
          <div className="px-4 sm:px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Reports & Analytics</h2>
              <p className="text-sm text-gray-500 mt-0.5">Prediction insights and export tools</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition">
                <i className="fa-solid fa-bell text-lg"></i>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={() => onNavigate('prediction')}
                className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-plus"></i>
                New Prediction
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SUMMARY.map(({ label, value, change, up, icon, bg, text }) => (
              <div key={label} className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-blue-100 shadow-md hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
                    <i className={`fa-solid ${icon} ${text} text-xl`}></i>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                    up === null ? 'bg-gray-100 text-gray-600'
                    : up ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-600'
                  }`}>{change}</span>
                </div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">{label}</h3>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-blue-100 shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Risk Distribution</h3>
              <DonutChart />
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-blue-100 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Monthly Prediction Trends</h3>
                <select
                  value={period}
                  onChange={e => setPeriod(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {['Last 7 Months', 'Last 6 Months', 'Last Year'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <BarChart data={trendData} color="#2563EB" />
            </div>
          </div>

          {/* Export & Recent Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Export */}
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-blue-100 shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Export Reports</h3>
              <div className="space-y-3">
                {[
                  { icon: 'fa-file-pdf', label: 'Full Report PDF', color: 'text-red-500' },
                  { icon: 'fa-file-excel', label: 'Export to Excel', color: 'text-green-600' },
                  { icon: 'fa-file-csv', label: 'Export Raw CSV', color: 'text-blue-600' },
                ].map(({ icon, label, color }) => (
                  <button
                    key={label}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-primary transition-all text-sm font-medium text-gray-700"
                  >
                    <i className={`fa-solid ${icon} ${color} text-lg`}></i>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Reports */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur rounded-2xl p-6 border border-blue-100 shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Reports</h3>
              <div className="space-y-3">
                {RECENT_REPORTS.map(r => (
                  <div key={r.name} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${r.type === 'PDF' ? 'bg-red-50' : 'bg-green-50'}`}>
                        <i className={`fa-solid ${r.type === 'PDF' ? 'fa-file-pdf text-red-500' : 'fa-file-excel text-green-600'}`}></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.name}</p>
                        <p className="text-xs text-gray-500">{r.date} · {r.size}</p>
                      </div>
                    </div>
                    <button className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1">
                      <i className="fa-solid fa-download text-xs"></i>
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
