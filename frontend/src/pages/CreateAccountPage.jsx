import React, { useState } from 'react';

const FEATURES = [
  'Early risk detection algorithms',
  'Secure medical data encryption',
  'Connect with healthcare providers',
  'Personalized health insights',
];

const ROLES = ['Patient', 'Healthcare Staff', 'Administrator'];

export default function CreateAccountPage({ onNavigate }) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', role: 'Patient', agreeTerms: false });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Required';
    if (!form.email.includes('@')) e.email = 'Invalid email';
    if (form.password.length < 8) e.password = 'Min 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.agreeTerms) e.agreeTerms = 'You must agree to the terms';
    return e;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onNavigate('login');
  };

  const field = (id, label, type, icon, placeholder, opts = {}) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <i className={`fa-regular ${icon} text-slate-400 text-sm`}></i>
        </div>
        <input
          type={type}
          value={form[id]}
          onChange={e => set(id, e.target.value)}
          placeholder={placeholder}
          className={`block w-full pl-11 pr-${opts.toggle ? '11' : '4'} py-2.5 border ${errors[id] ? 'border-red-400' : 'border-slate-200'} rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all`}
        />
        {opts.toggle && (
          <button type="button" onClick={opts.toggle} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600">
            <i className={`fa-solid ${opts.showPw ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
          </button>
        )}
      </div>
      {errors[id] && <p className="text-xs text-red-500 mt-1">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col text-slate-700 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Nav */}
      <nav className="w-full bg-white/80 backdrop-blur border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                <i className="fa-solid fa-heart-pulse text-sm"></i>
              </div>
              <span className="font-semibold text-lg text-slate-900">HealthPredict</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden md:block text-sm text-slate-500">Already have an account?</span>
              <button onClick={() => onNavigate('login')} className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                Sign in
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center py-10 px-4">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-5 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">

          {/* Left Panel */}
          <div className="hidden lg:flex lg:col-span-2 bg-slate-50 p-8 flex-col justify-between border-r border-slate-100">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Join our health community</h2>
              <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                Get accurate AI-driven predictions and personalized health insights to manage your journey.
              </p>
              <div className="space-y-4">
                {FEATURES.map(f => (
                  <div key={f} className="flex items-start gap-3">
                    <i className="fa-solid fa-check-circle text-primary mt-0.5"></i>
                    <p className="text-sm text-slate-600">{f}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Testimonial */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <div className="flex gap-0.5 text-yellow-400 text-xs mb-2">
                {[...Array(5)].map((_, i) => <i key={i} className="fa-solid fa-star"></i>)}
              </div>
              <p className="text-xs text-slate-600 italic mb-3">
                "This platform helped me identify early signs and take control of my health before it was too late."
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <i className="fa-solid fa-user text-primary text-xs"></i>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Sarah Jenkins</p>
                  <p className="text-[10px] text-slate-500">Patient since 2023</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="lg:col-span-3 p-6 md:p-10">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
              <p className="text-sm text-slate-500 mt-1">Start your journey to better health monitoring.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Section 1 */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-primary flex items-center justify-center text-xs">1</span>
                  Personal Information
                </h3>
                <div className="space-y-4">
                  {field('fullName', 'Full Name', 'text', 'fa-user', 'e.g. John Doe')}
                  {field('email', 'Email Address', 'email', 'fa-envelope', 'you@example.com')}
                </div>
              </div>

              {/* Section 2 */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-primary flex items-center justify-center text-xs">2</span>
                  Account Security
                </h3>
                <div className="space-y-4">
                  {field('password', 'Password', showPw ? 'text' : 'password', 'fa-lock', 'Min. 8 characters', { toggle: () => setShowPw(!showPw), showPw })}
                  {field('confirmPassword', 'Confirm Password', showConfirm ? 'text' : 'password', 'fa-lock', 'Re-enter password', { toggle: () => setShowConfirm(!showConfirm), showPw: showConfirm })}
                </div>
              </div>

              {/* Section 3 */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-primary flex items-center justify-center text-xs">3</span>
                  Account Type
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {ROLES.map(r => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => set('role', r)}
                      className={`p-3 rounded-xl border-2 text-xs font-medium transition-all ${form.role === r ? 'border-primary bg-blue-50 text-primary' : 'border-slate-200 text-slate-600 hover:border-primary/40'}`}
                    >
                      <i className={`fa-solid ${r === 'Patient' ? 'fa-user' : r === 'Healthcare Staff' ? 'fa-user-doctor' : 'fa-shield'} block text-lg mb-1`}></i>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.agreeTerms}
                  onChange={e => set('agreeTerms', e.target.checked)}
                  className="mt-0.5 accent-primary"
                />
                <span className="text-sm text-slate-600">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:underline font-medium">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>
                </span>
              </label>
              {errors.agreeTerms && <p className="text-xs text-red-500">{errors.agreeTerms}</p>}

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                Create Account
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <button onClick={() => onNavigate('login')} className="text-primary font-medium hover:text-primary-dark transition-colors">
                Sign in
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
