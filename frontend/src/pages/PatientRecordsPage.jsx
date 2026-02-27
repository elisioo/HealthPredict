import React, { useState } from 'react';

const PATIENTS = [
  { name: 'John Doe', id: 'PT-001', age: 45, date: 'Dec 15, 2024', risk: 'High Risk', riskCls: 'bg-red-100 text-red-800', prob: '87.5%', probCls: 'text-red-600' },
  { name: 'Sarah Johnson', id: 'PT-002', age: 38, date: 'Dec 14, 2024', risk: 'Moderate', riskCls: 'bg-yellow-100 text-yellow-800', prob: '54.2%', probCls: 'text-yellow-600' },
  { name: 'Michael Chen', id: 'PT-003', age: 52, date: 'Dec 13, 2024', risk: 'Low Risk', riskCls: 'bg-green-100 text-green-800', prob: '18.7%', probCls: 'text-green-600' },
  { name: 'Emily Davis', id: 'PT-004', age: 41, date: 'Dec 12, 2024', risk: 'High Risk', riskCls: 'bg-red-100 text-red-800', prob: '79.3%', probCls: 'text-red-600' },
  { name: 'Robert Wilson', id: 'PT-005', age: 35, date: 'Dec 11, 2024', risk: 'Low Risk', riskCls: 'bg-green-100 text-green-800', prob: '22.1%', probCls: 'text-green-600' },
  { name: 'Lisa Anderson', id: 'PT-006', age: 47, date: 'Dec 10, 2024', risk: 'Moderate', riskCls: 'bg-yellow-100 text-yellow-800', prob: '61.8%', probCls: 'text-yellow-600' },
];

const RISK_OPTIONS = ['All Risk Levels', 'High Risk', 'Moderate', 'Low Risk'];

export default function PatientRecordsPage({ onNavigate }) {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All Risk Levels');
  const [date, setDate] = useState('');

  const filtered = PATIENTS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search);
    const matchRisk = riskFilter === 'All Risk Levels' || p.risk === riskFilter;
    return matchSearch && matchRisk;
  });

  return (
    <div className="bg-white font-sans min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-heartbeat text-white text-sm"></i>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">HealthPredict</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8 text-sm">
              {[
                { label: 'Dashboard', page: 'staff-dashboard' },
                { label: 'Patient Records', page: 'patient-records', active: true },
                { label: 'Predictions', page: 'prediction' },
                { label: 'Analytics', page: 'reports' },
              ].map(({ label, page, active }) => (
                <button
                  key={label}
                  onClick={() => onNavigate(page)}
                  className={`transition-colors ${active ? 'text-primary font-medium' : 'text-gray-600 hover:text-primary'}`}
                >
                  {label}
                </button>
              ))}
            </nav>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <i className="fa-solid fa-bell"></i>
              </button>
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-user text-primary text-sm"></i>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Patient Records</h1>
            <p className="text-gray-600">Manage and review patient predictions</p>
          </div>
          <button
            onClick={() => onNavigate('prediction')}
            className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i>
            New Prediction
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search patients..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-sm"
              />
            </div>
            <div className="relative">
              <select
                value={riskFilter}
                onChange={e => setRiskFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none appearance-none bg-white text-sm"
              >
                {RISK_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm"></i>
            </div>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Patient List</h3>
            <span className="text-sm text-gray-500">{filtered.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50">
                <tr>
                  {['Patient Name', 'Age', 'Last Prediction', 'Risk Level', 'Probability', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold flex-shrink-0">
                          {p.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-500">ID: {p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.age}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${p.riskCls}`}>{p.risk}</span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${p.probCls}`}>{p.prob}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-3">
                      <button onClick={() => onNavigate('result')} className="text-primary hover:text-primary-dark transition-colors">View</button>
                      <button className="text-gray-600 hover:text-gray-900 transition-colors">Export</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filtered.length} of {PATIENTS.length} records</span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40" disabled>Prev</button>
              <button className="px-3 py-1 rounded-lg bg-primary text-white">1</button>
              <button className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50">Next</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
