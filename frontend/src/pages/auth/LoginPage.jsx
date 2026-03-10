import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { useAuth } from "../../context/AuthContext";

const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY || "";

const ROLE_PATHS = {
  admin: "/admin",
  staff: "/staff",
  health_user: "/dashboard",
};

/* ------------------------------------------------------------------ */
/* Lockout countdown hook                                               */
/* ------------------------------------------------------------------ */
function useCountdown(targetIso) {
  const [secsLeft, setSecsLeft] = useState(0);

  useEffect(() => {
    if (!targetIso) {
      setSecsLeft(0);
      return;
    }
    const tick = () => {
      const diff = Math.max(
        0,
        Math.ceil((new Date(targetIso) - Date.now()) / 1000),
      );
      setSecsLeft(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return secsLeft;
}

function fmtCountdown(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;
  const recaptchaRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(null); // ISO string or null

  const countdown = useCountdown(lockedUntil);
  const isLocked = countdown > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isLocked) return; // block submit while locked

    if (!captchaToken) {
      setError("Please complete the CAPTCHA verification.");
      return;
    }

    setLoading(true);
    try {
      const user = await login({ email, password, captchaToken });

      const dest = from || ROLE_PATHS[user.role] || "/dashboard";
      navigate(dest, { replace: true });
    } catch (err) {
      // HTTP 423 = account locked
      if (err.response?.status === 423) {
        const data = err.response.data;
        setLockedUntil(data.locked_until || null);
        setError(""); // lockout banner replaces error text
      } else {
        const msg =
          err.response?.data?.error ||
          err.response?.data?.errors?.[0]?.msg ||
          "Login failed. Please check your credentials.";
        setError(msg);
      }
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50font-sans min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8 sm:p-10">
          {/* Logo Section */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-heartbeat text-white text-2xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Glucogu
                </h1>
                <p className="text-xs text-gray-500">powered by LR Model</p>
              </div>
            </div>
          </div>

          {/* Login Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-sm">
              Sign in to access your account
            </p>
          </div>

          {/* Lockout Banner */}
          {isLocked && (
            <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <i className="fa-solid fa-lock text-orange-500 text-base"></i>
                <span className="text-sm font-semibold text-orange-700">
                  Account Temporarily Locked
                </span>
              </div>
              <p className="text-xs text-orange-600 mb-2">
                Too many failed login attempts. Please wait before trying again.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-orange-200 rounded-full h-2 overflow-hidden">
                  {/* progress bar shrinks as countdown ticks */}
                </div>
                <span className="text-sm font-mono font-bold text-orange-700 min-w-[48px] text-right">
                  {fmtCountdown(countdown)}
                </span>
              </div>
              <p className="text-xs text-orange-500 mt-1">
                Contact an administrator to unlock immediately.
              </p>
            </div>
          )}

          {/* Error Alert */}
          {!isLocked && error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <i className="fa-solid fa-circle-exclamation text-red-500 mt-0.5"></i>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-regular fa-envelope text-gray-400"></i>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-lock text-gray-400"></i>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <i
                    className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                  ></i>
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <a
                href="#"
                className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* CAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={(token) => setCaptchaToken(token)}
                onExpired={() => setCaptchaToken(null)}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing in…
                </>
              ) : isLocked ? (
                <>
                  <i className="fa-solid fa-lock"></i>
                  Locked — {fmtCountdown(countdown)}
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Register */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-primary hover:text-primary-dark font-semibold transition-colors ml-1"
              >
                Create Account
              </button>
            </p>
          </div>

          {/* Footer note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              <i className="fa-solid fa-shield-halved mr-1 text-primary"></i>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
