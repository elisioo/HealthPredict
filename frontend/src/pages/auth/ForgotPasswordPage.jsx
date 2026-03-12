import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";
import stripTags from "../../utils/stripTags";

const PW_REQUIREMENTS = [
  { key: "length", label: "12+ characters" },
  { key: "upper", label: "Uppercase letter" },
  { key: "lower", label: "Lowercase letter" },
  { key: "number", label: "Number (0–9)" },
  { key: "special", label: "Special character" },
];

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Steps: "email" → "code" → "done"
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const pwChecks = {
    length: newPassword.length >= 12,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };
  const pwScore = Object.values(pwChecks).filter(Boolean).length;

  /* Step 1 — request code */
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setSuccess(res.data.message);
      setStep("code");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.errors?.[0]?.msg ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* Step 2 — verify code + set new password */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (pwScore < 5) {
      setError("Password does not meet all requirements.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword({ email, code, newPassword });
      setSuccess(res.data.message);
      setStep("done");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.errors?.[0]?.msg ||
          "Failed to reset password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 font-sans min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8 sm:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-heartbeat text-white text-2xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Glucogu
                </h1>
                <p className="text-xs text-gray-500">Password Recovery</p>
              </div>
            </div>
          </div>

          {/* ─── STEP: email ─── */}
          {step === "email" && (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-envelope text-primary text-2xl"></i>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  Forgot Password?
                </h2>
                <p className="text-gray-500 text-sm">
                  Enter your registered email and we'll send a reset code.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <i className="fa-solid fa-circle-exclamation text-red-500 mt-0.5"></i>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleRequestCode} className="space-y-5">
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
                      onChange={(e) => setEmail(stripTags(e.target.value))}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Sending…
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      Send Reset Code
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ─── STEP: code + new password ─── */}
          {step === "code" && (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-key text-green-600 text-2xl"></i>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  Enter Reset Code
                </h2>
                <p className="text-gray-500 text-sm">
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-gray-700">{email}</span>
                </p>
              </div>

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2">
                  <i className="fa-solid fa-circle-check text-green-500 mt-0.5"></i>
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <i className="fa-solid fa-circle-exclamation text-red-500 mt-0.5"></i>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-5">
                {/* OTP Code */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Reset Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    required
                    className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="000000"
                  />
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <i className="fa-solid fa-lock text-gray-400"></i>
                    </div>
                    <input
                      type={showPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <i
                        className={`fa-solid ${showPw ? "fa-eye-slash" : "fa-eye"}`}
                      ></i>
                    </button>
                  </div>

                  {/* Password strength indicators */}
                  {newPassword && (
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      {PW_REQUIREMENTS.map((r) => (
                        <div
                          key={r.key}
                          className="flex items-center gap-1.5 text-xs"
                        >
                          <i
                            className={`fa-solid ${pwChecks[r.key] ? "fa-circle-check text-green-500" : "fa-circle-xmark text-gray-300"}`}
                          ></i>
                          <span
                            className={
                              pwChecks[r.key]
                                ? "text-green-700"
                                : "text-gray-500"
                            }
                          >
                            {r.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <i className="fa-solid fa-lock text-gray-400"></i>
                    </div>
                    <input
                      type={showPw ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Confirm new password"
                    />
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      Passwords do not match
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Resetting…
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-shield-halved"></i>
                      Reset Password
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setError("");
                    setSuccess("");
                  }}
                  className="w-full text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  ← Use a different email
                </button>
              </form>
            </>
          )}

          {/* ─── STEP: done ─── */}
          {step === "done" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-circle-check text-green-600 text-3xl"></i>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Password Reset!
              </h2>
              <p className="text-gray-500 text-sm mb-6">{success}</p>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-right-to-bracket"></i>
                Go to Sign In
              </button>
            </div>
          )}

          {/* Back to login */}
          {step !== "done" && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm text-gray-500 hover:text-primary transition-colors"
              >
                <i className="fa-solid fa-arrow-left mr-1"></i>
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
