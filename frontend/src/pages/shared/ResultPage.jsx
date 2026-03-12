import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { NAV_BY_ROLE } from "../../components/navConfig";
import { useAuth } from "../../context/AuthContext";
import downloadPredictionPDF from "../../utils/downloadPredictionPDF";

// Risk configuration by level
const riskConfig = {
  high: {
    label: "HIGH",
    sublabel: "RISK",
    borderColor: "border-red-500",
    bgColor: "bg-red-50",
    textColor: "text-red-600",
    message:
      "Based on your health profile, you have a high probability of developing diabetes. This assessment is based on your BMI, blood glucose, HbA1c, and other health indicators. Please consult a healthcare professional as soon as possible.",
  },
  moderate: {
    label: "MODERATE",
    sublabel: "RISK",
    borderColor: "border-yellow-500",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-600",
    message:
      "Your health profile indicates a moderate diabetes risk. Consider making lifestyle improvements and scheduling regular check-ups with your healthcare provider to monitor your progress.",
  },
  low: {
    label: "LOW",
    sublabel: "RISK",
    borderColor: "border-green-500",
    bgColor: "bg-green-50",
    textColor: "text-green-600",
    message:
      "Great news! Your health profile indicates a low risk of developing diabetes. Maintain your healthy lifestyle and continue with regular medical check-ups.",
  },
};

const recommendationsByRisk = {
  high: [
    "Consult a healthcare provider urgently — within the next 1–2 weeks",
    "Undergo a formal fasting glucose and HbA1c blood test",
    "Begin a structured diet plan limiting refined sugars and processed foods",
    "Aim for at least 150 minutes of moderate aerobic exercise per week",
    "Monitor your blood glucose levels regularly at home",
  ],
  moderate: [
    "Schedule a check-up with your healthcare provider in the next month",
    "Reduce intake of sugary drinks and high-glycaemic foods",
    "Increase daily physical activity — walking 30 minutes a day is a great start",
    "Maintain a healthy weight through balanced nutrition",
    "Track your blood pressure regularly",
  ],
  low: [
    "Continue your current healthy lifestyle habits",
    "Get an annual general health check-up",
    "Stay hydrated and maintain a balanced diet",
    "Stay physically active and manage stress levels",
    "Re-assess your diabetes risk annually or if your health status changes",
  ],
};

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Real data passed from PredictionPage via navigate state
  const riskLevel = location.state?.riskLevel ?? "low";
  const probability = location.state?.probability ?? null; // number, e.g. 42.01
  const diabetesResult = location.state?.diabetesResult ?? null; // 0 or 1

  const config = riskConfig[riskLevel] ?? riskConfig.low;
  const recommendations =
    recommendationsByRisk[riskLevel] ?? recommendationsByRisk.low;

  const roleNav =
    user?.role === "admin"
      ? NAV_BY_ROLE.admin
      : user?.role === "staff"
        ? NAV_BY_ROLE.staff
        : NAV_BY_ROLE.patient;

  const dashboardPath =
    user?.role === "admin"
      ? "/admin/dashboard"
      : user?.role === "staff"
        ? "/staff/dashboard"
        : "/dashboard";

  return (
    <DashboardLayout
      navItems={roleNav}
      title="Prediction Results"
      subtitle="Your diabetes risk assessment is complete"
    >
      <div className="flex items-center justify-center py-4">
        <div className="w-full max-w-2xl">
          {/* Result Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 sm:px-8 py-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-chart-line text-primary text-xl"></i>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Prediction Results
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Your diabetes risk assessment is complete
              </p>
            </div>

            {/* Risk Section */}
            <div className="px-6 sm:px-8 py-8 text-center">
              {/* Risk Badge */}
              <div
                className={`inline-flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 ${config.bgColor} border-4 ${config.borderColor} rounded-full mb-6`}
              >
                <div className="text-center">
                  <div
                    className={`text-2xl sm:text-3xl font-bold ${config.textColor} mb-1`}
                  >
                    {config.label}
                  </div>
                  <div className={`text-sm font-medium ${config.textColor}`}>
                    {config.sublabel}
                  </div>
                </div>
              </div>

              {/* Probability — from real model output */}
              <div className="mb-8">
                <div
                  className={`text-5xl sm:text-6xl font-bold mb-2 ${config.textColor}`}
                >
                  {probability !== null ? `${probability}%` : "—"}
                </div>
                <p className="text-gray-600 text-lg">Model Probability Score</p>
                {diabetesResult !== null && (
                  <p
                    className={`mt-2 text-sm font-medium ${diabetesResult === 1 ? "text-red-600" : "text-green-600"}`}
                  >
                    {diabetesResult === 1
                      ? "⚠ Diabetes Indicated by Model"
                      : "✓ No Diabetes Indicated by Model"}
                  </p>
                )}
              </div>

              {/* Explanation */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <i className="fa-solid fa-info-circle text-primary mr-2"></i>
                  What This Means
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {config.message}
                </p>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <i className="fa-solid fa-user-doctor text-primary mr-2"></i>
                  Medical Recommendations
                </h3>
                <ul className="space-y-3">
                  {recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start">
                      <i className="fa-solid fa-check text-green-500 mt-1 mr-3 flex-shrink-0"></i>
                      <span className="text-gray-700 text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() =>
                    downloadPredictionPDF({
                      riskLevel,
                      probability,
                      diabetesResult,
                      patientName: user?.fullName || "",
                    })
                  }
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-file-pdf"></i>
                  Download PDF
                </button>
                <button
                  onClick={() => navigate("/prediction")}
                  className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-medium py-3 px-8 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-plus"></i>
                  New Prediction
                </button>
                <button
                  onClick={() => navigate(dashboardPath)}
                  className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-8 rounded-xl border border-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-house"></i>
                  Back to Dashboard
                </button>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-gray-50 px-6 sm:px-8 py-4 border-t border-gray-100">
              <div className="flex items-center justify-center text-sm text-gray-500 gap-2 text-center">
                <i className="fa-solid fa-shield-alt text-primary flex-shrink-0"></i>
                <span>
                  This assessment is for informational purposes only and should
                  not replace professional medical advice.
                </span>
              </div>
            </div>
          </div>

          {/* View History */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate("/history")}
              className="flex items-center justify-center gap-2 text-gray-600 hover:text-primary transition-colors text-sm"
            >
              <i className="fa-solid fa-clock-rotate-left"></i>
              View Prediction History
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ResultPage;
