import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import { NAV_BY_ROLE } from "../components/navConfig";

export default function MLModelPage() {
  return (
    <DashboardLayout
      navItems={NAV_BY_ROLE.admin}
      title="ML Model"
      subtitle="Model management and performance"
    >
      <div className="space-y-6">
        {/* Model Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Current Model
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Algorithm</p>
              <p className="text-lg font-bold text-gray-900">
                Logistic Regression
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Accuracy</p>
              <p className="text-lg font-bold text-green-600">94.8%</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Last Trained</p>
              <p className="text-lg font-bold text-gray-900">Mar 1, 2026</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Input Features
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              "Pregnancies",
              "Glucose",
              "Blood Pressure",
              "Skin Thickness",
              "Insulin",
              "BMI",
              "Diabetes Pedigree",
              "Age",
            ].map((f) => (
              <div
                key={f}
                className="bg-gray-50 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 border border-gray-200"
              >
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Placeholder */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <i className="fa-solid fa-flask text-yellow-500 text-2xl mb-2"></i>
          <p className="text-yellow-800 font-medium">
            Model training pipeline coming soon
          </p>
          <p className="text-yellow-600 text-sm mt-1">
            You'll be able to retrain, compare versions, and deploy models here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
