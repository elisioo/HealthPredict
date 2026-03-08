import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { useAuth } from "../context/AuthContext";

const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY || "";

const ROLE_PATHS = {
  admin: "/admin",
  staff: "/staff",
  health_user: "/dashboard",
};

const FEATURES = [
  "Early risk detection algorithms",
  "Secure medical data encryption",
  "Connect with healthcare providers",
  "Personalized health insights",
];

const ROLES = ["Health User", "Healthcare Staff"];

const PW_REQUIREMENTS = [
  { key: "length", label: "12+ characters" },
  { key: "upper", label: "Uppercase letter" },
  { key: "lower", label: "Lowercase letter" },
  { key: "number", label: "Number (0–9)" },
  { key: "special", label: "Special character" },
];

const STRENGTH_META = [
  { label: "Very Weak", color: "bg-red-500", text: "text-red-500" },
  { label: "Weak", color: "bg-orange-400", text: "text-orange-400" },
  { label: "Fair", color: "bg-yellow-400", text: "text-yellow-500" },
  { label: "Strong", color: "bg-green-500", text: "text-green-600" },
  { label: "Very Strong", color: "bg-emerald-500", text: "text-emerald-600" },
];

export default function CreateAccountPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    mi: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Health User",
    phone: "",
    agreeTerms: false,
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Live password checks
  const pwChecks = {
    length: form.password.length >= 12,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
  };
  const pwScore = Object.values(pwChecks).filter(Boolean).length; // 0–5
  const strengthMeta = STRENGTH_META[Math.max(0, pwScore - 1)];

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (form.mi.length > 1) e.mi = "Single character only";
    if (!form.email.includes("@")) e.email = "Invalid email";
    if (!pwChecks.length) e.password = "Minimum 12 characters required";
    else if (!pwChecks.upper) e.password = "Must contain an uppercase letter";
    else if (!pwChecks.lower) e.password = "Must contain a lowercase letter";
    else if (!pwChecks.number) e.password = "Must contain a number";
    else if (!pwChecks.special) e.password = "Must contain a special character";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    if (!form.agreeTerms) e.agreeTerms = "You must agree to the terms";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const e2 = validate();
    if (Object.keys(e2).length) {
      setErrors(e2);
      return;
    }
    if (!captchaToken) {
      setApiError("Please complete the CAPTCHA verification.");
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        firstName: form.firstName,
        lastName: form.lastName,
        mi: form.mi || undefined,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone || undefined,
        captchaToken,
      });
      navigate(ROLE_PATHS[user.role] || "/dashboard");
    } catch (err) {
      let msg;
      if (!err.response) {
        // Network error — backend unreachable
        msg =
          "Cannot connect to server. Make sure the backend is running on the correct port.";
      } else if (err.response.data?.errors?.length) {
        // express-validator array
        msg = err.response.data.errors.map((e) => e.msg).join(" • ");
      } else if (err.response.data?.error) {
        // single error string from backend
        msg = err.response.data.error;
      } else {
        msg = `Registration failed (HTTP ${err.response.status}). Please try again.`;
      }
      console.error(
        "[Register error]",
        err.response?.status,
        err.response?.data || err.message,
      );
      setApiError(msg);
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const field = (id, label, type, icon, placeholder, opts = {}) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <i className={`fa-regular ${icon} text-slate-400 text-sm`}></i>
        </div>
        <input
          type={type}
          value={form[id]}
          onChange={(e) => set(id, e.target.value)}
          placeholder={placeholder}
          className={`block w-full pl-11 pr-${opts.toggle ? "11" : "4"} py-2.5 border ${errors[id] ? "border-red-400" : "border-slate-200"} rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all`}
        />
        {opts.toggle && (
          <button
            type="button"
            onClick={opts.toggle}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
          >
            <i
              className={`fa-solid ${opts.showPw ? "fa-eye-slash" : "fa-eye"} text-sm`}
            ></i>
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
              <span className="font-semibold text-lg text-slate-900">
                Glucogu
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden md:block text-sm text-slate-500">
                Already have an account?
              </span>
              <button
                onClick={() => navigate("/login")}
                className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
              >
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
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Join our health community
              </h2>
              <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                Get accurate AI-driven predictions and personalized health
                insights to manage your journey.
              </p>
              <div className="space-y-4">
                {FEATURES.map((f) => (
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
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="fa-solid fa-star"></i>
                ))}
              </div>
              <p className="text-xs text-slate-600 italic mb-3">
                "This platform helped me identify early signs and take control
                of my health before it was too late."
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <i className="fa-solid fa-user text-primary text-xs"></i>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    Sarah Jenkins
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Health user since 2023
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="lg:col-span-3 p-6 md:p-10">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">
                Create Account
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Start your journey to better health monitoring.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* API Error */}
              {apiError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <i className="fa-solid fa-circle-exclamation text-red-500 mt-0.5"></i>
                  <p className="text-sm text-red-600">{apiError}</p>
                </div>
              )}
              {/* Section 1 */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-primary flex items-center justify-center text-xs">
                    1
                  </span>
                  Personal Information
                </h3>
                <div className="space-y-4">
                  {/* First Name + Last Name row */}
                  <div className="grid grid-cols-2 gap-3">
                    {field(
                      "firstName",
                      "First Name",
                      "text",
                      "fa-user",
                      "e.g. John",
                    )}
                    {field(
                      "lastName",
                      "Last Name",
                      "text",
                      "fa-user",
                      "e.g. Doe",
                    )}
                  </div>
                  {/* Middle Initial */}
                  <div className="w-28">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Middle Initial{" "}
                      <span className="text-slate-400 font-normal">
                        (optional)
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i className="fa-regular fa-user text-slate-400 text-sm"></i>
                      </div>
                      <input
                        type="text"
                        value={form.mi}
                        onChange={(e) =>
                          set("mi", e.target.value.slice(0, 1).toUpperCase())
                        }
                        placeholder="e.g. A"
                        maxLength={1}
                        className={`block w-full pl-11 pr-4 py-2.5 border ${
                          errors.mi ? "border-red-400" : "border-slate-200"
                        } rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all`}
                      />
                    </div>
                    {errors.mi && (
                      <p className="text-xs text-red-500 mt-1">{errors.mi}</p>
                    )}
                  </div>
                  {field(
                    "email",
                    "Email Address",
                    "email",
                    "fa-envelope",
                    "you@example.com",
                  )}
                </div>
              </div>

              {/* Section 2 */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-primary flex items-center justify-center text-xs">
                    2
                  </span>
                  Account Security
                </h3>
                <div className="space-y-4">
                  {/* ── Password field with live strength indicator ── */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i className="fa-regular fa-lock text-slate-400 text-sm"></i>
                      </div>
                      <input
                        type={showPw ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => set("password", e.target.value)}
                        placeholder="Min. 12 characters"
                        className={`block w-full pl-11 pr-11 py-2.5 border ${
                          errors.password
                            ? "border-red-400"
                            : "border-slate-200"
                        } rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        <i
                          className={`fa-solid ${showPw ? "fa-eye-slash" : "fa-eye"} text-sm`}
                        ></i>
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.password}
                      </p>
                    )}

                    {/* Strength bar + requirements — shown once user starts typing */}
                    {form.password.length > 0 && (
                      <div className="mt-2.5 space-y-2">
                        {/* Segmented strength bar */}
                        <div className="flex items-center gap-1.5">
                          <div className="flex gap-1 flex-1">
                            {[1, 2, 3, 4, 5].map((seg) => (
                              <div
                                key={seg}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                  pwScore >= seg
                                    ? strengthMeta.color
                                    : "bg-slate-100"
                                }`}
                              />
                            ))}
                          </div>
                          <span
                            className={`text-[11px] font-semibold whitespace-nowrap ${strengthMeta.text}`}
                          >
                            {strengthMeta.label}
                          </span>
                        </div>

                        {/* Requirement checklist */}
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                          {PW_REQUIREMENTS.map(({ key, label }) => (
                            <div
                              key={key}
                              className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${
                                pwChecks[key]
                                  ? "text-green-600"
                                  : "text-slate-400"
                              }`}
                            >
                              <i
                                className={`fa-solid ${
                                  pwChecks[key]
                                    ? "fa-circle-check"
                                    : "fa-circle-xmark"
                                } text-[11px]`}
                              />
                              {label}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Confirm Password ── */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i className="fa-regular fa-lock text-slate-400 text-sm"></i>
                      </div>
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={(e) => set("confirmPassword", e.target.value)}
                        placeholder="Re-enter password"
                        className={`block w-full pl-11 pr-11 py-2.5 border ${
                          errors.confirmPassword
                            ? "border-red-400"
                            : "border-slate-200"
                        } rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        <i
                          className={`fa-solid ${showConfirm ? "fa-eye-slash" : "fa-eye"} text-sm`}
                        ></i>
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                    {/* Match indicator */}
                    {form.confirmPassword.length > 0 && (
                      <p
                        className={`text-xs mt-1 flex items-center gap-1 ${
                          form.password === form.confirmPassword
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        <i
                          className={`fa-solid ${
                            form.password === form.confirmPassword
                              ? "fa-circle-check"
                              : "fa-circle-xmark"
                          } text-[11px]`}
                        />
                        {form.password === form.confirmPassword
                          ? "Passwords match"
                          : "Passwords do not match"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-primary flex items-center justify-center text-xs">
                    3
                  </span>
                  Account Type
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {ROLES.map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => set("role", r)}
                      className={`p-3 rounded-xl border-2 text-xs font-medium transition-all ${form.role === r ? "border-primary bg-blue-50 text-primary" : "border-slate-200 text-slate-600 hover:border-primary/40"}`}
                    >
                      <i
                        className={`fa-solid ${r === "Health User" ? "fa-user" : r === "Healthcare Staff" ? "fa-user-doctor" : "fa-shield"} block text-lg mb-1`}
                      ></i>
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
                  onChange={(e) => set("agreeTerms", e.target.checked)}
                  className="mt-0.5 accent-primary"
                />
                <span className="text-sm text-slate-600">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-primary hover:underline font-medium"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-primary hover:underline font-medium"
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-xs text-red-500">{errors.agreeTerms}</p>
              )}

              {/* CAPTCHA */}
              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={(token) => setCaptchaToken(token)}
                  onExpired={() => setCaptchaToken(null)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Creating account…
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-primary font-medium hover:text-primary-dark transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
