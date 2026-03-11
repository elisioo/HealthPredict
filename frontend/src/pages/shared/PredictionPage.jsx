import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { NAV_BY_ROLE } from "../../components/navConfig";
import { useAuth } from "../../context/AuthContext";
import { predictionApi, profileApi } from "../../api/authApi";

// ── Form field definitions ──────────────────────────────────────────────────

const numericFields = [
  {
    name: "age",
    label: "Age",
    icon: "fa-calendar-days",
    placeholder: "35",
    min: 1,
    max: 120,
    step: 1,
    hint: "Age in years",
  },
  {
    name: "bmi",
    label: "BMI",
    icon: "fa-weight-scale",
    placeholder: "25.0",
    min: 10,
    max: 100,
    step: 0.1,
    hint: "Body Mass Index (kg/m²)",
  },
  {
    name: "HbA1c_level",
    label: "HbA1c Level",
    icon: "fa-vial",
    placeholder: "5.5",
    min: 3,
    max: 15,
    step: 0.1,
    hint: "Glycated haemoglobin (%)",
  },
  {
    name: "blood_glucose_level",
    label: "Blood Glucose Level",
    icon: "fa-droplet",
    placeholder: "100",
    min: 50,
    max: 500,
    step: 1,
    hint: "Blood glucose level (mg/dL)",
  },
];

const SMOKING_OPTIONS = [
  { value: "", label: "Select smoking history…" },
  { value: "never", label: "Never smoked" },
  { value: "former", label: "Former smoker" },
  { value: "current", label: "Current smoker" },
  { value: "No Info", label: "No information" },
];

const INITIAL_FORM = {
  gender: "",
  age: "",
  hypertension: "",
  heart_disease: "",
  smoking_history: "",
  bmi: "",
  HbA1c_level: "",
  blood_glucose_level: "",
};

function PredictionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-fill from health profile on mount
  useEffect(() => {
    profileApi
      .getHealthProfile()
      .then(({ data }) => {
        const p = data.profile;
        if (!p) return;

        // Map smoking_status (profile) → smoking_history (model)
        const smokingMap = {
          never: "never",
          former: "former",
          current: "current",
        };

        setFormData((prev) => ({
          ...prev,
          ...(p.bmi != null ? { bmi: String(p.bmi) } : {}),
          ...(p.gender ? { gender: p.gender } : {}),
          ...(p.smoking_status
            ? { smoking_history: smokingMap[p.smoking_status] ?? "No Info" }
            : {}),
          // Derive age from date_of_birth if available
          ...(p.date_of_birth
            ? {
                age: String(
                  new Date().getFullYear() -
                    new Date(p.date_of_birth).getFullYear(),
                ),
              }
            : {}),
        }));
      })
      .catch(() => {
        // Silently ignore — profile may not exist yet
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    const missing = Object.entries(INITIAL_FORM)
      .filter(([k]) => formData[k] === "" || formData[k] === undefined)
      .map(([k]) => k);
    if (missing.length > 0) {
      setError("Please fill in all fields before submitting.");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await predictionApi.predict({
        gender: formData.gender,
        age: Number(formData.age),
        hypertension: Number(formData.hypertension),
        heart_disease: Number(formData.heart_disease),
        smoking_history: formData.smoking_history,
        bmi: Number(formData.bmi),
        HbA1c_level: Number(formData.HbA1c_level),
        blood_glucose_level: Number(formData.blood_glucose_level),
      });

      navigate("/result", {
        state: {
          riskLevel: data.risk_level,
          probability: data.probability,
          diabetesResult: data.diabetes_result,
          predictionId: data.prediction_id,
        },
      });
    } catch (err) {
      const msg =
        err.response?.data?.error || "Prediction failed. Please try again.";
      setError(msg);
      setIsLoading(false);
    }
  };

  const roleNav =
    user?.role === "admin"
      ? NAV_BY_ROLE.admin
      : user?.role === "staff"
        ? NAV_BY_ROLE.staff
        : NAV_BY_ROLE.patient;

  return (
    <DashboardLayout
      navItems={roleNav}
      title="Diabetes Risk Prediction"
      subtitle="Enter health data for assessment"
    >
      <div className="max-w-4xl mx-auto">
        {/* Intro */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
            Assess Your Diabetes Risk
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Enter your health information below to receive a personalized
            diabetes risk assessment powered by our trained machine learning
            model.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-10">
          {!isLoading ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Error banner */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
                  <i className="fa-solid fa-circle-exclamation text-red-500 mt-0.5 flex-shrink-0"></i>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* ── Row 1: Gender + Smoking ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gender */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <i className="fa-solid fa-venus-mars text-primary text-xs"></i>
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900 bg-white"
                  >
                    <option value="">Select gender…</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Smoking History */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <i className="fa-solid fa-smoking text-primary text-xs"></i>
                    Smoking History
                  </label>
                  <select
                    name="smoking_history"
                    value={formData.smoking_history}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900 bg-white"
                  >
                    {SMOKING_OPTIONS.map((o) => (
                      <option
                        key={o.value}
                        value={o.value}
                        disabled={o.value === ""}
                      >
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ── Row 2: Hypertension + Heart Disease ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hypertension */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <i className="fa-solid fa-heart-pulse text-primary text-xs"></i>
                    Hypertension
                  </label>
                  <select
                    name="hypertension"
                    value={formData.hypertension}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900 bg-white"
                  >
                    <option value="">Select…</option>
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                  <p className="text-xs text-gray-500">
                    Do you have high blood pressure?
                  </p>
                </div>

                {/* Heart Disease */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <i className="fa-solid fa-heart text-primary text-xs"></i>
                    Heart Disease
                  </label>
                  <select
                    name="heart_disease"
                    value={formData.heart_disease}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900 bg-white"
                  >
                    <option value="">Select…</option>
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                  <p className="text-xs text-gray-500">
                    Have you been diagnosed with heart disease?
                  </p>
                </div>
              </div>

              {/* ── Numeric fields ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {numericFields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <i
                        className={`fa-solid ${field.icon} text-primary text-xs`}
                      ></i>
                      {field.label}
                    </label>
                    <input
                      type="number"
                      name={field.name}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      placeholder={field.placeholder}
                      value={formData[field.name]}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    />
                    <p className="text-xs text-gray-500">{field.hint}</p>
                  </div>
                ))}
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-primary text-white font-semibold py-4 px-6 rounded-xl hover:bg-primary-dark transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 text-base"
                >
                  <i className="fa-solid fa-brain"></i>
                  <span>Predict Risk</span>
                </button>
              </div>
            </form>
          ) : (
            /* Loading State */
            <div className="py-16">
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="text-center">
                  <p className="text-gray-700 font-medium text-lg mb-1">
                    Analyzing Your Data
                  </p>
                  <p className="text-gray-500 text-sm">
                    This will only take a moment...
                  </p>
                </div>
                <div className="flex gap-2">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}s` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {[
            {
              icon: "fa-shield-halved",
              title: "Secure & Private",
              desc: "Your data is encrypted and protected",
            },
            {
              icon: "fa-stethoscope",
              title: "Clinically Validated",
              desc: "Based on medical research data",
            },
            {
              icon: "fa-clock",
              title: "Instant Results",
              desc: "Get your risk assessment quickly",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-blue-50 rounded-xl p-5 border border-blue-100"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className={`fa-solid ${card.icon} text-white text-sm`}></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    {card.title}
                  </h3>
                  <p className="text-xs text-gray-600">{card.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default PredictionPage;
